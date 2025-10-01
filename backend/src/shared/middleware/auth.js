const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const { User } = require('../db/models');
const LoggingService = require('../services/LoggingService');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object with populated information
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: [
        { association: 'studentProfile' },
        { association: 'facultyProfile' },
        { association: 'college' }
      ]
    });

    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!req.user.isActive) {
      return next(new ErrorResponse('Account has been deactivated', 401));
    }

    next();
  } catch (error) {
    await LoggingService.logError(
      'authentication', 
      'token_verification_failed', 
      null, 
      error,
      { ip: req.ip, userAgent: req.get('User-Agent') }
    );
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check permission for specific action on resource
exports.checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ErrorResponse('User not found', 404));
      }

      // Admin bypass - full access to everything
      if (req.user.role === 'admin') {
        // Restrictions for admin
        if (
          (resource === 'attendance' && ['update', 'create', 'delete'].includes(action)) ||
          (resource === 'grade' && ['update', 'create', 'delete'].includes(action))
        ) {
          return next(
            new ErrorResponse(
              `Admin is not authorized to ${action} ${resource}`,
              403
            )
          );
        }
        return next();
      }

      // Faculty restrictions
      if (req.user.role === 'faculty') {
        // Faculty can manage attendance and grades
        if (resource === 'attendance' || resource === 'grade') {
          return next();
        }
        
        // Faculty can't access payment section
        if (resource === 'payment') {
          return next(
            new ErrorResponse(
              `Faculty is not authorized to access payment information`,
              403
            )
          );
        }
      }

      // Student restrictions
      if (req.user.role === 'student') {
        // Students can view their own attendance and grades
        if ((resource === 'attendance' || resource === 'grade') && action === 'read') {
          return next();
        }
        
        // Students can submit assignments
        if (resource === 'assignment' && action === 'create') {
          return next();
        }
        
        // Students can register for events
        if (resource === 'event' && action === 'create') {
          return next();
        }
        
        // Students can update their own profile
        if (resource === 'profile' && action === 'update') {
          return next();
        }
        
        return next(
          new ErrorResponse(
            `Student is not authorized to ${action} ${resource}`,
            403
          )
        );
      }

      // For any other role or resource/action combination
      return next(
        new ErrorResponse(
          `Not authorized to ${action} ${resource}`,
          403
        )
      );
    } catch (error) {
      next(error);
    }
  };
};
