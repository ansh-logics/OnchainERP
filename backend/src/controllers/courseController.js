const { Course, Faculty, Student, Department, User } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll();
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Faculty,
          attributes: ['employeeId'],
          include: [
            {
              model: User,
              attributes: ['name', 'email']
            }
          ]
        },
        {
          model: Student,
          attributes: ['enrollmentNumber'],
          include: [
            {
              model: User,
              attributes: ['name', 'email']
            }
          ]
        }
      ]
    });
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res, next) => {
  try {
    // Use college from request body or default to admin's college
    const collegeId = req.body.collegeId || req.body.college || req.user.collegeId;
    
    // Handle department - can be provided as ID or name
    let departmentId = req.body.departmentId || req.body.department;
    
    // Debug: Test basic Sequelize functionality
    console.log('Testing basic Sequelize queries...');
    try {
      const testDepartment = await Department.findAll({ limit: 1 });
      console.log('Test query successful, found departments:', testDepartment.length);
      
      // Try the specific query
      const department = await Department.findOne({
        where: {
          id: departmentId,
          collegeId: collegeId
        }
      });
      console.log('Specific department query result:', department ? 'FOUND' : 'NOT FOUND');
      console.log('Looking for dept ID:', departmentId);
      console.log('Looking for college ID:', collegeId);
      
      if (!department) {
        return next(new ErrorResponse(`Department not found or does not belong to the specified college`, 404));
      }
    } catch (error) {
      console.log('Sequelize error:', error);
      return next(new ErrorResponse(`Database error: ${error.message}`, 500));
    }
    
    // Extract and validate required fields
    const {
      code,
      name,
      description,
      credits,
      semester,
      courseType,
      shortName,
      theoryHours = 0,
      labHours = 0,
      tutorialHours = 0,
      prerequisites,
      hasInternalAssessment = true,
      hasFinalExam = true,
      internalMarks = 40,
      finalMarks = 60,
      passingMarks = 40,
      isActive = true
    } = req.body;
    
    const courseData = {
      collegeId,
      departmentId,
      code,
      name,
      shortName,
      description,
      credits,
      semester,
      courseType,
      theoryHours,
      labHours,
      tutorialHours,
      prerequisites,
      hasInternalAssessment,
      hasFinalExam,
      internalMarks,
      finalMarks,
      passingMarks,
      isActive
    };
    
    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    await course.update(req.body);

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // Note: In Sequelize with associations, related records should be handled through associations
    // For now, we'll just delete the course and let cascade handle relationships if configured
    
    await course.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign faculty to course
// @route   PUT /api/courses/:id/faculty/:facultyId
// @access  Private/Admin
exports.assignFaculty = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    const faculty = await Faculty.findByPk(req.params.facultyId);
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.facultyId}`, 404)
      );
    }

    // Update course with new faculty
    await course.update({ facultyId: req.params.facultyId });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private/Faculty or Admin
exports.getCourseStudents = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // If faculty, check if they're assigned to this course
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ 
        where: { userId: req.user.id },
        include: [{ model: Course }]
      });
      
      if (!faculty || !faculty.Courses.some(c => c.id === parseInt(req.params.id))) {
        return next(
          new ErrorResponse(`Not authorized to access this course's students`, 403)
        );
      }
    }

    // Get students enrolled in this course through many-to-many association
    const students = await Student.findAll({
      include: [
        {
          model: Course,
          where: { id: req.params.id },
          through: { attributes: [] }
        },
        {
          model: User,
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course assignments
// @route   GET /api/courses/:id/assignments
// @access  Private
exports.getCourseAssignments = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // Assuming assignments are stored as JSON or in a separate table
    // For now, returning empty array as the structure needs to be defined
    const assignments = course.assignments || [];

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses by department and semester
// @route   GET /api/courses/department/:department/semester/:semester
// @access  Private/Admin
exports.getCoursesByDepartmentAndSemester = async (req, res, next) => {
  try {
    const { department, semester } = req.params;
    
    const courses = await Course.findAll({
      where: {
        departmentId: department,
        semester: parseInt(semester)
      },
      include: [
        {
          model: Faculty,
          attributes: ['employeeId'],
          include: [
            {
              model: User,
              attributes: ['name', 'email']
            }
          ]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
      message: `Found ${courses.length} courses for department ${department}, semester ${semester}`
    });
  } catch (error) {
    next(error);
  }
};
