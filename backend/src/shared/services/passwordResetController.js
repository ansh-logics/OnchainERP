const { PasswordResetRequest, User } = require('../db/models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc    Get all password reset requests
// @route   GET /api/password-reset
// @access  Private/Admin
exports.getPasswordResetRequests = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status !== 'all') {
      whereClause.status = status;
    }

    const requests = await PasswordResetRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'studentId', 'facultyId']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['requestedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count: requests.count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(requests.count / limit)
      },
      data: requests.rows
    });
  } catch (error) {
    await LoggingService.logError('password_reset', 'get_requests', req.user?.id, error);
    next(error);
  }
};

// @desc    Create password reset request (for users)
// @route   POST /api/password-reset/request
// @access  Private/User
exports.createPasswordResetRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim().length < 10) {
      return next(new ErrorResponse('Please provide a detailed reason (minimum 10 characters)', 400));
    }

    // Check if user already has a pending request
    const existingRequest = await PasswordResetRequest.findOne({
      where: {
        userId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return next(new ErrorResponse('You already have a pending password reset request', 400));
    }

    // Create new request
    const request = await PasswordResetRequest.create({
      userId,
      reason: reason.trim(),
      status: 'pending'
    });

    // Log the action
    await LoggingService.logUserAction(
      'create_password_reset_request',
      userId,
      { 
        requestId: request.id,
        reason: reason.substring(0, 100) + '...' // Truncate for logging
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.collegeId
      }
    );

    res.status(201).json({
      success: true,
      message: 'Password reset request submitted successfully. An admin will review your request.',
      data: {
        id: request.id,
        status: request.status,
        requestedAt: request.requestedAt
      }
    });
  } catch (error) {
    await LoggingService.logError('password_reset', 'create_request', req.user?.id, error);
    next(error);
  }
};

// @desc    Review password reset request (approve/reject)
// @route   PUT /api/password-reset/:id/review
// @access  Private/Admin
exports.reviewPasswordResetRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reviewNote } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return next(new ErrorResponse('Action must be either approve or reject', 400));
    }

    const request = await PasswordResetRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'password']
        }
      ]
    });

    if (!request) {
      return next(new ErrorResponse('Password reset request not found', 404));
    }

    if (request.status !== 'pending') {
      return next(new ErrorResponse('This request has already been reviewed', 400));
    }

    let tempPassword = null;
    let newPasswordHash = null;

    if (action === 'approve') {
      // Generate temporary password
      tempPassword = crypto.randomBytes(8).toString('hex');
      const salt = await bcrypt.genSalt(10);
      newPasswordHash = await bcrypt.hash(tempPassword, salt);

      // Update user's password
      await request.user.update({
        password: newPasswordHash,
        resetPasswordToken: null,
        resetPasswordExpire: null
      });

      // Update request
      await request.update({
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || 'Request approved and password reset',
        oldPasswordHash: request.user.password, // Store old password hash for audit
        newPasswordHash,
        tempPassword, // Store temp password for admin to share
        isCompleted: true,
        completedAt: new Date()
      });
    } else {
      // Reject request
      await request.update({
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || 'Request rejected'
      });
    }

    // Log the action
    await LoggingService.logUserAction(
      'review_password_reset_request',
      req.user.id,
      { 
        requestId: id,
        action,
        targetUserId: request.userId,
        targetUserEmail: request.user.email
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.collegeId
      }
    );

    const responseData = {
      id: request.id,
      status: request.status,
      reviewedAt: request.reviewedAt,
      reviewNote: request.reviewNote
    };

    if (action === 'approve') {
      responseData.tempPassword = tempPassword;
      responseData.userEmail = request.user.email;
      responseData.userName = request.user.name;
    }

    res.status(200).json({
      success: true,
      message: `Password reset request ${action}d successfully`,
      data: responseData
    });
  } catch (error) {
    await LoggingService.logError('password_reset', 'review_request', req.user?.id, error);
    next(error);
  }
};

// @desc    Get user's own password reset requests
// @route   GET /api/password-reset/my-requests
// @access  Private/User
exports.getMyPasswordResetRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const requests = await PasswordResetRequest.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['name'],
          required: false
        }
      ],
      attributes: { exclude: ['oldPasswordHash', 'newPasswordHash', 'tempPassword'] },
      order: [['requestedAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    await LoggingService.logError('password_reset', 'get_my_requests', req.user?.id, error);
    next(error);
  }
};

// @desc    Get password reset request details
// @route   GET /api/password-reset/:id
// @access  Private/Admin
exports.getPasswordResetRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await PasswordResetRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'studentId', 'facultyId', 'phone']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    if (!request) {
      return next(new ErrorResponse('Password reset request not found', 404));
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    await LoggingService.logError('password_reset', 'get_request', req.user?.id, error);
    next(error);
  }
};

// @desc    Get password reset statistics
// @route   GET /api/password-reset/stats
// @access  Private/Admin
exports.getPasswordResetStats = async (req, res, next) => {
  try {
    const userCollegeId = req.user.collegeId;

    // Get counts by status
    const stats = await PasswordResetRequest.findAll({
      attributes: [
        'status',
        [PasswordResetRequest.sequelize.fn('COUNT', '*'), 'count']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userCollegeId ? { collegeId: userCollegeId } : {}
        }
      ],
      group: ['status'],
      raw: true
    });

    // Get recent requests (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRequests = await PasswordResetRequest.count({
      where: {
        requestedAt: {
          [PasswordResetRequest.sequelize.Op.gte]: thirtyDaysAgo
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userCollegeId ? { collegeId: userCollegeId } : {}
        }
      ]
    });

    // Transform stats to object
    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    const result = {
      byStatus: {
        pending: statusCounts.pending || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        completed: statusCounts.completed || 0
      },
      recentRequests: recentRequests,
      total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    await LoggingService.logError('password_reset', 'get_stats', req.user?.id, error);
    next(error);
  }
};
