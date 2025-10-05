const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const departmentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  collegeId: {
    type: String,
    required: true,
    ref: 'College'
  },
  
  // Department information
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  
  // Department details
  description: {
    type: String
  },
  established: {
    type: Date
  },
  
  // Head of department
  hodId: {
    type: String,
    ref: 'Faculty'
  },
  
  // Contact information
  phone: {
    type: String
  },
  email: {
    type: String
  },
  office: {
    type: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'departments'
});

// Create indexes
departmentSchema.index({ collegeId: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ hodId: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ collegeId: 1, code: 1 }, { unique: true });

// Virtual for ID compatibility
departmentSchema.virtual('id').get(function() {
  return this._id;
});

departmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Add Sequelize-like static methods
departmentSchema.statics.findByPk = function(id) {
  return this.findById(id);
};

departmentSchema.statics.findAll = function(options = {}) {
  let query = this.find();
  
  if (options.where) {
    query = query.where(options.where);
  }
  
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
  
  return query;
};

departmentSchema.statics.findOne = function(options = {}) {
  let query = this.findOne();
  
  if (options.where) {
    query = query.where(options.where);
  }
  
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
  
  return query;
};

departmentSchema.statics.create = function(data) {
  return new this(data).save();
};

departmentSchema.statics.bulkCreate = function(dataArray) {
  return this.insertMany(dataArray);
};

departmentSchema.statics.update = function(updateData, options) {
  return this.updateMany(options.where || {}, updateData);
};

departmentSchema.statics.destroy = function(options) {
  return this.deleteMany(options.where || {});
};

departmentSchema.statics.count = function(options = {}) {
  return this.countDocuments(options.where || {});
};

departmentSchema.methods.update = function(data) {
  Object.assign(this, data);
  return this.save();
};

departmentSchema.methods.destroy = function() {
  return this.deleteOne();
};

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
