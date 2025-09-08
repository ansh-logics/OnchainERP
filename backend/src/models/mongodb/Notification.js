const mongoose = require('mongoose');

// Notifications system
const NotificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipientId: {
      type: String, // User UUID from PostgreSQL
      required: true
    },
    
    recipientType: {
      type: String,
      enum: ['user', 'role', 'department', 'college', 'all'],
      default: 'user'
    },
    
    // Sender
    senderId: {
      type: String, // User UUID from PostgreSQL
      required: true
    },
    
    // College context
    collegeId: {
      type: String // UUID from PostgreSQL
    },
    
    // Notification content
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    // Notification type
    type: {
      type: String,
      enum: [
        'announcement', 'assignment', 'fee_reminder', 'grade_update',
        'attendance_alert', 'system_update', 'admission_update',
        'event_reminder', 'deadline_alert', 'general'
      ],
      required: true
    },
    
    // Priority
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    
    // Status
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    },
    
    // Delivery channels
    channels: [{
      type: String,
      enum: ['web', 'email', 'sms', 'push']
    }],
    
    // Read status
    readAt: Date,
    
    // Action button (optional)
    actionUrl: String,
    actionText: String,
    
    // Expiry
    expiresAt: Date,
    
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Indexes
NotificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ collegeId: 1, createdAt: -1 });
NotificationSchema.index({ priority: 1, status: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', NotificationSchema);
