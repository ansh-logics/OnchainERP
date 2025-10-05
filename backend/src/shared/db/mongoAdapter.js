/**
 * MongoDB Database Adapter
 * Provides a Sequelize-compatible interface for MongoDB operations
 * This allows seamless migration from Sequelize to MongoDB without changing controller code
 */

const mongoose = require('mongoose');

// Import all MongoDB models
const mongoModels = require('./models/mongodb');

class MongoDBAdapter {
  constructor() {
    this.models = mongoModels;
    this.isConnected = false;
  }

  /**
   * Get model by name (supports both Sequelize and MongoDB model access)
   */
  getModel(modelName) {
    // Handle both singular and plural forms
    const possibleNames = [
      modelName,
      modelName.charAt(0).toUpperCase() + modelName.slice(1),
      modelName.toLowerCase(),
      modelName.toUpperCase()
    ];

    for (const name of possibleNames) {
      if (this.models[name]) {
        return this.models[name];
      }
    }

    console.warn(`MongoDB model '${modelName}' not found`);
    return null;
  }

  /**
   * Sequelize Op compatibility for MongoDB
   */
  get Op() {
    return {
      eq: (value) => ({ $eq: value }),
      ne: (value) => ({ $ne: value }),
      gte: (value) => ({ $gte: value }),
      gt: (value) => ({ $gt: value }),
      lte: (value) => ({ $lte: value }),
      lt: (value) => ({ $lt: value }),
      not: (value) => ({ $ne: value }),
      is: (value) => ({ $eq: value }),
      in: (values) => ({ $in: values }),
      notIn: (values) => ({ $nin: values }),
      like: (pattern) => new RegExp(pattern.replace(/%/g, '.*'), 'i'),
      notLike: (pattern) => ({ $not: new RegExp(pattern.replace(/%/g, '.*'), 'i') }),
      iLike: (pattern) => new RegExp(pattern.replace(/%/g, '.*'), 'i'),
      notILike: (pattern) => ({ $not: new RegExp(pattern.replace(/%/g, '.*'), 'i') }),
      regexp: (pattern) => new RegExp(pattern),
      notRegexp: (pattern) => ({ $not: new RegExp(pattern) }),
      iRegexp: (pattern) => new RegExp(pattern, 'i'),
      notIRegexp: (pattern) => ({ $not: new RegExp(pattern, 'i') }),
      between: (a, b) => ({ $gte: a, $lte: b }),
      notBetween: (a, b) => ({ $not: { $gte: a, $lte: b } }),
      overlap: (values) => ({ $in: values }),
      contains: (values) => ({ $all: values }),
      contained: (values) => ({ $in: values }),
      adjacent: (value) => ({ $near: value }),
      strictLeft: (value) => ({ $lt: value }),
      strictRight: (value) => ({ $gt: value }),
      noExtendRight: (value) => ({ $lte: value }),
      noExtendLeft: (value) => ({ $gte: value }),
      and: (conditions) => ({ $and: conditions }),
      or: (conditions) => ({ $or: conditions }),
      any: (values) => ({ $in: values }),
      all: (values) => ({ $all: values })
    };
  }

  /**
   * Convert Sequelize where conditions to MongoDB queries
   */
  convertWhereClause(where) {
    if (!where) return {};
    
    const mongoWhere = {};
    
    for (const [key, value] of Object.entries(where)) {
      if (key === '$and' || key === '$or') {
        mongoWhere[key] = value.map(condition => this.convertWhereClause(condition));
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        // Handle Sequelize operators
        if (value.$eq !== undefined) mongoWhere[key] = value.$eq;
        else if (value.$ne !== undefined) mongoWhere[key] = { $ne: value.$ne };
        else if (value.$in !== undefined) mongoWhere[key] = { $in: value.$in };
        else if (value.$nin !== undefined) mongoWhere[key] = { $nin: value.$nin };
        else if (value.$gt !== undefined) mongoWhere[key] = { $gt: value.$gt };
        else if (value.$gte !== undefined) mongoWhere[key] = { $gte: value.$gte };
        else if (value.$lt !== undefined) mongoWhere[key] = { $lt: value.$lt };
        else if (value.$lte !== undefined) mongoWhere[key] = { $lte: value.$lte };
        else if (value.$like !== undefined) {
          const pattern = value.$like.replace(/%/g, '.*');
          mongoWhere[key] = new RegExp(pattern, 'i');
        }
        else mongoWhere[key] = value;
      } else {
        mongoWhere[key] = value;
      }
    }
    
    return mongoWhere;
  }

