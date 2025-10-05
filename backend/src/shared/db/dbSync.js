/**
 * Database Synchronization Utility
 * Keeps PostgreSQL and MongoDB in sync during migration period
 * Writes to MongoDB by default, with optional PostgreSQL sync
 */

const { sequelize } = require('./database');
const mongoAdapter = require('./mongoAdapter');
const mongoModels = require('./models/mongodb');

class DatabaseSyncService {
  constructor() {
    this.isEnabled = process.env.DB_SYNC_ENABLED !== 'false';
    this.syncDirection = process.env.DB_SYNC_DIRECTION || 'mongo-primary'; // 'mongo-primary', 'postgres-primary', 'bidirectional'
    this.logLevel = process.env.DB_SYNC_LOG_LEVEL || 'info';
    this.failSilently = process.env.DB_SYNC_FAIL_SILENTLY === 'true';
  }

  /**
   * Sync data from MongoDB to PostgreSQL
   */
  async syncToPostgres(modelName, operation, data, options = {}) {
    if (!this.isEnabled || this.syncDirection === 'mongo-only') {
      return;
    }

    try {
      // Get the corresponding Sequelize model
      const sequelizeModels = require('./models');
      const SequelizeModel = sequelizeModels[modelName];
      
      if (!SequelizeModel) {
        this.log('warn', `Sequelize model ${modelName} not found for sync`);
        return;
      }

      switch (operation) {
        case 'create':
          await this._syncCreate(SequelizeModel, data);
          break;
        case 'update':
          await this._syncUpdate(SequelizeModel, data, options);
          break;
        case 'delete':
          await this._syncDelete(SequelizeModel, options);
          break;
        case 'bulkCreate':
          await this._syncBulkCreate(SequelizeModel, data);
          break;
        default:
          this.log('warn', `Unsupported sync operation: ${operation}`);
      }

      this.log('debug', `Synced ${operation} operation for ${modelName} to PostgreSQL`);
    } catch (error) {
      this.log('error', `Failed to sync ${operation} for ${modelName} to PostgreSQL:`, error);
      if (!this.failSilently) {
        throw error;
      }
    }
  }

  /**
   * Sync data from PostgreSQL to MongoDB
   */
  async syncToMongo(modelName, operation, data, options = {}) {
    if (!this.isEnabled || this.syncDirection === 'postgres-only') {
      return;
    }

    try {
      const MongoModel = mongoModels[modelName];
      
      if (!MongoModel) {
        this.log('warn', `MongoDB model ${modelName} not found for sync`);
        return;
      }

      switch (operation) {
        case 'create':
          await this._syncCreateMongo(MongoModel, data);
          break;
        case 'update':
          await this._syncUpdateMongo(MongoModel, data, options);
          break;
        case 'delete':
          await this._syncDeleteMongo(MongoModel, options);
          break;
        case 'bulkCreate':
          await this._syncBulkCreateMongo(MongoModel, data);
          break;
        default:
          this.log('warn', `Unsupported sync operation: ${operation}`);
      }

      this.log('debug', `Synced ${operation} operation for ${modelName} to MongoDB`);
    } catch (error) {
      this.log('error', `Failed to sync ${operation} for ${modelName} to MongoDB:`, error);
      if (!this.failSilently) {
        throw error;
      }
    }
  }

  // Private sync methods for PostgreSQL
  async _syncCreate(SequelizeModel, data) {
    const cleanData = this._cleanDataForSequelize(data);
    await SequelizeModel.create(cleanData);
  }

  async _syncUpdate(SequelizeModel, data, options) {
    const cleanData = this._cleanDataForSequelize(data);
    const where = options.where || { id: data.id || data._id };
    await SequelizeModel.update(cleanData, { where });
  }

  async _syncDelete(SequelizeModel, options) {
    const where = options.where || { id: options.id };
    await SequelizeModel.destroy({ where });
  }

  async _syncBulkCreate(SequelizeModel, dataArray) {
    const cleanDataArray = dataArray.map(data => this._cleanDataForSequelize(data));
    await SequelizeModel.bulkCreate(cleanDataArray, { ignoreDuplicates: true });
  }

  // Private sync methods for MongoDB
  async _syncCreateMongo(MongoModel, data) {
    const cleanData = this._cleanDataForMongo(data);
    await MongoModel.create(cleanData);
  }

  async _syncUpdateMongo(MongoModel, data, options) {
    const cleanData = this._cleanDataForMongo(data);
    const where = options.where || { _id: data.id || data._id };
    await MongoModel.updateOne(where, cleanData);
  }

  async _syncDeleteMongo(MongoModel, options) {
    const where = options.where || { _id: options.id };
    await MongoModel.deleteOne(where);
  }

  async _syncBulkCreateMongo(MongoModel, dataArray) {
    const cleanDataArray = dataArray.map(data => this._cleanDataForMongo(data));
    await MongoModel.insertMany(cleanDataArray, { ordered: false });
  }

