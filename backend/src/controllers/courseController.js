const { Course, Faculty, Student, Department } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();
    
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
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'employeeId')
      .populate({
        path: 'faculty',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'students',
        select: 'enrollmentNumber',
        populate: {
          path: 'user',
          select: 'name email'
        }
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
    const collegeId = req.body.college || req.user.college;
    
    // If department is provided as a string, find the department ObjectId
    let departmentId = req.body.department;
    if (typeof req.body.department === 'string') {
      const department = await Department.findOne({
        name: req.body.department,
        college: collegeId
      });
      
      if (department) {
        departmentId = department._id;
      } else {
        return next(new ErrorResponse(`Department '${req.body.department}' not found`, 404));
      }
    }
    
    const courseData = {
      ...req.body,
      college: collegeId,
      department: departmentId
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
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // Remove course from all students
    await Student.updateMany(
      { courses: req.params.id },
      { $pull: { courses: req.params.id } }
    );

    // Remove course from faculty
    if (course.faculty) {
      await Faculty.updateOne(
        { _id: course.faculty },
        { $pull: { courses: req.params.id } }
      );
    }

    await course.deleteOne();

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
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    const faculty = await Faculty.findById(req.params.facultyId);
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.facultyId}`, 404)
      );
    }

    // If course already has a different faculty, remove course from that faculty
    if (course.faculty && course.faculty.toString() !== req.params.facultyId) {
      await Faculty.updateOne(
        { _id: course.faculty },
        { $pull: { courses: req.params.id } }
      );
    }

    // Update course with new faculty
    course.faculty = req.params.facultyId;
    await course.save();

    // Add course to faculty's courses if not already there
    if (!faculty.courses.includes(req.params.id)) {
      faculty.courses.push(req.params.id);
      await faculty.save();
    }

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
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // If faculty, check if they're assigned to this course
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user: req.user.id });
      
      if (!faculty || !faculty.courses.includes(req.params.id)) {
        return next(
          new ErrorResponse(`Not authorized to access this course's students`, 403)
        );
      }
    }

    const students = await Student.find({ courses: req.params.id })
      .populate('user', 'name email contactNumber');

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
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      count: course.assignments.length,
      data: course.assignments
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
    
    const courses = await Course.find({
      department: department,
      semester: parseInt(semester)
    }).populate('faculty', 'employeeId')
      .populate({
        path: 'faculty',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
      message: `Found ${courses.length} courses for ${department} department, semester ${semester}`
    });
  } catch (error) {
    next(error);
  }
};
