const { SystemLog } = require('../db/models/mongodb');

class LoggingService {
  static async log(level, event, action, userId, data = {}, options = {}) {
    try {
      // Check if MongoDB is available before attempting to save
      if (!SystemLog.db || SystemLog.db.readyState !== 1) {
        // MongoDB not available, log to console as fallback
        console.log(`[${level.toUpperCase()}] ${event}:${action} - User: ${userId}`, {
          data,
          options
        });
        return null;
      }

      const logEntry = new SystemLog({
        level,
        event,
        action,
        userId,
        userRole: options.userRole,
        collegeId: options.collegeId,
        ip: options.ip,
        userAgent: options.userAgent,
        method: options.method,
        url: options.url,
        data,
        duration: options.duration,
        status: options.status || 'success',
        // Add this line to capture error details
        error: options.error
      });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MongoDB operation timeout')), 5000)
      );

      await Promise.race([logEntry.save(), timeoutPromise]);
      return logEntry;
    } catch (error) {
      console.error('Failed to save log to MongoDB:', error.message);
      // Fallback to console logging
      console.log(`[${level.toUpperCase()}] ${event}:${action} - User: ${userId}`, {
        data,
        error: error.message,
        options
      });
      // Don't throw error to prevent logging from breaking main functionality
      return null;
    }
  }

  static async logError(event, action, userId, error, options = {}) {
    return this.log('error', event, action, userId, {}, {
      ...options,
      status: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code || error.name
      }
    });
  }

  static async logUserAction(action, userId, data = {}, options = {}) {
    return this.log('info', 'user_action', action, userId, data, options);
  }

  static async logSystemEvent(event, data = {}, options = {}) {
    return this.log('info', 'system_event', event, 'system', data, options);
  }

  static async getLogs(filters = {}, options = {}) {
    const {
      level,
      event,
      action,
      userId,
      collegeId,
      startDate,
      endDate,
      status,
      limit = 100,
      skip = 0,
      sort = { createdAt: -1 }
    } = { ...filters, ...options };

    const query = {};
    
    if (level) query.level = level;
    if (event) query.event = event;
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (collegeId) query.collegeId = collegeId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    return await SystemLog.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }
}

module.exports = LoggingService;
