const { College, Department, User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// @desc    Register a new college
// @route   POST /api/colleges/register
// @access  Public (for initial college registration)
const registerCollege = async (req, res, next) => {
  try {
    const {
      // Basic College Information
      name,
      shortName,
      establishedYear,
      affiliatedUniversity,
      collegeType,
      
      // Address
      address,
      
      // Contact Details
      contactDetails,
      
      // Registration Details
      registrationNumber,
      accreditation,
      
      // Infrastructure
      campusArea,
      totalBuildings,
      totalClassrooms,
      totalLaboratories,
      libraryDetails,
      
      // Admin Details
      adminDetails,
      
      // Settings
      academicYear
    } = req.body;

    // Check if college with same shortName or registrationNumber already exists
    const existingCollege = await College.findOne({
      where: {
        [Op.or]: [
          { shortName: shortName.toUpperCase() },
          { registrationNumber }
        ]
      }
    });

    if (existingCollege) {
      return next(new ErrorResponse('College with this short name or registration number already exists', 400));
    }

    // Check if admin email already exists
    const existingAdmin = await User.findOne({ email: adminDetails.email });
    if (existingAdmin) {
      return next(new ErrorResponse('Admin email already exists', 400));
    }

    // Create college first with a temporary admin ObjectId
    const tempAdminId = new mongoose.Types.ObjectId();
    
    const college = await College.create({
      name,
      shortName: shortName.toUpperCase(),
      establishedYear,
      affiliatedUniversity,
      collegeType: collegeType,
      address,
      contactDetails,
      registrationNumber,
      accreditation,
      campusArea,
      totalBuildings,
      totalClassrooms,
      totalLaboratories,
      libraryDetails,
      academicYear,
      admin: tempAdminId // Temporary admin reference
    });

    let adminUser;
    try {
      // Create admin user with college reference
      adminUser = await User.create({
        name: adminDetails.name,
        email: adminDetails.email,
        password: adminDetails.password,
        role: 'admin',
        contactNumber: adminDetails.contactNumber,
        dateOfBirth: adminDetails.dateOfBirth,
        gender: adminDetails.gender.toLowerCase(),
        college: college._id
      });

      // Update college with actual admin ID
      await College.findByIdAndUpdate(college._id, { admin: adminUser._id });

    } catch (userError) {
      // If user creation fails, delete the college to maintain consistency
      await College.findByIdAndDelete(college._id);
      throw userError;
    }

    // Generate token for admin
    const token = adminUser.getSignedJwtToken();

    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    res
      .status(201)
      .cookie('token', token, options)
      .json({
        success: true,
        message: 'College and admin registered successfully',
        data: {
          college: {
            id: college._id,
            name: college.name,
            shortName: college.shortName,
            registrationNumber: college.registrationNumber,
            establishedYear: college.establishedYear
          },
          admin: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          },
          credentials: {
            adminId: adminUser._id,
            email: adminUser.email,
            // Note: Password is hashed, this is just for reference
            message: "Admin account created successfully. Use the provided email and password to login."
          },
          token,
          nextSteps: {
            login: "Use the admin credentials to login",
            setup: "Complete college setup by adding departments, courses, and faculty",
            dashboard: "Access admin dashboard to manage college operations"
          }
        }
      });
  } catch (error) {
    next(error);
  }
};

// @desc    Get college details
// @route   GET /api/colleges/:id
// @access  Private (Admin, Faculty, Student of that college)
const getCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id)
      .populate('admin', 'name email contactNumber');

    if (!college) {
      return next(new ErrorResponse('College not found', 404));
    }

    // Check if user belongs to this college (except super admin)
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== college._id.toString()) {
      return next(new ErrorResponse('Not authorized to access this college', 403));
    }

    res.status(200).json({
      success: true,
      data: college
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update college details
// @route   PUT /api/colleges/:id
// @access  Private (Admin of that college)
const updateCollege = async (req, res, next) => {
  try {
    let college = await College.findById(req.params.id);

    if (!college) {
      return next(new ErrorResponse('College not found', 404));
    }

    // Check if user is admin of this college
    if (req.user.role !== 'super_admin' && college.admin.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this college', 403));
    }

    college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: college
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Private (Super Admin only)
const getColleges = async (req, res, next) => {
  try {
    // Only super admin can access all colleges
    if (req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Not authorized to access all colleges', 403));
    }

    const colleges = await College.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add department to college
// @route   POST /api/colleges/:id/departments
// @access  Private (Admin of that college)
const addDepartment = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return next(new ErrorResponse('College not found', 404));
    }

    // Check if user is admin of this college
    if (req.user.role !== 'super_admin' && college.admin.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to add departments to this college', 403));
    }

    const departmentData = {
      ...req.body,
      college: college._id
    };

    const department = await Department.create(departmentData);

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get college departments
// @route   GET /api/colleges/:id/departments
// @access  Private (Admin, Faculty, Student of that college)
const getCollegeDepartments = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return next(new ErrorResponse('College not found', 404));
    }

    // Check if user belongs to this college
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== college._id.toString()) {
      return next(new ErrorResponse('Not authorized to access this college departments', 403));
    }

    const departments = await Department.find({ college: college._id })
      .populate('hod', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get college statistics
// @route   GET /api/colleges/:id/stats
// @access  Private (Admin of that college)
const getCollegeStats = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return next(new ErrorResponse('College not found', 404));
    }

    // Check if user is admin of this college
    if (req.user.role !== 'super_admin' && college.admin.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access college statistics', 403));
    }

    // Get statistics
    const totalDepartments = await Department.countDocuments({ college: college._id });
    const totalStudents = await User.countDocuments({ college: college._id, role: 'student' });
    const totalFaculty = await User.countDocuments({ college: college._id, role: 'faculty' });

    const stats = {
      totalDepartments,
      totalStudents,
      totalFaculty,
      totalBuildings: college.totalBuildings,
      totalClassrooms: college.totalClassrooms,
      totalLaboratories: college.totalLaboratories,
      campusArea: college.campusArea
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCollege,
  getCollege,
  updateCollege,
  getColleges,
  addDepartment,
  getCollegeDepartments,
  getCollegeStats
};
