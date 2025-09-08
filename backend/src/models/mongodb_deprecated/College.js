const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema(
  {
    // Basic College Information
    name: {
      type: String,
      required: [true, 'Please add college name'],
      trim: true,
      maxlength: [100, 'College name cannot be more than 100 characters']
    },
    shortName: {
      type: String,
      required: [true, 'Please add college short name'],
      unique: true,
      trim: true,
      maxlength: [20, 'Short name cannot be more than 20 characters']
    },
    establishedYear: {
      type: Number,
      required: [true, 'Please add establishment year']
    },
    affiliatedUniversity: {
      type: String,
      required: [true, 'Please add affiliated university name']
    },
    collegeType: {
      type: String,
      enum: ['Government', 'Private', 'Autonomous', 'Deemed'],
      required: [true, 'Please specify college type']
    },
    
    // Contact Information
    address: {
      street: {
        type: String,
        required: [true, 'Please add street address']
      },
      city: {
        type: String,
        required: [true, 'Please add city']
      },
      state: {
        type: String,
        required: [true, 'Please add state']
      },
      pincode: {
        type: String,
        required: [true, 'Please add pincode'],
        match: [/^\d{6}$/, 'Please add a valid pincode']
      },
      country: {
        type: String,
        default: 'India'
      }
    },
    
    contactDetails: {
      phone: {
        type: String,
        required: [true, 'Please add phone number'],
        match: [/^\d{10}$/, 'Please add a valid phone number']
      },
      email: {
        type: String,
        required: [true, 'Please add email'],
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      website: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          'Please add a valid website URL'
        ]
      },
      fax: String
    },

    // Registration Details
    registrationNumber: {
      type: String,
      required: [true, 'Please add registration number'],
      unique: true
    },
    accreditation: {
      naac: {
        grade: {
          type: String,
          enum: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Accredited']
        },
        validUntil: Date
      },
      nba: {
        accredited: {
          type: Boolean,
          default: false
        },
        validUntil: Date
      }
    },

    // Infrastructure Details
    campusArea: {
      type: Number, // in acres
      required: [true, 'Please add campus area']
    },
    totalBuildings: Number,
    totalClassrooms: Number,
    totalLaboratories: Number,
    libraryDetails: {
      totalBooks: Number,
      digitalResources: Boolean,
      area: Number // in sq ft
    },

    // Admin Details (College Super Admin)
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // College Status
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Settings
    academicYear: {
      startMonth: {
        type: Number,
        min: 1,
        max: 12,
        default: 7 // July
      },
      endMonth: {
        type: Number,
        min: 1,
        max: 12,
        default: 6 // June
      }
    },

    // Logo and Images
    logo: String,
    images: [String]
  },
  {
    timestamps: true
  }
);

// Index for faster searches
CollegeSchema.index({ shortName: 1 });
CollegeSchema.index({ 'address.city': 1, 'address.state': 1 });

module.exports = mongoose.model('College', CollegeSchema);
