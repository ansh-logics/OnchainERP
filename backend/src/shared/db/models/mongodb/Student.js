const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const studentSchema = new mongoose.Schema({
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
  sectionId: {
    type: String,
    ref: 'Section'
  },
  
  // Student identification
  rollNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Academic details
  batch: {
    type: String,
    required: true
  },
  program: {
    type: String,
    required: true
  },
  admissionYear: {
    type: Number,
    required: true
  },
  currentSemester: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  
  // Personal details
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  category: {
    type: String,
    required: true,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS']
  },
  religion: {
    type: String
  },
  nationality: {
    type: String,
    default: 'Indian'
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
  
  // Parent/Guardian details
  fatherName: {
    type: String
  },
  motherName: {
    type: String
  },
  guardianName: {
    type: String
  },
  guardianRelation: {
    type: String
  },
  parentPhone: {
    type: String
  },
  parentEmail: {
    type: String
  },
  parentOccupation: {
    type: String
  },
  annualIncome: {
    type: Number
  },
  
  // Academic history
  previousEducation: {
    type: mongoose.Schema.Types.Mixed // JSON equivalent
  },
  
  // Additional information
  hobbies: {
    type: [String]
  },
  achievements: {
    type: [String]
  },
  medicalHistory: {
    type: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  
  // Status fields
  admissionStatus: {
    type: String,
    enum: ['admitted', 'provisional', 'rejected', 'waitlisted'],
    default: 'admitted'
  },
  academicStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'graduated', 'dropped'],
    default: 'active'
  },
  
  // Profile picture
  profilePicture: {
    type: String
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'students'
});

// Create indexes
studentSchema.index({ userId: 1 });
studentSchema.index({ collegeId: 1 });
studentSchema.index({ departmentId: 1 });
studentSchema.index({ sectionId: 1 });
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ enrollmentNumber: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ admissionYear: 1 });
studentSchema.index({ currentSemester: 1 });
studentSchema.index({ academicStatus: 1 });
studentSchema.index({ isActive: 1 });

// Virtual for ID compatibility
studentSchema.virtual('id').get(function() {
  return this._id;
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Add Sequelize-like static methods
studentSchema.statics.findByPk = function(id) {
  return this.findById(id);
};

studentSchema.statics.findAll = function(options = {}) {
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

// Removed problematic findOne static method to avoid recursion
// The default mongoose findOne will be used instead

studentSchema.statics.create = function(data) {
  return new this(data).save();
};

studentSchema.statics.bulkCreate = function(dataArray) {
  return this.insertMany(dataArray);
};

studentSchema.statics.update = function(updateData, options) {
  return this.updateMany(options.where || {}, updateData);
};

studentSchema.statics.destroy = function(options) {
  return this.deleteMany(options.where || {});
};

studentSchema.statics.count = function(options = {}) {
  return this.countDocuments(options.where || {});
};

// Instance methods
studentSchema.methods.update = function(data) {
  Object.assign(this, data);
  return this.save();
};

studentSchema.methods.destroy = function() {
  return this.deleteOne();
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
