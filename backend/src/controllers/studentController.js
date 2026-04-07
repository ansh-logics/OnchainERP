const { Student, User, Course, College, Department, sequelize } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');
const path = require('path');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin or Faculty
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email contactNumber department')
      .populate('courses', 'code name credits');
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if the requester is the student or has proper role
    if (
      req.user.role === 'student' && 
      student.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'faculty'
    ) {
      return next(
        new ErrorResponse(`Not authorized to access this student's data`, 403)
      );
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's attendance
// @route   GET /api/students/:id/attendance
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if the requester is the student or has proper role
    if (
      req.user.role === 'student' && 
      student.user.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'faculty'
    ) {
      return next(
        new ErrorResponse(`Not authorized to access this student's attendance`, 403)
      );
    }

    res.status(200).json({
      success: true,
      data: student.attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's grades
// @route   GET /api/students/:id/grades
// @access  Private
exports.getStudentGrades = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if the requester is the student or has proper role
    if (
      req.user.role === 'student' && 
      student.user.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'faculty'
    ) {
      return next(
        new ErrorResponse(`Not authorized to access this student's grades`, 403)
      );
    }

    res.status(200).json({
      success: true,
      data: student.grades
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit student assignment
// @route   POST /api/students/:id/assignments/:assignmentId
// @access  Private/Student only their own
exports.submitAssignment = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Only the student themselves can submit an assignment
    if (student.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`Not authorized to submit assignments for this student`, 403)
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
    student.assignments[assignmentIndex].submissionDate = Date.now();
    student.assignments[assignmentIndex].submissionFile = req.body.submissionFile;
    student.assignments[assignmentIndex].status = 'submitted';

    await student.save();

    res.status(200).json({
      success: true,
      data: student.assignments[assignmentIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment with file upload
// @route   POST /api/students/:id/assignments/:assignmentId/upload
// @access  Private/Student only
exports.submitAssignmentWithFile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Only the student themselves can submit an assignment
    if (student.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`Not authorized to submit assignments for this student`, 403)
      );
    }

    // Check if file was uploaded
    if (!req.file) {
      return next(
        new ErrorResponse('Please upload an assignment file', 400)
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

    // Update assignment details with file information
    student.assignments[assignmentIndex].submissionDate = Date.now();
    student.assignments[assignmentIndex].submissionFile = req.file.path;
    student.assignments[assignmentIndex].originalFileName = req.file.originalname;
    student.assignments[assignmentIndex].status = 'submitted';
    student.assignments[assignmentIndex].comments = req.body.comments || '';

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        assignment: student.assignments[assignmentIndex],
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

// @desc    Register student for a course
// @route   POST /api/students/:id/courses/:courseId
// @access  Private/Admin only
exports.registerCourse = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
      );
    }

    // Check if student already registered for this course
    if (student.courses.includes(req.params.courseId)) {
      return next(
        new ErrorResponse(`Student already registered for this course`, 400)
      );
    }

    // Add course to student's courses
    student.courses.push(req.params.courseId);
    await student.save();

    // Add student to course's students
    course.students.push(req.params.id);
    await course.save();

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student and auto-assign courses
// @route   POST /api/students
// @access  Private/Admin only
exports.createStudent = async (req, res, next) => {
  const tx = await sequelize.transaction();
  try {
    const {
      name,
      email,
      password,
      enrollmentNumber,
      batch,
      program,
      currentSemester,
      department,
      contactNumber,
      address,
      college
    } = req.body;

    const normalizedSemester = parseInt(String(currentSemester || 1), 10) || 1;
    const normalizedBatch = String(batch || "").trim();
    const inferredAdmissionYear = parseInt(normalizedBatch.slice(0, 4), 10);
    const admissionYear = Number.isFinite(inferredAdmissionYear)
      ? inferredAdmissionYear
      : new Date().getFullYear();

    // Resolve college for admin-created users.
    let resolvedCollegeId =
      college ||
      req.user?.studentProfile?.collegeId ||
      req.user?.facultyProfile?.collegeId ||
      null;

    if (!resolvedCollegeId) {
      const adminCollege = await College.findOne({
        where: { adminId: req.user.id },
        attributes: ['id'],
        transaction: tx
      });
      resolvedCollegeId = adminCollege?.id || null;
    }

    if (!resolvedCollegeId) {
      await tx.rollback();
      return next(new ErrorResponse('Unable to resolve college for this admin.', 400));
    }

    const departmentRecord = await Department.findOne({
      where: { id: department, collegeId: resolvedCollegeId },
      attributes: ['id'],
      transaction: tx
    });

    if (!departmentRecord) {
      await tx.rollback();
      return next(new ErrorResponse('Selected department is invalid for your college.', 400));
    }

    const user = await User.create(
      {
        name,
        email: String(email || '').trim().toLowerCase(),
        password,
        role: 'student',
        phone: contactNumber || null
      },
      { transaction: tx }
    );

    const student = await Student.create(
      {
        userId: user.id,
        collegeId: resolvedCollegeId,
        departmentId: departmentRecord.id,
        enrollmentNumber,
        batch: normalizedBatch,
        program,
        admissionYear,
        currentSemester: normalizedSemester,
        dateOfBirth: '2000-01-01',
        gender: 'Male',
        category: 'General',
        personalPhone: contactNumber || null,
        personalEmail: String(email || '').trim().toLowerCase(),
        permanentAddressStreet: address || null,
        currentAddressStreet: address || null,
        guardianName: `Guardian of ${name}`,
        guardianRelation: 'Guardian',
        guardianPhone: contactNumber || '9999999999',
        admissionStatus: 'enrolled'
      },
      { transaction: tx }
    );

    // Optional course lookup for message only (course-student M2M not defined in current schema).
    const coursesToAssign = await Course.findAll({
      where: { departmentId: departmentRecord.id, semester: normalizedSemester },
      attributes: ['id'],
      transaction: tx
    });

    await tx.commit();

    const populatedStudent = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Department, as: 'department', attributes: ['id', 'name', 'shortName'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: populatedStudent,
      message: `Student created successfully. ${coursesToAssign.length} matching courses found for semester ${normalizedSemester}.`
    });
  } catch (error) {
    await tx.rollback();
    if (error?.name === 'SequelizeUniqueConstraintError') {
      const duplicateField = error?.errors?.[0]?.path || 'field';
      return next(new ErrorResponse(`A user with this ${duplicateField} already exists.`, 409));
    }
    next(error);
  }
};

// @desc    Add student to department with auto course assignment
// @route   POST /api/students/:id/department
// @access  Private/Admin only
exports.addStudentToDepartment = async (req, res, next) => {
  try {
    const { department, currentSemester } = req.body;
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Update student's department
    student.department = department;
    if (currentSemester) {
      student.currentSemester = currentSemester;
    }

    // Find courses for the new department and semester
    const coursesToAssign = await Course.find({
      department: department,
      semester: currentSemester || student.currentSemester
    });

    // Remove student from previous courses
    if (student.courses.length > 0) {
      await Promise.all(student.courses.map(async (courseId) => {
        const course = await Course.findById(courseId);
        if (course) {
          course.students = course.students.filter(
            studentId => studentId.toString() !== student._id.toString()
          );
          await course.save();
        }
      }));
    }

    // Assign new courses
    student.courses = coursesToAssign.map(course => course._id);
    await student.save();

    // Add student to new courses
    await Promise.all(coursesToAssign.map(async (course) => {
      if (!course.students.includes(student._id)) {
        course.students.push(student._id);
        await course.save();
      }
    }));

    // Update user's department too
    const user = await User.findById(student.user);
    if (user) {
      user.department = department;
      await user.save();
    }

    // Populate the response
    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'name email contactNumber department')
      .populate('courses', 'code name credits semester');

    res.status(200).json({
      success: true,
      data: populatedStudent,
      message: `Student moved to ${department} department and automatically assigned to ${coursesToAssign.length} courses for semester ${currentSemester || student.currentSemester}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/students/:id/profile-picture
// @access  Private/Student only or Admin
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user');
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check authorization - only the student themselves or admin can upload
    if (student.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Not authorized to upload profile picture for this student`, 403)
      );
    }

    // Check if file was uploaded
    if (!req.file) {
      return next(
        new ErrorResponse('Please upload a profile picture', 400)
      );
    }

    // Update user's profile picture
    await User.findByIdAndUpdate(student.user._id, {
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

// @desc    Get student dashboard data
// @route   GET /api/students/:id/dashboard
// @access  Private/Student only
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email profilePicture department')
      .populate('courses', 'code name credits instructor');
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check authorization - only the student themselves can access their dashboard
    if (student.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Not authorized to access this student's dashboard`, 403)
      );
    }

    // Get recent assignments (pending and submitted)
    const recentAssignments = student.assignments
      .sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate))
      .slice(0, 5);

    // Calculate statistics
    const totalAssignments = student.assignments.length;
    const submittedAssignments = student.assignments.filter(a => a.status === 'submitted').length;
    const pendingAssignments = student.assignments.filter(a => a.status === 'pending').length;
    const gradedAssignments = student.assignments.filter(a => a.grade !== undefined).length;

    // Calculate average grade
    const gradedAssignmentsWithGrades = student.assignments.filter(a => a.grade !== undefined);
    const averageGrade = gradedAssignmentsWithGrades.length > 0 
      ? gradedAssignmentsWithGrades.reduce((sum, a) => sum + a.grade, 0) / gradedAssignmentsWithGrades.length 
      : 0;

    const dashboardData = {
      studentInfo: {
        id: student._id,
        name: student.user.name,
        email: student.user.email,
        profilePicture: student.user.profilePicture,
        department: student.user.department,
        enrollmentDate: student.enrollmentDate,
        studentId: student.studentId
      },
      courses: student.courses,
      assignments: {
        recent: recentAssignments,
        statistics: {
          total: totalAssignments,
          submitted: submittedAssignments,
          pending: pendingAssignments,
          graded: gradedAssignments,
          averageGrade: Math.round(averageGrade * 100) / 100
        }
      },
      attendance: {
        // This could be expanded with actual attendance data
        totalClasses: student.attendance ? student.attendance.length : 0,
        attendedClasses: student.attendance ? student.attendance.filter(a => a.status === 'present').length : 0
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};
