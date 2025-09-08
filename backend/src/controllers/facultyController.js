const { Faculty, Student, Course, User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
exports.getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.find().populate('user', 'name email department');
    
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
    const faculty = await Faculty.findById(req.params.id)
      .populate('user', 'name email contactNumber department')
      .populate('courses', 'code name credits');
    
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
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    const courses = await Course.find({ _id: { $in: faculty.courses } });

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
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Only the faculty themselves or admin can mark attendance
    if (faculty.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Not authorized to mark attendance`, 403)
      );
    }

    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    
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
    const student = await Student.findById(studentId);
    
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
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Only the faculty themselves can grade assignments
    if (faculty.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`Not authorized to grade assignments`, 403)
      );
    }

    // Check if student exists
    const student = await Student.findById(req.params.studentId);
    
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
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Only the faculty themselves can create assignments
    if (faculty.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`Not authorized to create assignments`, 403)
      );
    }

    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    
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
    const students = await Student.find({ courses: req.params.courseId });
    
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
    const faculty = await Faculty.findById(req.params.id).populate('user');
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Check authorization - only the faculty themselves or admin can upload
    if (faculty.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
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
    await User.findByIdAndUpdate(faculty.user._id, {
      profilePicture: req.file.path
    });

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
    const faculty = await Faculty.findById(req.params.id)
      .populate('user', 'name email profilePicture department')
      .populate({
        path: 'courses',
        select: 'code name credits students',
        populate: {
          path: 'students',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name'
          }
        }
      });
    
    if (!faculty) {
      return next(
        new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
      );
    }

    // Check authorization - only the faculty themselves can access their dashboard
    if (faculty.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Not authorized to access this faculty's dashboard`, 403)
      );
    }

    // Calculate statistics
    const totalCourses = faculty.courses.length;
    const totalStudents = faculty.courses.reduce((total, course) => total + (course.students ? course.students.length : 0), 0);

    // Get recent assignments created by this faculty
    const recentAssignments = faculty.assignments 
      ? faculty.assignments
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
          .slice(0, 5)
      : [];

    const dashboardData = {
      facultyInfo: {
        id: faculty._id,
        name: faculty.user.name,
        email: faculty.user.email,
        profilePicture: faculty.user.profilePicture,
        department: faculty.user.department,
        facultyId: faculty.facultyId,
        designation: faculty.designation
      },
      courses: faculty.courses.map(course => ({
        id: course._id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        studentCount: course.students ? course.students.length : 0
      })),
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
      facultyId,
      designation,
      department,
      contactNumber,
      address,
      qualification,
      experience,
      specialization,
      college
    } = req.body;

    // Use college from request or default to admin's college
    const userCollege = college || req.user.college;

    // Create user first
    const user = await User.create({
      name,
      email,
      password,
      role: 'faculty',
      college: userCollege,
      department,
      contactNumber,
      address
    });

    // Create faculty
    const faculty = await Faculty.create({
      user: user._id,
      facultyId,
      designation,
      qualification,
      experience,
      specialization,
      department
    });

    // Populate the response
    const populatedFaculty = await Faculty.findById(faculty._id)
      .populate('user', 'name email contactNumber department');

    res.status(201).json({
      success: true,
      data: populatedFaculty,
      message: `Faculty created successfully`
    });
  } catch (error) {
    next(error);
  }
};
