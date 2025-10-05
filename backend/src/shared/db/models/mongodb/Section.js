const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const sectionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  collegeId: {
    type: String,
    required: true,
    ref: 'College'
  },
  departmentId: {
    type: String,
    required: true,
    ref: 'Department'
  },
  courseId: {
    type: String,
    ref: 'Course'
  },
  
  // Section identification
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  
  // Academic details
  batch: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  academicYear: {
    type: String,
    required: true
  },
  
  // Capacity details
  maxStrength: {
    type: Number,
    default: 60
  },
  currentStrength: {
    type: Number,
    default: 0
  },
  
  // Class details
  classroomId: {
    type: String,
    ref: 'Classroom'
  },
  
  // Faculty assignment
  classTeacherId: {
    type: String,
    ref: 'Faculty'
  },
  
  // Additional information
  description: {
    type: String
  },
  
  // Status fields
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'suspended'],
    default: 'active'
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'sections'
});

// Create indexes
sectionSchema.index({ collegeId: 1 });
sectionSchema.index({ departmentId: 1 });
sectionSchema.index({ courseId: 1 });
sectionSchema.index({ code: 1 });
sectionSchema.index({ batch: 1 });
sectionSchema.index({ semester: 1 });
sectionSchema.index({ academicYear: 1 });
sectionSchema.index({ classTeacherId: 1 });
sectionSchema.index({ status: 1 });
sectionSchema.index({ isActive: 1 });

// Compound indexes
sectionSchema.index({ departmentId: 1, batch: 1, semester: 1 });
sectionSchema.index({ code: 1, batch: 1 }, { unique: true });

// Virtual for ID compatibility
sectionSchema.virtual('id').get(function() {
  return this._id;
});

// Ensure virtual fields are serialized
sectionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Add Sequelize-like static methods
sectionSchema.statics.findByPk = function(id) {
  return this.findById(id);
};

sectionSchema.statics.findAll = function(options = {}) {
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

sectionSchema.statics.findOne = function(options = {}) {
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

sectionSchema.statics.create = function(data) {
  return new this(data).save();
};

sectionSchema.statics.bulkCreate = function(dataArray) {
  return this.insertMany(dataArray);
};

sectionSchema.statics.update = function(updateData, options) {
  return this.updateMany(options.where || {}, updateData);
};

sectionSchema.statics.destroy = function(options) {
  return this.deleteMany(options.where || {});
};

sectionSchema.statics.count = function(options = {}) {
  return this.countDocuments(options.where || {});
};

// Instance methods
sectionSchema.methods.update = function(data) {
  Object.assign(this, data);
  return this.save();
};

sectionSchema.methods.destroy = function() {
  return this.deleteOne();
};

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
