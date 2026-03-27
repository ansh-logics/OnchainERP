const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Faculty, College, Department } = require('../models');
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
      contactNumber, 
      dateOfBirth,
      gender,
      // Student specific fields
      enrollmentNumber, 
      batch, 
      program, 
      currentSemester,
      degree,
      admissionType,
      admissionCategory,
      guardianDetails,
      previousEducation,
      // Faculty specific fields
      employeeId,
      designation,
      qualification,
      expertise,
      joiningDate,
      employmentType,
      experience
    } = req.body;

    if (!role || !['student', 'faculty'].includes(role)) {
      return next(new ErrorResponse('Please provide a valid role (student or faculty)', 400));
    }

    // Check if department exists and belongs to admin's college
    const departmentDoc = await Department.findById(department);
    if (!departmentDoc) {
      return next(new ErrorResponse('Department not found', 404));
    }

    if (req.user.role !== 'super_admin' && departmentDoc.college.toString() !== req.user.college.toString()) {
      return next(new ErrorResponse('Department does not belong to your college', 403));
    }

    // Create user with base information
    const user = await User.create({
      name,
      email,
      password,
      role,
      college: departmentDoc.college,
      contactNumber,
      dateOfBirth,
      gender
    });

    // Create role-specific profile
    if (role === 'student') {
      if (!enrollmentNumber || !batch || !program || !currentSemester || !degree || !admissionCategory) {
        await User.findByIdAndDelete(user._id);
        return next(new ErrorResponse('Please provide all required student information', 400));
      }

      await Student.create({
        user: user._id,
        college: departmentDoc.college,
        department: departmentDoc._id,
        enrollmentNumber,
        batch,
        program,
        degree,
        currentSemester,
        academicYear: req.body.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        admissionType: admissionType || 'Regular',
        admissionCategory,
        guardianDetails: guardianDetails || {},
        previousEducation: previousEducation || {},
        courses: []
      });

      // Update user with studentId
      user.studentId = enrollmentNumber;
      await user.save();
    }

    if (role === 'faculty') {
      if (!employeeId || !designation || !qualification || !joiningDate || !employmentType) {
        await User.findByIdAndDelete(user._id);
        return next(new ErrorResponse('Please provide all required faculty information', 400));
      }

      await Faculty.create({
        user: user._id,
        college: departmentDoc.college,
        department: departmentDoc._id,
        employeeId,
        designation,
        qualification: {
          highestDegree: qualification.highestDegree,
          university: qualification.university,
          specialization: qualification.specialization,
          yearOfCompletion: qualification.yearOfCompletion
        },
        experience: experience || { totalYears: 0 },
        expertise: expertise || [],
        employmentType,
        joiningDate,
        courses: []
      });

      // Update user with facultyId
      user.facultyId = employeeId;
      await user.save();

      // Add faculty to department's faculty array
      departmentDoc.faculty.push(user._id);
      await departmentDoc.save();
    }

    // Get the populated user data
    const populatedUser = await User.findById(user._id)
      .populate('college', 'name shortName')
      .select('-password');

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      data: populatedUser
    });
  } catch (error) {
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
    const user = await User.findOne({ email })
      .select('+password')
      .populate('college', 'name shortName');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let userData = {};
    
    const user = await User.findById(req.user.id)
      .populate('college', 'name shortName')
      .select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    userData = { ...user._doc };
    
    // Get role-specific additional data
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id })
        .populate('department', 'name shortName')
        .populate('section', 'name batch semester')
        .populate('courses', 'name code credits');
      
      if (student) {
        userData.studentProfile = student;
      }
    } else if (user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user: user._id })
        .populate('department', 'name shortName')
        .populate('courses', 'name code credits')
        .populate('responsibilities.sections', 'name batch semester')
        .populate('responsibilities.labs', 'name labCode location');
      
      if (faculty) {
        userData.facultyProfile = faculty;
      }
    }
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        userData.studentData = student;
      }
    } else if (user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user: user._id });
      if (faculty) {
        userData.facultyData = faculty;
      }
    }
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const { name, email, contactNumber, address } = req.body;
    
    // Fields to update
    const fieldsToUpdate = {
      name,
      email,
      contactNumber,
      address
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check current password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }
    
    user.password = newPassword;
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save({ validateBeforeSave: false });
    
    // In a real application, send email with the reset token here
    
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken // In production, don't expose this token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return next(new ErrorResponse('Invalid token or token expired', 400));
    }
    
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'User logged out successfully'
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Prepare user data (exclude password)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    contactNumber: user.contactNumber,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    createdAt: user.createdAt
  };

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      user: userData
    });
};