  /**
   * Convert Sequelize include options to MongoDB populate
   */
  convertIncludeToPopulate(include) {
    if (!include || !Array.isArray(include)) return [];
    
    return include.map(inc => {
      const populate = {};
      
      if (inc.model) {
        // Convert model reference to path
        const modelName = typeof inc.model === 'string' ? inc.model : inc.model.name;
        populate.path = inc.as ? `${inc.as}Id` : `${modelName.toLowerCase()}Id`;
        populate.model = modelName;
      }
      
      if (inc.attributes) {
        populate.select = Array.isArray(inc.attributes) ? inc.attributes.join(' ') : inc.attributes;
      }
      
      if (inc.where) {
        populate.match = this.convertWhereClause(inc.where);
      }
      
      return populate;
    });
  }

  /**
   * Execute a "Sequelize-style" query using MongoDB
   */
  async executeQuery(modelName, method, options = {}) {
    const model = this.getModel(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    try {
      switch (method) {
        case 'findAll':
          return await this._handleFindAll(model, options);
        case 'findOne':
          return await this._handleFindOne(model, options);
        case 'findByPk':
          return await model.findById(options.id || options);
        case 'create':
          return await model.create(options);
        case 'bulkCreate':
          return await model.insertMany(options.data || options);
        case 'update':
          return await model.updateMany(
            this.convertWhereClause(options.where),
            options.data || options.values
          );
        case 'destroy':
          return await model.deleteMany(this.convertWhereClause(options.where));
        case 'count':
          return await model.countDocuments(this.convertWhereClause(options.where));
        default:
          throw new Error(`Method ${method} not supported`);
      }
    } catch (error) {
      console.error(`MongoDB operation failed:`, error);
      throw error;
    }
  }

  async _handleFindAll(model, options) {
    let query = model.find();
    
    if (options.where) {
      query = query.where(this.convertWhereClause(options.where));
    }
    
    if (options.include) {
      const populations = this.convertIncludeToPopulate(options.include);
      populations.forEach(pop => {
        query = query.populate(pop);
      });
    }
    
    if (options.order) {
      const sortObj = {};
      options.order.forEach(([field, direction]) => {
        sortObj[field] = direction === 'DESC' ? -1 : 1;
      });
      query = query.sort(sortObj);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.skip(options.offset);
    }
    
    if (options.attributes) {
      const select = Array.isArray(options.attributes) ? options.attributes.join(' ') : options.attributes;
      query = query.select(select);
    }
    
    return await query;
  }

  async _handleFindOne(model, options) {
    let query = model.findOne();
    
    if (options.where) {
      query = query.where(this.convertWhereClause(options.where));
    }
    
    if (options.include) {
      const populations = this.convertIncludeToPopulate(options.include);
      populations.forEach(pop => {
        query = query.populate(pop);
      });
    }
    
    if (options.attributes) {
      const select = Array.isArray(options.attributes) ? options.attributes.join(' ') : options.attributes;
      query = query.select(select);
    }
    
    return await query;
  }

  /**
   * Transaction support (basic implementation)
   */
  async transaction(callback) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      await callback(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Sync method (no-op for MongoDB)
   */
  async sync(options = {}) {
    console.log('📊 MongoDB sync called - no action needed (MongoDB is schemaless)');
    return Promise.resolve();
  }

  /**
   * Authentication method
   */
  async authenticate() {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB authentication failed:', error);
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    await mongoose.connection.close();
    this.isConnected = false;
  }
}

// Create singleton instance
const mongoAdapter = new MongoDBAdapter();

module.exports = mongoAdapter;
