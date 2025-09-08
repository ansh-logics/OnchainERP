const mongoose = require('mongoose');

const LabSchema = new mongoose.Schema(
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
      required: [true, 'Please add lab name'],
      trim: true
    },
    labCode: {
      type: String,
      required: [true, 'Please add lab code'],
      unique: true,
      trim: true,
      uppercase: true
    },
    
    // Location Details
    location: {
      building: {
        type: String,
        required: [true, 'Please specify building name/number']
      },
      floor: {
        type: String,
        required: [true, 'Please specify floor']
      },
      roomNumber: {
        type: String,
        required: [true, 'Please specify room number'],
        unique: true
      }
    },

    // Lab Specifications
    labType: {
      type: String,
      enum: ['Computer Lab', 'Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Electronics Lab', 'Mechanical Lab', 'Civil Lab', 'Language Lab', 'General Lab'],
      required: [true, 'Please specify lab type']
    },
    
    capacity: {
      maxStudents: {
        type: Number,
        required: [true, 'Please specify maximum student capacity'],
        min: [1, 'Capacity must be at least 1']
      },
      totalWorkstations: {
        type: Number,
        required: [true, 'Please specify total workstations/seats']
      }
    },

    // Equipment and Infrastructure
    equipment: [
      {
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 0
        },
        condition: {
          type: String,
          enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Out of Order'],
          default: 'Good'
        },
        lastMaintenanceDate: Date,
        nextMaintenanceDate: Date,
        cost: Number,
        vendor: String,
        warrantyExpiry: Date
      }
    ],

    // Software (for computer labs)
    software: [
      {
        name: {
          type: String,
          required: true
        },
        version: String,
        licenseType: {
          type: String,
          enum: ['Licensed', 'Open Source', 'Educational', 'Trial']
        },
        licenseExpiry: Date,
        installedWorkstations: Number
      }
    ],

    // Lab Staff
    labIncharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true
    },
    labAssistants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Can be faculty or staff
      }
    ],

    // Associated Courses (which courses use this lab)
    associatedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],

    // Timetable and Booking
    operatingHours: {
      monday: {
        start: String, // "09:00"
        end: String,   // "17:00"
        isOpen: { type: Boolean, default: true }
      },
      tuesday: {
        start: String,
        end: String,
        isOpen: { type: Boolean, default: true }
      },
      wednesday: {
        start: String,
        end: String,
        isOpen: { type: Boolean, default: true }
      },
      thursday: {
        start: String,
        end: String,
        isOpen: { type: Boolean, default: true }
      },
      friday: {
        start: String,
        end: String,
        isOpen: { type: Boolean, default: true }
      },
      saturday: {
        start: String,
        end: String,
        isOpen: { type: Boolean, default: true }
      },
      sunday: {
        start: String,
        end: String,
        isOpen: { type: Boolean, default: false }
      }
    },

    // Safety and Compliance
    safetyFeatures: [
      {
        feature: String,
        available: Boolean,
        lastChecked: Date
      }
    ],

    // Maintenance Records
    maintenanceHistory: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        description: String,
        performedBy: String,
        cost: Number,
        nextScheduledMaintenance: Date
      }
    ],

    // Lab Rules and Policies
    rules: [String],
    
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    isAvailableForBooking: {
      type: Boolean,
      default: true
    },

    // Additional Details
    description: String,
    establishedDate: Date,
    lastRenovationDate: Date,
    
    // Photos
    images: [String]
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
LabSchema.index({ college: 1, department: 1 });
LabSchema.index({ labCode: 1 });
LabSchema.index({ 'location.roomNumber': 1 });
LabSchema.index({ labIncharge: 1 });

// Virtual for full location
LabSchema.virtual('fullLocation').get(function() {
  return `${this.location.building}, Floor ${this.location.floor}, Room ${this.location.roomNumber}`;
});

module.exports = mongoose.model('Lab', LabSchema);
