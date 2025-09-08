const { Department, College, User, Course, Section } = require('../models');
// const Lab = require('../models/Lab'); // TODO: Update Lab model for PostgreSQL
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');
const rollNumberGenerator = require('../utils/rollNumberGenerator');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin, Super Admin)
const createDepartment = async (req, res, next) => {
  try {
    const {
      name,
      shortName,
      code,
      description,
      college,
      hod,
      programs,
      sectionsConfig,
      rollNumberConfig
    } = req.body;

    // Check if user has permission to create department in this college
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== college) {
      return next(new ErrorResponse('Not authorized to create department in this college', 403));
    }

    // Check if department with same code exists globally (since code is unique)
    const existingDepartmentByCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingDepartmentByCode) {
      return next(new ErrorResponse('Department with this code already exists', 400));
    }

    // Check if department with same shortName exists in the college
    const existingDepartment = await Department.findOne({
      shortName: shortName.toUpperCase(),
      college
    });

    if (existingDepartment) {
      return next(new ErrorResponse('Department with this short name already exists in the college', 400));
    }

    const department = await Department.create({
      name,
      shortName: shortName.toUpperCase(),
      code: code.toUpperCase(),
      description,
      college,
      hod: hod || undefined, // Convert empty string to undefined
      programs: programs || [],
      sectionsConfig,
      rollNumberConfig
    });

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Create department error:', error);
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    let query = {};

    // Debug logging
    console.log('Get Departments - User role:', req.user.role);
    console.log('Get Departments - User college:', req.user.college);

    // If not super admin, only show departments from user's college
    if (req.user.role !== 'super_admin') {
      // Handle case where user.college might be an ObjectId or populated object
      const userCollegeId = req.user.college?._id || req.user.college;
      query.college = userCollegeId;
    }

    const departments = await Department.find(query)
      .populate('college', 'name shortName')
      .populate('hod', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('college', 'name shortName')
      .populate('hod', 'name email contactNumber');

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('User role:', req.user.role);
    console.log('User college:', req.user.college);
    console.log('Department college:', department.college);
    
    // Check if user has access to this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college._id;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to access this department', 403));
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Get department error:', error);
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin, Super Admin)
const updateDepartment = async (req, res, next) => {
  try {
    let department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('Update - User role:', req.user.role);
    console.log('Update - User college:', req.user.college);
    console.log('Update - Department college:', department.college);

    // Check if user has permission to update this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to update this department', 403));
    }

    department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('college', 'name shortName').populate('hod', 'name email');

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Update department error:', error);
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin, Super Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('Delete - User role:', req.user.role);
    console.log('Delete - User college:', req.user.college);
    console.log('Delete - Department college:', department.college);

    // Check if user has permission to delete this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to delete this department', 403));
    }

    // Check if there are students in this department
    const studentCount = await User.countDocuments({
      department: department._id,
      role: 'student'
    });

    if (studentCount > 0) {
      return next(new ErrorResponse('Cannot delete department with existing students', 400));
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    next(error);
  }
};

// @desc    Add course to department
// @route   POST /api/departments/:id/courses
// @access  Private (Admin, Super Admin)
const addCourse = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('Add Course - User role:', req.user.role);
    console.log('Add Course - User college:', req.user.college);
    console.log('Add Course - Department college:', department.college);

    // Check if user has permission to add course to this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to add courses to this department', 403));
    }

    const courseData = {
      ...req.body,
      department: department._id,
      college: department.college
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Add course error:', error);
    next(error);
  }
};

// @desc    Add lab to department
// @route   POST /api/departments/:id/labs
// @access  Private (Admin, Super Admin)
const addLab = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('Add Lab - User role:', req.user.role);
    console.log('Add Lab - User college:', req.user.college);
    console.log('Add Lab - Department college:', department.college);

    // Check if user has permission to add lab to this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to add labs to this department', 403));
    }

    const labData = {
      ...req.body,
      department: department._id,
      college: department.college
    };

    const lab = await Lab.create(labData);

    res.status(201).json({
      success: true,
      data: lab
    });
  } catch (error) {
    console.error('Add lab error:', error);
    next(error);
  }
};

