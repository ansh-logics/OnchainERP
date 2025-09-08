const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
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
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    },
    
    // Student Identification
    rollNumber: {
      type: String,
      unique: true,
      sparse: true // Will be assigned after admission is complete
    },
    enrollmentNumber: {
      type: String,
      required: [true, 'Please add an enrollment number'],
      unique: true,
      trim: true
    },
    studentId: {
      type: String,
      unique: true,
      trim: true
    },

    // Academic Details
    batch: {
      type: String,
      required: [true, 'Please add a batch year']
    },
    program: {
      type: String,
      required: [true, 'Please add a program']
    },
    degree: {
      type: String,
      enum: ['B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'PhD', 'Diploma', 'Certificate'],
      required: [true, 'Please specify degree']
    },
    currentSemester: {
      type: Number,
      required: [true, 'Please add current semester']
    },
    academicYear: {
      type: String,
      required: [true, 'Please specify academic year']
    },

    // Admission Details
    admissionDate: {
      type: Date,
      default: Date.now
    },
    admissionType: {
      type: String,
      enum: ['Regular', 'Lateral Entry', 'Transfer', 'Management'],
      default: 'Regular'
    },
    admissionCategory: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      required: [true, 'Please specify admission category']
    },

    // Guardian/Parent Details
    guardianDetails: {
      fatherName: {
        type: String,
        required: [true, 'Please add father name']
      },
      motherName: {
        type: String,
        required: [true, 'Please add mother name']
      },
      guardianName: String,
      guardianRelation: String,
      guardianContact: {
        type: String,
        match: [/^\d{10}$/, 'Please add a valid guardian contact number']
      },
      guardianEmail: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid guardian email'
        ]
      },
      annualIncome: Number
    },

    // Previous Education
    previousEducation: {
      schoolName: String,
      board: String,
      passingYear: Number,
      percentage: Number,
      marks: {
        obtained: Number,
        total: Number
      }
    },

    // Current Academic Status
    currentStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Graduated', 'Dropped'],
      default: 'Active'
    },

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    attendance: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course'
        },
        date: Date,
        present: Boolean,
        markedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],
    grades: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course'
        },
        assignment: {
          type: String,
          required: true
        },
        score: {
          type: Number,
          required: true
        },
        maxScore: {
          type: Number,
          required: true
        },
        gradedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],
    assignments: [
      {
        title: String,
        description: String,
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course'
        },
        dueDate: Date,
        submissionDate: Date,
        submissionFile: String,
        originalFileName: String,
        comments: String,
        status: {
          type: String,
          enum: ['pending', 'submitted', 'graded'],
          default: 'pending'
        },
        feedback: String,
        grade: Number
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', StudentSchema);
