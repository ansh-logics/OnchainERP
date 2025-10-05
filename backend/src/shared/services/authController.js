const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Faculty, College, Department, getModel } = require('../db/models');
const { SystemLog } = require('../db/models');
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

    // Check for user with intelligent database routing
    const UserModel = getModel('User');
    const StudentModel = getModel('Student');
    const FacultyModel = getModel('Faculty');
    const CollegeModel = getModel('College');
    
    let user;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const useMongoDB = process.env.USE_MONGODB !== 'false';
        
        if (useMongoDB) {
          // MongoDB query with population
          user = await UserModel.findOne({ email })
            .populate('collegeId', 'id name shortName')
            .select('+password'); // Include password field for authentication
            
          // Get student/faculty profiles separately for MongoDB (simplified to avoid recursion)
          if (user) {
            if (user.role === 'student') {
              try {
                user.studentProfile = await StudentModel.findOne({ userId: user._id }).select('id enrollmentNumber batch program');
              } catch (error) {
                console.log('⚠️ Could not load student profile:', error.message);
                user.studentProfile = null;
              }
            } else if (user.role === 'faculty') {
              try {
                user.facultyProfile = await FacultyModel.findOne({ userId: user._id }).select('id employeeId designation department');
              } catch (error) {
                console.log('⚠️ Could not load faculty profile:', error.message);
                user.facultyProfile = null;
              }
            }
          }
        } else {
          // PostgreSQL query (fallback)
          user = await UserModel.findOne({ 
            where: { email },
            include: [
              { association: 'studentProfile' },
              { association: 'facultyProfile' },
              { association: 'college', attributes: ['id', 'name', 'shortName'] }
            ],
            timeout: 15000 // 15 second timeout
          });
        }
        break; // Success, exit retry loop
      } catch (dbError) {
        retryCount++;
        console.error(`[AUTH] Login database query attempt ${retryCount} failed:`, dbError.message);
        
        if (dbError.message.includes('out of shared memory') || 
            dbError.message.includes('connection') ||
            dbError.name === 'SequelizeDatabaseError') {
          
          if (retryCount < maxRetries) {
            console.log(`[AUTH] Retrying login database query in ${retryCount * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            continue;
          }
        }
        throw dbError; // Re-throw if not a retryable error or max retries reached
      }
    }

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
        { 
          association: 'studentProfile',
          include: [
            { association: 'section' },
            { association: 'department' }
          ]
        },
        { 
          association: 'facultyProfile',
          include: [
            { association: 'department' }
          ]
        }
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

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse('Please provide an email', 400));
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.update({
      resetPasswordToken,
      resetPasswordExpire,
    });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      // Here you would send email - for now just log it
      console.log('Reset Password Email:', message);

      // Log the activity
      await LoggingService.log('auth', 'forgot_password', {
        email,
        resetToken: resetPasswordToken
      }, user.id);

      res.status(200).json({
        success: true,
        message: 'Email sent',
        resetToken // Remove this in production
      });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await user.save();

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return next(new ErrorResponse('Please provide a password', 400));
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    });

    // Log the activity
    await LoggingService.log('auth', 'password_reset', {
      email: user.email
    }, user.id);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
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
