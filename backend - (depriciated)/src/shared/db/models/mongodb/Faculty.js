const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const facultySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
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
  
  // Faculty identification
  facultyId: {
    type: String,
    unique: true,
    sparse: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Professional details
  designation: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  specialization: {
    type: [String]
  },
  experience: {
    type: Number,
    default: 0
  },
  joiningDate: {
    type: Date,
    required: true
  },
  
  // Employment details
  employmentType: {
    type: String,
    enum: ['permanent', 'contract', 'visiting', 'guest'],
    default: 'permanent'
  },
  salary: {
    type: Number
  },
  
  // Contact details
  personalEmail: {
    type: String
  },
  alternatePhone: {
    type: String
  },
  
  // Address details
  permanentAddress: {
    type: String
  },
  currentAddress: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  pincode: {
    type: String
  },
  country: {
    type: String,
    default: 'India'
  },
  
  // Personal details
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed']
  },
  
  // Emergency contact
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  
  // Professional information
  researchInterests: {
    type: [String]
  },
  publications: {
    type: [String]
  },
  awards: {
    type: [String]
  },
  
  // Teaching preferences
  subjects: {
    type: [String]
  },
  maxHoursPerWeek: {
    type: Number,
    default: 20
  },
  
  // Profile picture
  profilePicture: {
    type: String
  },
  
  // Status fields
  employmentStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'terminated', 'retired'],
    default: 'active'
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'faculty'
});

// Create indexes
facultySchema.index({ userId: 1 });
facultySchema.index({ collegeId: 1 });
facultySchema.index({ departmentId: 1 });
facultySchema.index({ facultyId: 1 });
facultySchema.index({ employeeId: 1 });
facultySchema.index({ designation: 1 });
facultySchema.index({ employmentType: 1 });
facultySchema.index({ employmentStatus: 1 });
facultySchema.index({ isActive: 1 });

// Virtual for ID compatibility
facultySchema.virtual('id').get(function() {
  return this._id;
});

// Ensure virtual fields are serialized
facultySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Add Sequelize-like static methods
facultySchema.statics.findByPk = function(id) {
  return this.findById(id);
};

facultySchema.statics.findAll = function(options = {}) {
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

facultySchema.statics.findOne = function(options = {}) {
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

facultySchema.statics.create = function(data) {
  return new this(data).save();
};

facultySchema.statics.bulkCreate = function(dataArray) {
  return this.insertMany(dataArray);
};

facultySchema.statics.update = function(updateData, options) {
  return this.updateMany(options.where || {}, updateData);
};

facultySchema.statics.destroy = function(options) {
  return this.deleteMany(options.where || {});
};

facultySchema.statics.count = function(options = {}) {
  return this.countDocuments(options.where || {});
};

// Instance methods
facultySchema.methods.update = function(data) {
  Object.assign(this, data);
  return this.save();
};

facultySchema.methods.destroy = function() {
  return this.deleteOne();
};

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
