const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please add department name'],
      trim: true
    },
    shortName: {
      type: String,
      required: [true, 'Please add department short name'],
      trim: true,
      uppercase: true
    },
    code: {
      type: String,
      required: [true, 'Please add department code'],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      required: [true, 'Please add department description']
    },
    
    // Head of Department
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    },

    // Section Configuration
    sectionsConfig: {
      studentsPerSection: {
        type: Number,
        required: [true, 'Please specify students per section'],
        min: [1, 'Students per section must be at least 1'],
        max: [100, 'Students per section cannot exceed 100']
      },
      totalSections: {
        type: Number,
        required: [true, 'Please specify total number of sections'],
        min: [1, 'Total sections must be at least 1']
      },
      sectionNamingPattern: {
        type: String,
        enum: ['A,B,C...', '1,2,3...', 'I,II,III...'],
        default: 'A,B,C...'
      }
    },

    // Roll Number Configuration
    rollNumberConfig: {
      startingNumber: {
        type: Number,
        required: [true, 'Please specify starting roll number'],
        min: [1, 'Starting roll number must be at least 1']
      },
      pattern: {
        type: String,
        required: [true, 'Please specify roll number pattern'],
        // Examples: "YY{DEPT}{###}", "20{CS}{001}", etc.
        default: '{YEAR}{DEPT}{###}'
      },
      currentNumber: {
        type: Number,
        default: function() {
          return this.rollNumberConfig.startingNumber;
        }
      }
    },

    // Academic Programs offered by this department
    programs: [
      {
        name: {
          type: String,
          required: true
        },
        degree: {
          type: String,
          enum: ['B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'PhD', 'Diploma', 'Certificate'],
          required: true
        },
        duration: {
          type: Number,
          required: true // in years
        },
        totalSemesters: {
          type: Number,
          required: true
        },
        isActive: {
          type: Boolean,
          default: true
        }
      }
    ],

    // Faculty members in this department
    faculty: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      }
    ],

    // Courses offered by this department
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],

    // Labs managed by this department
    labs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab'
      }
    ],

    // Current academic year stats
    currentStats: {
      totalStudents: {
        type: Number,
        default: 0
      },
      totalFaculty: {
        type: Number,
        default: 0
      },
      totalCourses: {
        type: Number,
        default: 0
      }
    },

    // Department status
    isActive: {
      type: Boolean,
      default: true
    },

    // Contact information
    contactDetails: {
      phone: String,
      email: String,
      office: String // Office location/room number
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure unique department codes within a college
DepartmentSchema.index({ college: 1, code: 1 }, { unique: true });
DepartmentSchema.index({ college: 1, shortName: 1 }, { unique: true });

// Pre-save middleware to update current stats
DepartmentSchema.pre('save', function(next) {
  if (this.isModified('faculty')) {
    this.currentStats.totalFaculty = this.faculty.length;
  }
  if (this.isModified('courses')) {
    this.currentStats.totalCourses = this.courses.length;
  }
  next();
});

module.exports = mongoose.model('Department', DepartmentSchema);
