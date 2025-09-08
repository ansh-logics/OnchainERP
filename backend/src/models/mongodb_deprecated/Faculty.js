const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema(
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
    
    employeeId: {
      type: String,
      required: [true, 'Please add an employee ID'],
      unique: true,
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Please add a designation'],
      enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Assistant', 'HOD', 'Dean', 'Principal']
    },
    
    // Academic Qualifications
    qualification: {
      highestDegree: {
        type: String,
        required: [true, 'Please add highest degree'],
        enum: ['PhD', 'M.Tech', 'M.Sc', 'M.Phil', 'MBA', 'B.Tech', 'B.Sc', 'Other']
      },
      university: String,
      specialization: String,
      yearOfCompletion: Number
    },
    
    // Experience Details
    experience: {
      totalYears: {
        type: Number,
        required: [true, 'Please add total experience in years'],
        min: 0
      },
      teachingExperience: {
        type: Number,
        min: 0
      },
      industryExperience: {
        type: Number,
        min: 0
      }
    },

    expertise: [String],
    
    // Employment Details
    employmentType: {
      type: String,
      enum: ['Permanent', 'Contract', 'Visiting', 'Guest', 'Part-time'],
      required: [true, 'Please specify employment type']
    },
    joiningDate: {
      type: Date,
      required: [true, 'Please add joining date']
    },
    
    // Salary and Benefits
    salaryDetails: {
      basic: Number,
      allowances: Number,
      total: Number
    },

    // Academic Responsibilities
    responsibilities: {
      isHOD: {
        type: Boolean,
        default: false
      },
      isClassTeacher: {
        type: Boolean,
        default: false
      },
      sections: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Section'
        }
      ],
      labs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lab'
        }
      ]
    },

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],

    // Research and Publications
    research: {
      publications: [
        {
          title: String,
          journal: String,
          year: Number,
          coAuthors: [String]
        }
      ],
      patents: [
        {
          title: String,
          patentNumber: String,
          year: Number
        }
      ],
      researchGrants: [
        {
          title: String,
          amount: Number,
          fundingAgency: String,
          year: Number
        }
      ]
    },

    // Professional Development
    certifications: [
      {
        name: String,
        issuingBody: String,
        issueDate: Date,
        expiryDate: Date
      }
    ],

    // Contact and Personal Details
    alternateEmail: String,
    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    },

    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    currentStatus: {
      type: String,
      enum: ['Active', 'On Leave', 'Suspended', 'Retired', 'Resigned'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Faculty', FacultySchema);
