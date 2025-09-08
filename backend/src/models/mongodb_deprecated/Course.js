const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
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
    
    code: {
      type: String,
      required: [true, 'Please add a course code'],
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Please add a course name'],
      trim: true
    },
    shortName: {
      type: String,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    
    // Academic Details
    credits: {
      type: Number,
      required: [true, 'Please add number of credits'],
      min: 1,
      max: 10
    },
    semester: {
      type: Number,
      required: [true, 'Please add a semester'],
      min: 1,
      max: 10
    },
    courseType: {
      type: String,
      enum: ['Core', 'Elective', 'Lab', 'Project', 'Internship'],
      required: [true, 'Please specify course type']
    },
    
    // Course Structure
    lectureHours: {
      type: Number,
      default: 0
    },
    practicalHours: {
      type: Number,
      default: 0
    },
    tutorialHours: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      required: true
    },

    // Prerequisites
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],

    // Faculty Assignment
    faculty: {
      theory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      },
      practical: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      }
    },

    // Lab Details (if applicable)
    labDetails: {
      isLabCourse: {
        type: Boolean,
        default: false
      },
      lab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab'
      },
      maxStudentsPerBatch: Number
    },

    // Course Syllabus
    syllabus: {
      units: [
        {
          unitNumber: Number,
          title: String,
          topics: [String],
          hours: Number
        }
      ],
      textBooks: [
        {
          title: String,
          author: String,
          publisher: String,
          edition: String
        }
      ],
      referenceBooks: [
        {
          title: String,
          author: String,
          publisher: String,
          edition: String
        }
      ]
    },

    // Assessment Pattern
    assessmentPattern: {
      continuous: {
        percentage: {
          type: Number,
          min: 0,
          max: 100
        },
        components: [
          {
            name: String, // "Assignment", "Quiz", "Lab Work", etc.
            marks: Number,
            count: Number
          }
        ]
      },
      endSemester: {
        percentage: {
          type: Number,
          min: 0,
          max: 100
        },
        duration: Number, // in hours
        maxMarks: Number
      }
    },

    // Enrolled Students and Sections
    enrolledSections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
      }
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],

    // Academic Year
    academicYear: {
      type: String,
      required: [true, 'Please specify academic year']
    },

    // Course Status
    isActive: {
      type: Boolean,
      default: true
    },
    isElective: {
      type: Boolean,
      default: false
    },

    assignments: [
      {
        title: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        dueDate: {
          type: Date,
          required: true
        },
        totalMarks: {
          type: Number,
          required: true
        },
        assignmentType: {
          type: String,
          enum: ['Individual', 'Group', 'Lab', 'Project'],
          default: 'Individual'
        }
      }
    ],
    attendanceDates: [
      {
        date: Date,
        topic: String,
        session: {
          type: String,
          enum: ['Theory', 'Practical', 'Tutorial'],
          default: 'Theory'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound index to ensure unique course codes within a college
CourseSchema.index({ college: 1, code: 1 }, { unique: true });
CourseSchema.index({ college: 1, department: 1 });
CourseSchema.index({ semester: 1, department: 1 });

module.exports = mongoose.model('Course', CourseSchema);
