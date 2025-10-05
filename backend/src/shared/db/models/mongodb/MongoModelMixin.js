const mongoose = require('mongoose');

/**
 * Base MongoDB Model Mixin
 * Provides Sequelize-compatible static methods for all MongoDB models
 */
class MongoModelMixin {
  static addSequelizeMethods(schema) {
    // Virtual for ID compatibility
    schema.virtual('id').get(function() {
      return this._id;
    });

    // Ensure virtual fields are serialized
    schema.set('toJSON', {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    // Static methods for Sequelize compatibility
    schema.statics.findByPk = function(id) {
      return this.findById(id);
    };

    schema.statics.findAll = function(options = {}) {
      let query = this.find(options.where || {});
      
      if (options.include) {
        options.include.forEach(inc => {
          if (inc.model && inc.as) {
            query = query.populate({
              path: inc.as.toLowerCase() + 'Id',
              model: inc.model.modelName || inc.model,
              select: inc.attributes
            });
          }
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
      
      return query;
    };

    // Sequelize-compatible findOne method
    schema.statics.findOneSequelize = function(options = {}) {
      let query = this.findOne(options.where || {});
      
      if (options.include) {
        options.include.forEach(inc => {
          if (inc.model && inc.as) {
            query = query.populate({
              path: inc.as.toLowerCase() + 'Id',
              model: inc.model.modelName || inc.model,
              select: inc.attributes
            });
          }
        });
      }
      
      if (options.attributes) {
        const select = Array.isArray(options.attributes) ? options.attributes.join(' ') : options.attributes;
        query = query.select(select);
      }
      
      return query;
    };

    schema.statics.create = function(data) {
      return new this(data).save();
    };

    schema.statics.bulkCreate = function(dataArray) {
      return this.insertMany(dataArray);
    };

    schema.statics.update = function(updateData, options) {
      return this.updateMany(options.where || {}, updateData);
    };

    schema.statics.destroy = function(options) {
      return this.deleteMany(options.where || {});
    };

    schema.statics.count = function(options = {}) {
      return this.countDocuments(options.where || {});
    };

    // Instance methods
    schema.methods.update = function(data) {
      Object.assign(this, data);
      return this.save();
    };

    schema.methods.destroy = function() {
      return this.deleteOne();
    };

    return schema;
  }

  /**
   * Create a base schema with common fields
   */
  static createBaseSchema(additionalFields = {}, options = {}) {
    const { v4: uuidv4 } = require('uuid');
    
    const baseFields = {
      _id: {
        type: String,
        default: () => uuidv4(),
      },
      isActive: {
        type: Boolean,
        default: true
      },
      ...additionalFields
    };

    const schemaOptions = {
      timestamps: true,
      ...options
    };

    const schema = new mongoose.Schema(baseFields, schemaOptions);
    return this.addSequelizeMethods(schema);
  }

  /**
   * Convert Sequelize where clause to MongoDB query
   */
  static convertWhereClause(where) {
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
}

module.exports = MongoModelMixin;
