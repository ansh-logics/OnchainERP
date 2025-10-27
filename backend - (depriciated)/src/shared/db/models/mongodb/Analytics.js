const mongoose = require('mongoose');

// Analytics and reporting data
const AnalyticsSchema = new mongoose.Schema(
  {
    // College context
    collegeId: {
      type: String, // UUID from PostgreSQL
      required: true
    },
    
    // Analytics type
    type: {
      type: String,
      required: true,
      enum: [
        'user_activity', 'enrollment_stats', 'financial_stats',
        'academic_performance', 'system_usage', 'custom_report'
      ]
    },
    
    // Time period
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      required: true
    },
    
    startDate: {
      type: Date,
      required: true
    },
    
    endDate: {
      type: Date,
      required: true
    },
    
    // Analytics data (flexible structure)
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    
    // Metadata
    generatedBy: {
      type: String, // User UUID from PostgreSQL
      required: true
    },
    
    // Report details
    title: {
      type: String,
      required: true
    },
    
    description: String,
    
    // Status
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'completed'
    },
    
    // Performance
    processingTime: Number, // in milliseconds
    
    // Access
    isPublic: {
      type: Boolean,
      default: false
    },
    
    sharedWith: [String] // Array of user UUIDs
  },
  {
    timestamps: true
  }
);

// Indexes
AnalyticsSchema.index({ collegeId: 1, type: 1, period: 1 });
AnalyticsSchema.index({ generatedBy: 1, createdAt: -1 });
AnalyticsSchema.index({ startDate: 1, endDate: 1 });
AnalyticsSchema.index({ status: 1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
