const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const collegeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  
  // Basic information
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['university', 'college', 'institute'],
    default: 'college'
  },
  
  // Contact information
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  website: {
    type: String
  },
  
  // Address
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  },
  pincode: {
    type: String,
    required: true
  },
  
  // Administrative
  adminId: {
    type: String,
    ref: 'User'
  },
  established: {
    type: Date
  },
  affiliation: {
    type: String
  },
  
  // Settings
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'colleges'
});

// Create indexes
collegeSchema.index({ code: 1 }, { unique: true });
collegeSchema.index({ adminId: 1 });
collegeSchema.index({ isActive: 1 });

// Virtual for ID compatibility
collegeSchema.virtual('id').get(function() {
  return this._id;
});

collegeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Add Sequelize-like static methods
collegeSchema.statics.findByPk = function(id) {
  return this.findById(id);
};

collegeSchema.statics.findAll = function(options = {}) {
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

// Removed custom findOne static method to avoid recursion - use native Mongoose findOne

collegeSchema.statics.create = function(data) {
  return new this(data).save();
};

collegeSchema.statics.bulkCreate = function(dataArray) {
  return this.insertMany(dataArray);
};

collegeSchema.statics.update = function(updateData, options) {
  return this.updateMany(options.where || {}, updateData);
};

collegeSchema.statics.destroy = function(options) {
  return this.deleteMany(options.where || {});
};

collegeSchema.statics.count = function(options = {}) {
  return this.countDocuments(options.where || {});
};

collegeSchema.methods.update = function(data) {
  Object.assign(this, data);
  return this.save();
};

collegeSchema.methods.destroy = function() {
  return this.deleteOne();
};

const College = mongoose.model('College', collegeSchema);

module.exports = College;
