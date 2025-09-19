const mongoose = require('mongoose');

// System logs for audit trail, user actions, system events
const SystemLogSchema = new mongoose.Schema(
  {
    // Log type
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'debug'],
      default: 'info'
    },
    
    // Event details
    event: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    
    // User context
    userId: {
      type: String, // UUID from PostgreSQL
      required: false,
      nullable:true,
    },
    userRole: {
      type: String,
      enum: ['student', 'faculty', 'admin', 'cashier', 'super_admin', 'system']
    },
    
    // College context
    collegeId: {
      type: String // UUID from PostgreSQL
    },
    
    // Request details
    ip: String,
    userAgent: String,
    method: String,
    url: String,
    
    // Data
    data: {
      type: mongoose.Schema.Types.Mixed
    },
    
    // Error details (for error logs)
    error: {
      message: String,
      stack: String,
      code: String
    },
    
    // Performance metrics
    duration: Number, // in milliseconds
    
    // Status
    status: {
      type: String,
      enum: ['success', 'error', 'warning'],
      default: 'success'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for log queries
SystemLogSchema.index({ level: 1, createdAt: -1 });
SystemLogSchema.index({ userId: 1, createdAt: -1 });
SystemLogSchema.index({ collegeId: 1, createdAt: -1 });
SystemLogSchema.index({ event: 1, action: 1 });
SystemLogSchema.index({ status: 1 });
SystemLogSchema.index({ createdAt: -1 }); // For general log viewing

// TTL index to automatically delete old logs (30 days)
SystemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('SystemLog', SystemLogSchema);
