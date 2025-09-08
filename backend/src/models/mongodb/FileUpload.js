const mongoose = require('mongoose');

// File upload schema for documents, images, assignments, etc.
const FileUploadSchema = new mongoose.Schema(
  {
    // Reference to PostgreSQL entities
    entityType: {
      type: String,
      required: true,
      enum: ['student', 'faculty', 'college', 'course', 'assignment', 'announcement']
    },
    entityId: {
      type: String, // UUID from PostgreSQL
      required: true
    },
    
    // File details
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true,
      unique: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true,
      enum: ['document', 'image', 'video', 'audio', 'archive', 'other']
    },
    
    // File metadata
    category: {
      type: String,
      required: true,
      enum: [
        'profile_photo', 'id_proof', 'address_proof', 'academic_certificate',
        'assignment', 'notes', 'syllabus', 'timetable', 'announcement',
        'college_logo', 'college_image', 'lab_image', 'other'
      ]
    },
    
    description: String,
    tags: [String],
    
    // Upload details
    uploadedBy: {
      type: String, // User UUID from PostgreSQL
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    
    // Access control
    isPublic: {
      type: Boolean,
      default: false
    },
    allowedRoles: [{
      type: String,
      enum: ['student', 'faculty', 'admin', 'cashier', 'super_admin']
    }],
    
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Version control
    version: {
      type: Number,
      default: 1
    },
    parentFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FileUpload'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
FileUploadSchema.index({ entityType: 1, entityId: 1 });
FileUploadSchema.index({ category: 1 });
FileUploadSchema.index({ uploadedBy: 1 });
FileUploadSchema.index({ uploadedAt: -1 });
FileUploadSchema.index({ isActive: 1 });

module.exports = mongoose.model('FileUpload', FileUploadSchema);