  /**
   * Clean data for Sequelize (remove MongoDB-specific fields)
   */
  _cleanDataForSequelize(data) {
    const cleanData = { ...data };
    
    // Convert MongoDB _id to Sequelize id
    if (cleanData._id && !cleanData.id) {
      cleanData.id = cleanData._id;
    }
    delete cleanData._id;
    delete cleanData.__v;
    
    // Remove Mongoose virtuals and methods
    Object.keys(cleanData).forEach(key => {
      if (typeof cleanData[key] === 'function') {
        delete cleanData[key];
      }
    });

    return cleanData;
  }

  /**
   * Clean data for MongoDB (remove Sequelize-specific fields)
   */
  _cleanDataForMongo(data) {
    const cleanData = { ...data };
    
    // Convert Sequelize id to MongoDB _id if needed
    if (cleanData.id && !cleanData._id) {
      cleanData._id = cleanData.id;
    }
    
    return cleanData;
  }

  /**
   * Migrate data from PostgreSQL to MongoDB
   */
  async migrateToMongo(modelName, batchSize = 1000) {
    try {
      this.log('info', `Starting migration of ${modelName} from PostgreSQL to MongoDB`);
      
      const sequelizeModels = require('./models');
      const SequelizeModel = sequelizeModels[modelName];
      const MongoModel = mongoModels[modelName];
      
      if (!SequelizeModel || !MongoModel) {
        throw new Error(`Model ${modelName} not found in one or both databases`);
      }

      // Get total count
      const totalCount = await SequelizeModel.count();
      let migratedCount = 0;
      let offset = 0;

      this.log('info', `Found ${totalCount} records to migrate for ${modelName}`);

      while (offset < totalCount) {
        // Fetch batch from PostgreSQL
        const batch = await SequelizeModel.findAll({
          limit: batchSize,
          offset: offset,
          raw: true
        });

        if (batch.length === 0) break;

        // Clean and insert into MongoDB
        const cleanBatch = batch.map(record => this._cleanDataForMongo(record));
        
        try {
          await MongoModel.insertMany(cleanBatch, { ordered: false });
          migratedCount += batch.length;
        } catch (error) {
          // Handle duplicate key errors gracefully
          if (error.code === 11000) {
            this.log('debug', `Some duplicates found in batch for ${modelName}, continuing...`);
            migratedCount += batch.length; // Assume most were inserted
          } else {
            throw error;
          }
        }

        offset += batchSize;
        this.log('info', `Migrated ${migratedCount}/${totalCount} records for ${modelName}`);
      }

      this.log('info', `Migration completed for ${modelName}: ${migratedCount} records`);
      return migratedCount;
    } catch (error) {
      this.log('error', `Migration failed for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Migrate all models from PostgreSQL to MongoDB
   */
  async migrateAllToMongo() {
    const modelNames = [
      'User', 'College', 'Department', 'Student', 'Faculty', 'Section', 
      'Assignment', 'Course', 'Attendance', 'Fee', 'Transaction'
    ];

    const results = {};
    
    for (const modelName of modelNames) {
      try {
        results[modelName] = await this.migrateToMongo(modelName);
      } catch (error) {
        this.log('error', `Failed to migrate ${modelName}:`, error);
        results[modelName] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Verify data consistency between databases
   */
  async verifyConsistency(modelName) {
    try {
      const sequelizeModels = require('./models');
      const SequelizeModel = sequelizeModels[modelName];
      const MongoModel = mongoModels[modelName];
      
      if (!SequelizeModel || !MongoModel) {
        throw new Error(`Model ${modelName} not found in one or both databases`);
      }

      const pgCount = await SequelizeModel.count();
      const mongoCount = await MongoModel.countDocuments();

      const consistency = {
        model: modelName,
        postgresql: pgCount,
        mongodb: mongoCount,
        consistent: pgCount === mongoCount,
        difference: mongoCount - pgCount
      };

      this.log('info', `Consistency check for ${modelName}:`, consistency);
      return consistency;
    } catch (error) {
      this.log('error', `Consistency check failed for ${modelName}:`, error);
      return { model: modelName, error: error.message };
    }
  }

  /**
   * Logging utility
   */
  log(level, message, data = null) {
    if (this.logLevel === 'silent') return;
    
    const shouldLog = 
      (this.logLevel === 'error' && level === 'error') ||
      (this.logLevel === 'warn' && ['error', 'warn'].includes(level)) ||
      (this.logLevel === 'info' && ['error', 'warn', 'info'].includes(level)) ||
      (this.logLevel === 'debug');

    if (shouldLog) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [DB-SYNC] [${level.toUpperCase()}] ${message}`;
      
      if (data) {
        console.log(logMessage, data);
      } else {
        console.log(logMessage);
      }
    }
  }

  /**
   * Enable/disable sync
   */
  enable() {
    this.isEnabled = true;
    this.log('info', 'Database synchronization enabled');
  }

  disable() {
    this.isEnabled = false;
    this.log('info', 'Database synchronization disabled');
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      direction: this.syncDirection,
      logLevel: this.logLevel,
      failSilently: this.failSilently
    };
  }
}

// Create singleton instance
const dbSync = new DatabaseSyncService();

// Export both the class and instance
module.exports = {
  DatabaseSyncService,
  dbSync
};

// Also export as default for convenience
module.exports.default = dbSync;
