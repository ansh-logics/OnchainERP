const mongoose = require('mongoose');
const MongoModelMixin = require('./MongoModelMixin');

const assignmentSchema = MongoModelMixin.createBaseSchema({
  sectionId: {
    type: String,
    required: true,
    ref: 'Section'
  },
  facultyId: {
    type: String,
    required: true,
    ref: 'Faculty'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String
  },
  assignmentType: {
    type: String,
    required: true,
    enum: ['individual', 'group', 'lab', 'project', 'quiz', 'presentation']
  },
  submissionFormat: {
    type: String,
    default: 'pdf'
  },
  maxMarks: {
    type: Number,
    required: true
  },
  assignedDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  submissionStartDate: {
    type: Date,
    required: true
  },
  submissionEndDate: {
    type: Date,
    required: true
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  lateSubmissionPenalty: {
    type: Number,
    default: 0
  },
  allowedFileTypes: {
    type: [String],
    default: ['pdf', 'doc', 'docx']
  },
  maxFileSize: {
    type: Number,
    default: 10485760 // 10MB in bytes
  },
  maxFiles: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  collection: 'assignments'
});

// Create indexes for better performance
assignmentSchema.index({ sectionId: 1 });
assignmentSchema.index({ facultyId: 1 });
assignmentSchema.index({ assignedDate: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ isActive: 1 });

// The schema now inherits all Sequelize-compatible methods from MongoModelMixin

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
