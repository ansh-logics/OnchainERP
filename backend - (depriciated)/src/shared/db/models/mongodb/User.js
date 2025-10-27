const mongoose = require('mongoose');
const MongoModelMixin = require('./MongoModelMixin');

const userSchema = MongoModelMixin.createBaseSchema({
  collegeId: {
    type: String,
    ref: 'College'
  },
  
  // Basic information
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Role and permissions
  role: {
    type: String,
    required: true,
    enum: ['student', 'faculty', 'admin', 'staff', 'super_admin']
  },
  permissions: {
    type: [String],
    default: []
  },
  
  // Profile information
  profilePicture: {
    type: String
  },
  bio: {
    type: String
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  
  // Authentication
  lastLogin: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  emailVerificationToken: {
    type: String
  },
  
  // Preferences
  preferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Metadata
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  collection: 'users'
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ collegeId: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isApproved: 1 });

// Additional virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Override toJSON to exclude password
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Never return password
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
