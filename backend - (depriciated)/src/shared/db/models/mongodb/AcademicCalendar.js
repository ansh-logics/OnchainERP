const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
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
  description: {
    type: String
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'academic_year_start',
      'academic_year_end',
      'semester_start',
      'semester_end',
      'exam_start',
      'exam_end',
      'holiday',
      'event',
      'deadline',
      'meeting',
      'workshop',
      'conference',
      'cultural_event',
      'sports_event',
      'admission_start',
      'admission_end',
      'registration_start',
      'registration_end'
    ]
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    index: true
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    maxLength: 200
  },
  organizer: {
    type: String, // User UUID from PostgreSQL
    index: true
  },
  attendees: [{
    type: String // Array of user UUIDs
  }],
  reminderSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    reminderTime: {
      type: Number, // Minutes before event
      default: 60
    },
    reminderMethods: [{
      type: String,
      enum: ['email', 'push', 'sms']
    }]
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  }
}, {
  timestamps: true,
  collection: 'academic_calendar'
});

// Indexes
academicCalendarSchema.index({ collegeId: 1, startDate: 1 });
academicCalendarSchema.index({ eventType: 1 });
academicCalendarSchema.index({ status: 1 });

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
