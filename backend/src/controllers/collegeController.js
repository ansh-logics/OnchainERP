const { College, Department, User } = require('../models');
const { SystemLog } = require('../models');
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
      addressStreet,
      addressCity,
      addressState,
      addressPincode,
      addressCountry,
      
      // Contact Details
      phone,
      email,
      website,
      fax,
      
      // Registration Details
      registrationNumber,
      
      // Accreditation
      naacGrade,
      naacValidUntil,
      nbaAccredited,
      nbaValidUntil,
      
      // Infrastructure
      campusArea,
      totalBuildings,
      totalClassrooms,
      totalLaboratories,
      
      // Library Details
      libraryTotalBooks,
      libraryDigitalResources,
      libraryArea,
      
      // Admin Details
      adminName,
      adminEmail,
      adminPassword,
      adminPhone,
      
      // Settings
      academicStartMonth,
      academicEndMonth
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
    const existingAdmin = await User.findOne({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      return next(new ErrorResponse('Admin email already exists', 400));
    }

    // Hash admin password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user first
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: adminPhone,
      isActive: true,
      isEmailVerified: false
    });

    // Create college
    const college = await College.create({
      name,
      shortName: shortName.toUpperCase(),
      establishedYear,
      affiliatedUniversity,
      collegeType,
      registrationNumber,
      
      // Address
      addressStreet,
      addressCity,
      addressState,
      addressPincode,
      addressCountry: addressCountry || 'India',
      
      // Contact
      phone,
      email,
      website,
      fax,
      
      // Infrastructure
      campusArea,
      totalBuildings,
      totalClassrooms,
      totalLaboratories,
      
      // Library
      libraryTotalBooks,
      libraryDigitalResources: libraryDigitalResources || false,
      libraryArea,
      
      // Accreditation
      naacGrade,
      naacValidUntil,
      nbaAccredited: nbaAccredited || false,
      nbaValidUntil,
      
      // Academic year
      academicStartMonth: academicStartMonth || 7,
      academicEndMonth: academicEndMonth || 6,
      
      // Admin reference
      adminId: adminUser.id,
      
      isActive: true
    });

    // Log the college registration
    await LoggingService.logSystemEvent(
      'college_registered',
      {
        collegeId: college.id,
        collegeName: college.name,
        adminId: adminUser.id,
        adminEmail: adminUser.email
      },
      { ip: req.ip, userAgent: req.get('User-Agent') }
    );

    // Remove password from admin response
    const adminResponse = adminUser.toJSON();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'College registered successfully',
      data: {
        college,
        admin: adminResponse
      }
    });

  } catch (error) {
    await LoggingService.logError('college_management', 'register_college', null, error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new ErrorResponse('College with this information already exists', 400));
    }
    
    next(error);
  }
};

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Private/Super Admin
const getColleges = async (req, res, next) => {
  try {
    // Only super admin can view all colleges
    if (req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Access denied. Super admin only.', 403));
    }

    const colleges = await College.findAll({
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Log the action
    await LoggingService.logUserAction(
      'get_all_colleges',
      req.user.id,
      { count: colleges.length },
      { 
        userRole: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges
    });

  } catch (error) {
    await LoggingService.logError('college_management', 'get_all_colleges', req.user?.id, error);
    next(error);
  }
};

// @desc    Get single college
// @route   GET /api/colleges/:id
// @access  Private
const getCollege = async (req, res, next) => {
  try {
    const college = await College.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'departments',
          attributes: ['id', 'name', 'shortName', 'code', 'isActive']
        }
      ]
    });

    if (!college) {
      return next(new ErrorResponse(`College not found with id of ${req.params.id}`, 404));
    }

    // Check access permissions
    if (req.user.role !== 'super_admin' && req.user.collegeId !== college.id) {
      return next(new ErrorResponse('Access denied', 403));
    }

    // Log the action
    await LoggingService.logUserAction(
      'get_college',
      req.user.id,
      { collegeId: req.params.id },
      { 
        userRole: req.user.role,
        collegeId: req.user.collegeId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      data: college
    });

  } catch (error) {
    await LoggingService.logError('college_management', 'get_college', req.user?.id, error);
    next(error);
  }
};

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Private/Admin
const updateCollege = async (req, res, next) => {
  try {
    let college = await College.findByPk(req.params.id);

    if (!college) {
      return next(new ErrorResponse(`College not found with id of ${req.params.id}`, 404));
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.collegeId !== college.id) {
      return next(new ErrorResponse('Access denied', 403));
    }

    // Update college
    college = await college.update(req.body);

    // Log the update
    await LoggingService.logUserAction(
      'update_college',
      req.user.id,
      { 
        collegeId: req.params.id,
        updatedFields: Object.keys(req.body)
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.collegeId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      data: college
    });

  } catch (error) {
    await LoggingService.logError('college_management', 'update_college', req.user?.id, error);
    next(error);
  }
};

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Private/Super Admin
const deleteCollege = async (req, res, next) => {
  try {
    // Only super admin can delete colleges
    if (req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Access denied. Super admin only.', 403));
    }

    const college = await College.findByPk(req.params.id);

    if (!college) {
      return next(new ErrorResponse(`College not found with id of ${req.params.id}`, 404));
    }

    // Soft delete - mark as inactive
    await college.update({ isActive: false });

    // Log the deletion
    await LoggingService.logUserAction(
      'delete_college',
      req.user.id,
      { 
        collegeId: req.params.id,
        collegeName: college.name
      },
      { 
        userRole: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      message: 'College deactivated successfully',
      data: {}
    });

  } catch (error) {
    await LoggingService.logError('college_management', 'delete_college', req.user?.id, error);
    next(error);
  }
};

