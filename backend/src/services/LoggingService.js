const { SystemLog } = require('../models/mongodb');

class LoggingService {
  static async log(level, event, action, userId, data = {}, options = {}) {
    try {
      const hasUserId = userId != null && userId !== '';
      const doc = {
        level,
        event,
        action,
        userRole: options.userRole,
        collegeId: options.collegeId,
        ip: options.ip,
        userAgent: options.userAgent,
        method: options.method,
        url: options.url,
        data,
        duration: options.duration,
        status: options.status || 'success'
      };
      if (hasUserId) {
        doc.userId = String(userId);
      }
      if (options.error) {
        doc.error = options.error;
      }

      const logEntry = new SystemLog(doc);

      await logEntry.save();
      return logEntry;
    } catch (error) {
      console.error('Failed to save log:', error);
      // Don't throw error to prevent logging from breaking main functionality
    }
  }

  static async logError(event, action, userId, error, options = {}) {
    const hasUserId = userId != null && userId !== '';
    // SystemLog requires userId unless action === 'system'
    const effectiveAction = hasUserId ? action : 'system';
    const data = hasUserId
      ? {}
      : { originalAction: action };

    return this.log('error', event, effectiveAction, hasUserId ? userId : undefined, data, {
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
