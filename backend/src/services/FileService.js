const { FileUpload } = require('../models/mongodb');
const path = require('path');
const fs = require('fs').promises;

class FileService {
  static async saveFileMetadata(fileData) {
    try {
      const fileUpload = new FileUpload(fileData);
      await fileUpload.save();
      return fileUpload;
    } catch (error) {
      throw new Error(`Failed to save file metadata: ${error.message}`);
    }
  }

  static async getFilesByEntity(entityType, entityId, options = {}) {
    const {
      category,
      fileType,
      isActive = true,
      limit = 50,
      skip = 0,
      sort = { uploadedAt: -1 }
    } = options;

    const query = {
      entityType,
      entityId,
      isActive
    };

    if (category) query.category = category;
    if (fileType) query.fileType = fileType;

    return await FileUpload.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  static async getFileById(fileId) {
    return await FileUpload.findById(fileId);
  }

  static async updateFileMetadata(fileId, updateData) {
    return await FileUpload.findByIdAndUpdate(
      fileId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  static async deleteFile(fileId) {
    const file = await FileUpload.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Soft delete - mark as inactive
    file.isActive = false;
    await file.save();

    // Optionally, also delete physical file
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      console.error('Failed to delete physical file:', error);
      // Don't throw error - metadata is more important
    }

    return file;
  }

  static async getUserFiles(userId, options = {}) {
    const {
      entityType,
      category,
      limit = 50,
      skip = 0
    } = options;

    const query = {
      uploadedBy: userId,
      isActive: true
    };

    if (entityType) query.entityType = entityType;
    if (category) query.category = category;

    return await FileUpload.find(query)
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }

  static getFileTypeFromMime(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'archive';
    return 'other';
  }

  static generateFileName(originalName, userId) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${userId}_${timestamp}_${random}${ext}`;
  }
}

module.exports = FileService;
