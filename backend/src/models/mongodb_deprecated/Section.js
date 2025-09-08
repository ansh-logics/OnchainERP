const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please add section name'],
      trim: true
    },
    program: {
      type: String,
      required: [true, 'Please specify the program'],
      // e.g., "B.Tech", "M.Tech", etc.
    },
    batch: {
      type: String,
      required: [true, 'Please specify the batch year'],
      // e.g., "2024", "2023-24", etc.
    },
    semester: {
      type: Number,
      required: [true, 'Please specify current semester'],
      min: 1,
      max: 10
    },
    
    // Section Configuration
    capacity: {
      maxStudents: {
        type: Number,
        required: [true, 'Please specify maximum student capacity'],
        min: 1
      },
      currentStrength: {
        type: Number,
        default: 0
      }
    },

    // Students in this section
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],

    // Class Teacher/Coordinator
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    },

    // Courses assigned to this section
    courses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true
        },
        faculty: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Faculty'
        },
        lab: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lab'
        },
        isLab: {
          type: Boolean,
          default: false
        }
      }
    ],

    // Timetable for this section
    timetable: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          required: true
        },
        periods: [
          {
            periodNumber: {
              type: Number,
              required: true,
              min: 1,
              max: 10
            },
            startTime: {
              type: String,
              required: true // Format: "09:00"
            },
            endTime: {
              type: String,
              required: true // Format: "10:00"
            },
            subject: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Course'
            },
            faculty: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Faculty'
            },
            venue: {
              type: String, // Room number or lab name
              required: true
            },
            isLab: {
              type: Boolean,
              default: false
            },
            lab: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Lab'
            }
          }
        ]
      }
    ],

    // Academic Year
    academicYear: {
      type: String,
      required: [true, 'Please specify academic year'],
      // e.g., "2024-25"
    },

    // Status
    isActive: {
      type: Boolean,
      default: true
    },

    // Roll Number Assignment Status
    rollNumbersAssigned: {
      type: Boolean,
      default: false
    },

    // Admission Status
    admissionStatus: {
      type: String,
      enum: ['Open', 'Closed', 'In Progress'],
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
SectionSchema.index({ college: 1, department: 1, name: 1, batch: 1 }, { unique: true });
SectionSchema.index({ college: 1, department: 1, semester: 1 });
SectionSchema.index({ classTeacher: 1 });

// Pre-save middleware to update current strength
SectionSchema.pre('save', function(next) {
  if (this.isModified('students')) {
    this.capacity.currentStrength = this.students.length;
  }
  next();
});

// Virtual for section identifier
SectionSchema.virtual('identifier').get(function() {
  return `${this.department.shortName}-${this.name}-${this.batch}`;
});

module.exports = mongoose.model('Section', SectionSchema);
