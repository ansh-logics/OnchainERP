const { Student, User, Course, Department } = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');
const LoggingService = require('../../shared/services/LoggingService');
const path = require('path');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin or Faculty
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.findAll({
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
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Course,
          as: 'courses',
          attributes: ['code', 'name', 'credits'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if the requester is the student or has proper role
    if (
      req.user.role === 'student' && 
      student.user.id.toString() !== req.user.id && 
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
    const student = await Student.findByPk(req.params.id);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if the requester is the student or has proper role
    if (
      req.user.role === 'student' && 
      student.userId.toString() !== req.user.id && 
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
    const student = await Student.findByPk(req.params.id);
    
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
    const student = await Student.findByPk(req.params.id);
    
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
    const student = await Student.findByPk(req.params.id);
    
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
    const student = await Student.findByPk(req.params.id);
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    const course = await Course.findByPk(req.params.courseId);
    
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
  try {
    const {
      // User fields
      name,
      email,
      password,
      contactNumber,
      addressStreet,
      addressCity,
      addressState,
      addressPincode,
      addressCountry = 'India',
      
      // Student identification
      enrollmentNumber,
      studentId,
      rollNumber,
      
      // Academic details
      batch,
      program,
      admissionYear,
      currentSemester = 1,
      
      // Personal details (required)
      dateOfBirth,
      gender,
      category,
      bloodGroup,
      religion,
      nationality = 'Indian',
      
      // Contact details
      personalEmail,
      personalPhone,
      
      // Address details
      permanentAddressStreet,
      permanentAddressCity,
      permanentAddressState,
      permanentAddressPincode,
      permanentAddressCountry = 'India',
      currentAddressStreet,
      currentAddressCity,
      currentAddressState,
      currentAddressPincode,
      currentAddressCountry = 'India',
      
      // Guardian details (required)
      guardianName,
      guardianRelation,
      guardianPhone,
      guardianEmail,
      guardianOccupation,
      
      // Academic performance
      cgpa,
      
      // Status
      admissionStatus = 'enrolled',
      isActive = true,
      
      // Department and College IDs
      departmentId,
      department,
      collegeId,
      college,
      sectionId
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
      role: 'student',
      collegeId: finalCollegeId,
      departmentId: finalDepartmentId,
      phone: contactNumber,
      addressStreet,
      addressCity,
      addressState,
      addressPincode,
      addressCountry
    });

    // Create student with all required fields
    const student = await Student.create({
      userId: user.id,
      collegeId: finalCollegeId,
      departmentId: finalDepartmentId,
      sectionId,
      
      // Student identification
      rollNumber,
      enrollmentNumber,
      studentId,
      
      // Academic details
      batch,
      program,
      admissionYear,
      currentSemester,
      
      // Personal details
      dateOfBirth,
      gender,
      bloodGroup,
      category,
      religion,
      nationality,
      
      // Contact details
      personalEmail,
      personalPhone,
      
      // Address
      permanentAddressStreet,
      permanentAddressCity,
      permanentAddressState,
      permanentAddressPincode,
      permanentAddressCountry,
      currentAddressStreet,
      currentAddressCity,
      currentAddressState,
      currentAddressPincode,
      currentAddressCountry,
      
      // Guardian details
      guardianName,
      guardianRelation,
      guardianPhone,
      guardianEmail,
      guardianOccupation,
      
      // Academic performance
      cgpa,
      
      // Status
      admissionStatus,
      isActive
    });

    // Auto-assign courses based on department and semester
    const coursesToAssign = await Course.findAll({
      where: {
        departmentId: finalDepartmentId,
        semester: currentSemester
      }
    });

    if (coursesToAssign.length > 0) {
      // Add student to each course through many-to-many relationship
      await student.addCourses(coursesToAssign);
    }

    // Get the populated student response
    const populatedStudent = await Student.findByPk(student.id, {
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
        },
        {
          model: Course,
          as: 'courses',
          attributes: ['code', 'name', 'credits', 'semester'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: populatedStudent,
      message: `Student created and automatically assigned to ${coursesToAssign.length} courses for ${finalDepartmentId} department, semester ${currentSemester}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add student to department with auto course assignment
// @route   POST /api/students/:id/department
// @access  Private/Admin only
exports.addStudentToDepartment = async (req, res, next) => {
  try {
    const { department, currentSemester } = req.body;
    
    const student = await Student.findByPk(req.params.id);
    
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
    const coursesToAssign = await Course.findAll({
      where: {
        departmentId: department,
        semester: currentSemester || student.currentSemester
      }
    });

    // Remove student from previous courses
    if (student.courses.length > 0) {
      await Promise.all(student.courses.map(async (courseId) => {
        const course = await Course.findByPk(courseId);
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
    const user = await User.findByPk(student.userId);
    if (user) {
      await user.update({ departmentId: department });
    }

    // Populate the response
    const populatedStudent = await Student.findByPk(student.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Course,
          as: 'courses',
          attributes: ['code', 'name', 'credits', 'semester'],
          through: { attributes: [] }
        }
      ]
    });

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
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: User }]
    });
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check authorization - only the student themselves or admin can upload
    if (student.user.id.toString() !== req.user.id && req.user.role !== 'admin') {
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
    await User.update(
      { profilePicture: req.file.path },
      { where: { id: student.user.id } }
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

// @desc    Get student dashboard data
// @route   GET /api/students/:id/dashboard
// @access  Private/Student only
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'profilePicture']
        },
        {
          model: Course,
          attributes: ['code', 'name', 'credits'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    // Check authorization - only the student themselves can access their dashboard
    if (student.user.id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Not authorized to access this student's dashboard`, 403)
      );
    }

    // Get recent assignments (placeholder - would need assignment model)
    const recentAssignments = [];

    // Calculate statistics (placeholder)
    const totalAssignments = 0;
    const submittedAssignments = 0;
    const pendingAssignments = 0;
    const gradedAssignments = 0;
    const averageGrade = 0;

    const dashboardData = {
      studentInfo: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        profilePicture: student.user.profilePicture,
        enrollmentNumber: student.enrollmentNumber,
        studentId: student.studentId,
        batch: student.batch,
        program: student.program,
        currentSemester: student.currentSemester
      },
      courses: student.courses || [],
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
        totalClasses: 0,
        attendedClasses: 0
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