// @desc    Create sections for department
// @route   POST /api/departments/:id/sections
// @access  Private (Admin, Super Admin)
const createSections = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('Create Sections - User role:', req.user.role);
    console.log('Create Sections - User college:', req.user.college);
    console.log('Create Sections - Department college:', department.college);

    // Check if user has permission to create sections for this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to create sections for this department', 403));
    }

    const { sections } = req.body;

    const createdSections = [];

    for (const sectionData of sections) {
      const section = await Section.create({
        ...sectionData,
        department: department._id,
        college: department.college
      });
      createdSections.push(section);
    }

    res.status(201).json({
      success: true,
      count: createdSections.length,
      data: createdSections
    });
  } catch (error) {
    console.error('Create sections error:', error);
    next(error);
  }
};

// @desc    Get department statistics
// @route   GET /api/departments/:id/stats
// @access  Private
const getDepartmentStats = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('Get Stats - User role:', req.user.role);
    console.log('Get Stats - User college:', req.user.college);
    console.log('Get Stats - Department college:', department.college);

    // Check if user has access to this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to access this department statistics', 403));
    }

    // Get statistics
    const totalStudents = await User.countDocuments({
      department: department._id,
      role: 'student'
    });

    const totalFaculty = await User.countDocuments({
      department: department._id,
      role: 'faculty'
    });

    const totalCourses = await Course.countDocuments({
      department: department._id
    });

    const totalLabs = await Lab.countDocuments({
      department: department._id
    });

    const totalSections = await Section.countDocuments({
      department: department._id
    });

    const stats = {
      totalStudents,
      totalFaculty,
      totalCourses,
      totalLabs,
      totalSections,
      totalSeats: department.totalSeats,
      intake: department.intake
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    next(error);
  }
};

// @desc    Assign roll numbers to students in department
// @route   POST /api/departments/:id/assign-roll-numbers
// @access  Private (Admin, Super Admin)
const assignRollNumbersToStudents = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('Assign Roll Numbers - User role:', req.user.role);
    console.log('Assign Roll Numbers - User college:', req.user.college);
    console.log('Assign Roll Numbers - Department college:', department.college);

    // Check if user has permission to assign roll numbers for this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to assign roll numbers for this department', 403));
    }

    const { academicYear, batch } = req.body;

    // Get students without roll numbers in this department
    const students = await User.find({
      department: department._id,
      role: 'student',
      rollNumber: { $exists: false }
    }).sort({ createdAt: 1 });

    if (students.length === 0) {
      return next(new ErrorResponse('No students found without roll numbers', 400));
    }

    const updatedStudents = [];

    for (let i = 0; i < students.length; i++) {
      const rollNumber = rollNumberGenerator.generateRollNumber(
        department.shortName,
        academicYear,
        batch,
        i + 1
      );

      const updatedStudent = await User.findByIdAndUpdate(
        students[i]._id,
        { rollNumber },
        { new: true }
      );

      updatedStudents.push(updatedStudent);
    }

    res.status(200).json({
      success: true,
      message: `Roll numbers assigned to ${updatedStudents.length} students`,
      data: updatedStudents
    });
  } catch (error) {
    console.error('Assign roll numbers error:', error);
    next(error);
  }
};

// @desc    Reset roll numbers for department students
// @route   POST /api/departments/:id/reset-roll-numbers
// @access  Private (Admin, Super Admin)
const resetRollNumbers = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Debug logging
    console.log('Reset Roll Numbers - User role:', req.user.role);
    console.log('Reset Roll Numbers - User college:', req.user.college);
    console.log('Reset Roll Numbers - Department college:', department.college);

    // Check if user has permission to reset roll numbers for this department
    // Handle case where user.college might be an ObjectId or populated object
    const userCollegeId = req.user.college?._id || req.user.college;
    const departmentCollegeId = department.college;
    
    if (req.user.role !== 'super_admin' && userCollegeId.toString() !== departmentCollegeId.toString()) {
      return next(new ErrorResponse('Not authorized to reset roll numbers for this department', 403));
    }

    // Reset roll numbers for all students in this department
    const result = await User.updateMany(
      {
        department: department._id,
        role: 'student'
      },
      {
        $unset: { rollNumber: 1 }
      }
    );

    res.status(200).json({
      success: true,
      message: `Roll numbers reset for ${result.modifiedCount} students`
    });
  } catch (error) {
    console.error('Reset roll numbers error:', error);
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  addCourse,
  addLab,
  createSections,
  getDepartmentStats,
  assignRollNumbersToStudents,
  resetRollNumbers
};
