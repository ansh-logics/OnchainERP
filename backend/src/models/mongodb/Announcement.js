const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  collegeId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'general',
      'academic',
      'exam',
      'admission',
      'event',
      'holiday',
      'emergency',
      'maintenance',
      'placement',
      'library',
      'hostel',
      'transport',
      'fee_payment',
      'scholarship'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  targetAudience: {
    type: [{
      audienceType: {
        type: String,
        enum: ['all', 'students', 'faculty', 'staff', 'parents', 'department', 'course', 'semester', 'section'],
        required: true
      },
      audienceIds: [String] // Department IDs, Course IDs, etc.
    }],
    default: [{ audienceType: 'all', audienceIds: [] }]
  },
  authorId: {
    type: String, // User UUID from PostgreSQL
    required: true,
    index: true
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String
  }],
  publishedAt: {
    type: Date,
    index: true
  },
  expiresAt: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'expired', 'archived'],
    default: 'draft'
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'announcements'
});

// Indexes
announcementSchema.index({ collegeId: 1, publishedAt: -1 });
announcementSchema.index({ type: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ authorId: 1 });
announcementSchema.index({ 'targetAudience.audienceType': 1 });
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Announcement', announcementSchema);