// @desc    Get college statistics
// @route   GET /api/colleges/:id/stats
// @access  Private/Admin
const getCollegeStats = async (req, res, next) => {
  try {
    const college = await College.findByPk(req.params.id);

    if (!college) {
      return next(new ErrorResponse(`College not found with id of ${req.params.id}`, 404));
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.collegeId !== college.id) {
      return next(new ErrorResponse('Access denied', 403));
    }

    // Get statistics using associations
    const stats = await College.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: 'departments',
          where: { isActive: true },
          required: false
        },
        {
          model: User,
          as: 'students',
          where: { role: 'student', isActive: true },
          required: false
        },
        {
          model: User,
          as: 'faculty',
          where: { role: 'faculty', isActive: true },
          required: false
        }
      ]
    });

    const statistics = {
      totalDepartments: stats.departments?.length || 0,
      totalStudents: stats.students?.length || 0,
      totalFaculty: stats.faculty?.length || 0,
      establishedYear: college.establishedYear,
      campusArea: college.campusArea,
      totalBuildings: college.totalBuildings,
      totalClassrooms: college.totalClassrooms,
      totalLaboratories: college.totalLaboratories
    };

    res.status(200).json({
      success: true,
      data: statistics
    });

  } catch (error) {
    await LoggingService.logError('college_management', 'get_college_stats', req.user?.id, error);
    next(error);
  }
};

// @desc    Add department to college
// @route   POST /api/colleges/:id/departments
// @access  Private (Admin, Super Admin)
const addDepartment = async (req, res, next) => {
  try {
    const {
      name,
      shortName,
      code,
      description,
      programs,
      sectionsConfig,
      rollNumberConfig
    } = req.body;

    const collegeId = req.params.id;

    // Check if college exists
    const college = await College.findByPk(collegeId);
    if (!college) {
      return next(new ErrorResponse('College not found', 404));
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.collegeId !== parseInt(collegeId)) {
      return next(new ErrorResponse('Not authorized to add department to this college', 403));
    }

    // Check if department with same code exists globally
    const existingDepartmentByCode = await Department.findOne({ 
      where: { code: code.toUpperCase() } 
    });
    if (existingDepartmentByCode) {
      return next(new ErrorResponse('Department with this code already exists', 400));
    }

    // Check if department with same shortName exists in the college
    const existingDepartment = await Department.findOne({
      where: {
        shortName: shortName.toUpperCase(),
        collegeId
      }
    });

    if (existingDepartment) {
      return next(new ErrorResponse('Department with this short name already exists in the college', 400));
    }

    const department = await Department.create({
      name,
      shortName: shortName.toUpperCase(),
      code: code.toUpperCase(),
      description,
      collegeId,
      programs: programs || [],
      sectionsConfig: sectionsConfig || {},
      rollNumberConfig: rollNumberConfig || {},
      isActive: true
    });

    // Log the activity
    await LoggingService.logUserAction(
      'add_department',
      req.user.id,
      { 
        departmentId: department.id,
        collegeId,
        departmentName: name,
        departmentCode: code 
      },
      { 
        userRole: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(201).json({
      success: true,
      message: 'Department added successfully',
      data: department
    });

  } catch (error) {
    await LoggingService.logError('college_management', 'add_department', req.user?.id, error);
    next(error);
  }
};

// @desc    Get departments for a college
// @route   GET /api/colleges/:id/departments
// @access  Private
const getCollegeDepartments = async (req, res, next) => {
  try {
    const collegeId = req.params.id;

    // Check if college exists
    const college = await College.findByPk(collegeId);
    if (!college) {
      return next(new ErrorResponse('College not found', 404));
    }

    // Check permissions for non-super admin users
    if (req.user.role !== 'super_admin' && req.user.collegeId !== parseInt(collegeId)) {
      return next(new ErrorResponse('Not authorized to view departments of this college', 403));
    }

    const departments = await Department.findAll({
      where: { 
        collegeId,
        isActive: true 
      },
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'shortName']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });

  } catch (error) {
    await LoggingService.logError('college_management', 'get_college_departments', req.user?.id, error);
    next(error);
  }
};

module.exports = {
  registerCollege,
  getColleges,
  getCollege,
  updateCollege,
  deleteCollege,
  addDepartment,
  getCollegeDepartments,
  getCollegeStats
};
