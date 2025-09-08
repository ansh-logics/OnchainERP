const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Faculty, College, Department } = require('../models');
const { SystemLog } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Register faculty/student by admin
// @route   POST /api/auth/register
// @access  Private (Admin only)
exports.register = async (req, res, next) => {
  try {
    // Only admin can register new users (faculty/students)
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Only admin can register faculty and students', 403));
    }

    const { 
      name, 
      email, 
      password, 
      role, 
      department, 
      phone,
      dateOfBirth,
      gender,
      // Student specific fields
      enrollmentNumber, 
      batch, 
      program, 
      currentSemester,
      admissionCategory,
      guardianName,
      guardianRelation,
      guardianPhone,
      guardianEmail,
      // Faculty specific fields
      employeeId,
      designation,
      qualification,
      experience,
      joiningDate,
      employmentType
    } = req.body;

    if (!role || !['student', 'faculty'].includes(role)) {
      return next(new ErrorResponse('Please provide a valid role (student or faculty)', 400));
    }

    // Check if department exists and belongs to admin's college
    const departmentDoc = await Department.findByPk(department, {
      include: [{ model: College, as: 'college' }]
    });
    
    if (!departmentDoc) {
      return next(new ErrorResponse('Department not found', 404));
    }

    if (req.user.role !== 'super_admin' && departmentDoc.collegeId !== req.user.collegeId) {
      return next(new ErrorResponse('Department does not belong to your college', 403));
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with base information
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      isActive: true,
      isEmailVerified: false
    });

    // Create role-specific profile
    if (role === 'student') {
      if (!enrollmentNumber || !batch || !program || !currentSemester || !admissionCategory) {
        await user.destroy();
        return next(new ErrorResponse('Please provide all required student information', 400));
      }

      await Student.create({
        userId: user.id,
        collegeId: departmentDoc.collegeId,
        departmentId: departmentDoc.id,
        enrollmentNumber,
        batch,
        program,
        admissionYear: new Date().getFullYear(),
        currentSemester,
        dateOfBirth,
        gender,
        category: admissionCategory,
        guardianName,
        guardianRelation,
        guardianPhone,
        guardianEmail,
        admissionStatus: 'enrolled'
      });

      // Update user with studentId
      user.studentId = enrollmentNumber;
      await user.save();

    } else if (role === 'faculty') {
      if (!employeeId || !designation || !qualification || !joiningDate) {
        await user.destroy();
        return next(new ErrorResponse('Please provide all required faculty information', 400));
      }

      await Faculty.create({
        userId: user.id,
        collegeId: departmentDoc.collegeId,
        departmentId: departmentDoc.id,
        employeeId,
        designation,
        qualification,
        experience: experience || 0,
        joiningDate,
        employmentType: employmentType || 'Permanent',
        dateOfBirth,
        gender
      });

      // Update user with facultyId
      user.facultyId = employeeId;
      await user.save();
    }

    // Log the registration
    await LoggingService.logUserAction(
      'register_user',
      req.user.id,
      { 
        newUserId: user.id,
        role: user.role,
        email: user.email,
        departmentId: department
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.collegeId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      data: userResponse
    });

  } catch (error) {
    await LoggingService.logError('authentication', 'register_user', req.user?.id, error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new ErrorResponse('Email already exists', 400));
    }
    
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ 
      where: { email },
      include: [
        { association: 'studentProfile' },
        { association: 'facultyProfile' }
      ]
    });

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ErrorResponse('Account has been deactivated', 401));
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Log failed login attempt
      await LoggingService.log(
        'warn',
        'authentication',
        'failed_login',
        user.id,
        { email, reason: 'invalid_password' },
        { ip: req.ip, userAgent: req.get('User-Agent') }
      );
      
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    await LoggingService.logUserAction(
      'login',
      user.id,
      { email },
      { 
        userRole: user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    sendTokenResponse(user, 200, res);
  } catch (error) {
    await LoggingService.logError('authentication', 'login', null, error, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Log the logout
    await LoggingService.logUserAction(
      'logout',
      req.user.id,
      {},
      { 
        userRole: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    await LoggingService.logError('authentication', 'logout', req.user?.id, error);
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { association: 'studentProfile' },
        { association: 'facultyProfile' }
      ]
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    await user.update(fieldsToUpdate);

    // Log the update
    await LoggingService.logUserAction(
      'update_profile',
      req.user.id,
      fieldsToUpdate,
      { 
        userRole: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    await LoggingService.logError('authentication', 'update_details', req.user?.id, error);
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    // Check current password
    if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    // Log password change
    await LoggingService.logUserAction(
      'change_password',
      req.user.id,
      {},
      { 
        userRole: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    sendTokenResponse(user, 200, res);
  } catch (error) {
    await LoggingService.logError('authentication', 'update_password', req.user?.id, error);
    next(error);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    data: userResponse
  });
};
