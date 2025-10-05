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
    console.log('[AUTH] Token found in Authorization header, length:', token.length);
  }

  // Check if token exists
  if (!token) {
    console.log('[AUTH] No token provided in request');
    console.log('[AUTH] Request headers:', Object.keys(req.headers));
    console.log('[AUTH] Authorization header:', req.headers.authorization);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  // Check if JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('[AUTH] JWT_SECRET environment variable is not set');
    return next(new ErrorResponse('Server configuration error', 500));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Token decoded successfully for user:', decoded.id);

    // Attach user to request object with populated information
    // Implement retry logic for database operations
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        req.user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] },
          include: [
            { association: 'studentProfile' },
            { association: 'facultyProfile' },
            { association: 'college' }
          ],
          timeout: 15000 // 15 second timeout for the query
        });
        break; // Success, exit retry loop
      } catch (dbError) {
        retryCount++;
        console.error(`[AUTH] Database query attempt ${retryCount} failed:`, dbError.message);
        
        if (dbError.message.includes('out of shared memory') || 
            dbError.message.includes('connection') ||
            dbError.name === 'SequelizeDatabaseError') {
          
          if (retryCount < maxRetries) {
            console.log(`[AUTH] Retrying database query in ${retryCount * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            continue;
          }
        }
        throw dbError; // Re-throw if not a retryable error or max retries reached
      }
    }

    if (!req.user) {
      console.log('[AUTH] User not found in database for ID:', decoded.id);
      return next(new ErrorResponse('User not found', 404));
    }

    if (!req.user.isActive) {
      console.log('[AUTH] User account is deactivated for ID:', decoded.id);
      return next(new ErrorResponse('Account has been deactivated', 401));
    }

    console.log('[AUTH] User found:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      hasStudentProfile: !!req.user.studentProfile,
      hasFacultyProfile: !!req.user.facultyProfile
    });

    console.log('[AUTH] User authenticated successfully:', req.user.id, 'Role:', req.user.role);
    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    
    // Detailed error logging for debugging
    if (error.name === 'JsonWebTokenError') {
      console.error('[AUTH] Invalid JWT token format');
    } else if (error.name === 'TokenExpiredError') {
      console.error('[AUTH] JWT token has expired');
    } else if (error.name === 'NotBeforeError') {
      console.error('[AUTH] JWT token not active yet');
    }

    await LoggingService.logError(
      'authentication', 
      'token_verification_failed', 
      null, 
      error,
      { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        tokenLength: token ? token.length : 0,
        errorName: error.name,
        errorMessage: error.message
      }
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
