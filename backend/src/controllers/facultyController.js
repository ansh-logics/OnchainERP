const { Faculty, Student, Course, User, Department } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
exports.getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single faculty
// @route   GET /api/faculty/:id
// @access  Private
exports.getFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Course,
          attributes: ['code', 'name', 'credits']
        }
      ]
    });
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty's courses
// @route   GET /api/faculty/:id/courses
// @access  Private
exports.getFacultyCourses = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id);
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    const courses = await Course.findAll({
      where: {
        facultyId: faculty.id
      }
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark student attendance
// @route   POST /api/faculty/:id/courses/:courseId/attendance
// @access  Private/Faculty only
exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, present } = req.body;
    
    // Check if faculty exists and is assigned to the course
    const faculty = await Faculty.findByPk(req.params.id);
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Only the faculty themselves or admin can mark attendance
    if (faculty.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Not authorized to mark attendance`, 403)
      );
    }

    // Check if course exists
    const course = await Course.findByPk(req.params.courseId);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
      );
    }

    // Check if faculty is assigned to this course
    if (!faculty.courses.includes(req.params.courseId)) {
      return next(
        new ErrorResponse(`Faculty is not assigned to this course`, 403)
      );
    }

    // Check if student exists and is enrolled in the course
    const student = await Student.findByPk(studentId);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${studentId}`, 404)
      );
    }

    if (!student.courses.includes(req.params.courseId)) {
      return next(
        new ErrorResponse(`Student is not enrolled in this course`, 400)
      );
    }

    // Add attendance record
    const attendanceRecord = {
      course: req.params.courseId,
      date: date || Date.now(),
      present,
      markedBy: req.user.id
    };

    student.attendance.push(attendanceRecord);
    await student.save();

    res.status(200).json({
      success: true,
      data: attendanceRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade student assignment
// @route   POST /api/faculty/:id/students/:studentId/assignments/:assignmentId/grade
// @access  Private/Faculty only
exports.gradeAssignment = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    
    // Check if faculty exists
    const faculty = await Faculty.findByPk(req.params.id, {
      include: [{ model: User }]
    });
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Only the faculty themselves can grade assignments
    if (faculty.user.id.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`Not authorized to grade assignments`, 403)
      );
    }

    // Check if student exists
    const student = await Student.findByPk(req.params.studentId);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.studentId}`, 404)
      );
    }

    // Find the assignment in the student's assignments array
    const assignmentIndex = student.assignments.findIndex(
      assignment => assignment._id.toString() === req.params.assignmentId
    );

    if (assignmentIndex === -1) {
      return next(
        new ErrorResponse(`Assignment not found with id of ${req.params.assignmentId}`, 404)
      );
    }

    // Update assignment details
    student.assignments[assignmentIndex].status = 'graded';
    student.assignments[assignmentIndex].feedback = feedback;
    student.assignments[assignmentIndex].grade = score;

    await student.save();

    // Add grade record
    const gradeRecord = {
      course: student.assignments[assignmentIndex].course,
      assignment: student.assignments[assignmentIndex].title,
      score,
      maxScore: 100, // Assuming max score is 100, adjust as needed
      gradedBy: req.user.id
    };

    student.grades.push(gradeRecord);
    await student.save();

    res.status(200).json({
      success: true,
      data: student.assignments[assignmentIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assignment
// @route   POST /api/faculty/:id/courses/:courseId/assignments
// @access  Private/Faculty only
exports.createAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, totalMarks } = req.body;
    
    // Check if faculty exists
    const faculty = await Faculty.findByPk(req.params.id, {
      include: [{ model: User }]
    });
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Only the faculty themselves can create assignments
    if (faculty.user.id.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`Not authorized to create assignments`, 403)
      );
    }

    // Check if course exists
    const course = await Course.findByPk(req.params.courseId);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
      );
    }

    // Check if faculty is assigned to this course
    if (!faculty.courses.includes(req.params.courseId)) {
      return next(
        new ErrorResponse(`Faculty is not assigned to this course`, 403)
      );
    }

    // Create assignment in course
    const assignment = {
      title,
      description,
      dueDate,
      totalMarks
    };

    course.assignments.push(assignment);
    await course.save();

    // Add assignment to each student enrolled in the course  
    const students = await Student.findAll({
      include: [{
        model: Course,
        where: { id: req.params.courseId },
        through: { attributes: [] }
      }]
    });
    
    const studentAssignment = {
      title,
      description,
      course: req.params.courseId,
      dueDate,
      status: 'pending'
    };

    for (const student of students) {
      student.assignments.push(studentAssignment);
      await student.save();
    }

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload faculty profile picture
// @route   POST /api/faculty/:id/profile-picture
// @access  Private/Faculty only or Admin
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id, {
      include: [{ model: User }]
    });
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Check authorization - only the faculty themselves or admin can upload
    if (faculty.User.id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Not authorized to upload profile picture for this faculty`, 403)
      );
    }

    // Check if file was uploaded
    if (!req.file) {
      return next(
        new ErrorResponse('Please upload a profile picture', 400)
      );
    }

    // Update user's profile picture
    await User.update(
      { profilePicture: req.file.path },
      { where: { id: faculty.user.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: req.file.path,
        uploadedFile: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty dashboard data
// @route   GET /api/faculty/:id/dashboard
// @access  Private/Faculty only
exports.getFacultyDashboard = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'profilePicture']
        },
        {
          model: Course,
          attributes: ['code', 'name', 'credits'],
          include: [{
            model: Student,
            attributes: ['id'],
            include: [{
              model: User,
              attributes: ['name']
            }]
          }]
        }
      ]
    });
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Check authorization - only the faculty themselves can access their dashboard
    if (faculty.User.id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Not authorized to access this faculty's dashboard`, 403)
      );
    }

    // Calculate statistics
    const totalCourses = faculty.courses ? faculty.courses.length : 0;
    const totalStudents = faculty.courses 
      ? faculty.courses.reduce((total, course) => total + (course.students ? course.students.length : 0), 0) 
      : 0;

    // Get recent assignments created by this faculty (placeholder - would need assignment model)
    const recentAssignments = [];

    const dashboardData = {
      facultyInfo: {
        id: faculty.id,
        name: faculty.user.name,
        email: faculty.user.email,
        profilePicture: faculty.user.profilePicture,
        employeeId: faculty.employeeId,
        facultyId: faculty.facultyId,
        designation: faculty.designation
      },
      courses: faculty.courses ? faculty.courses.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        studentCount: course.students ? course.students.length : 0
      })) : [],
      statistics: {
        totalCourses,
        totalStudents,
        totalAssignments: recentAssignments.length
      },
      recentAssignments
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new faculty
// @route   POST /api/faculty
// @access  Private/Admin only
exports.createFaculty = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      contactNumber,
      addressStreet,
      addressCity,
      addressState,
      addressPincode,
      addressCountry = 'India',
      // Faculty-specific required fields
      employeeId,
      facultyId,
      designation,
      qualification,
      specialization,
      experience,
      joiningDate,
      employmentType,
      dateOfBirth,
      gender,
      // Optional fields
      salary,
      bloodGroup,
      maritalStatus,
      personalEmail,
      personalPhone,
      emergencyContact,
      isHOD = false,
      isActive = true,
      // Department and College IDs
      departmentId,
      department,
      collegeId,
      college
    } = req.body;

    // Use college from request or default to admin's college
    const finalCollegeId = collegeId || college || req.user.collegeId;
    
    // Handle department - can be provided as ID or name
    let finalDepartmentId = departmentId || department;
    
    // Handle department - can be provided as ID or name
    // First try to find by ID, if that fails, try by name
    if (finalDepartmentId && typeof finalDepartmentId === 'string') {
      // First attempt: try as ID
      let departmentRecord = await Department.findByPk(finalDepartmentId);
      
      // If not found by ID, try as name
      if (!departmentRecord) {
        departmentRecord = await Department.findOne({
          where: {
            name: finalDepartmentId,
            collegeId: finalCollegeId
          }
        });
        
        if (departmentRecord) {
          finalDepartmentId = departmentRecord.id;
        } else {
          return next(new ErrorResponse(`Department '${finalDepartmentId}' not found in college`, 404));
        }
      } else {
        // Verify department belongs to the college
        if (departmentRecord.collegeId.toString() !== finalCollegeId.toString()) {
          return next(new ErrorResponse(`Department does not belong to the specified college`, 400));
        }
      }
    }

    // Create user first
    const user = await User.create({
      name,
      email,
      password,
      role: 'faculty',
      collegeId: finalCollegeId,
      departmentId: finalDepartmentId,
      phone: contactNumber,
      addressStreet,
      addressCity,
      addressState,
      addressPincode,
      addressCountry
    });

    // Create faculty with all required fields
    const faculty = await Faculty.create({
      userId: user.id,
      collegeId: finalCollegeId,
      departmentId: finalDepartmentId,
      employeeId,
      facultyId,
      designation,
      qualification,
      specialization,
      experience,
      joiningDate,
      employmentType,
      dateOfBirth,
      gender,
      salary,
      bloodGroup,
      maritalStatus,
      personalEmail,
      personalPhone,
      emergencyContact,
      addressStreet,
      addressCity,
      addressState,
      addressPincode,
      addressCountry,
      isHOD,
      isActive
    });

    // Get the populated faculty response
    const populatedFaculty = await Faculty.findByPk(faculty.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name', 'shortName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: populatedFaculty,
      message: `Faculty created successfully`
    });
  } catch (error) {
    next(error);
  }
};
