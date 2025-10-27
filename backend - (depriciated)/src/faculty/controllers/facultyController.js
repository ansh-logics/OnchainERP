const { Faculty, Student, Course, User, Department, Fee, Transaction, Section, sequelize } = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');
const LoggingService = require('../../shared/services/LoggingService');

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
          as: 'courses',  // Fixed: Added correct alias
          attributes: ['code', 'name', 'credits']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
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
    console.error('Error fetching faculty:', error);
    next(error);
  }
};

// @desc    Get current faculty profile
// @route   GET /api/faculty/profile
// @access  Private/Faculty
exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const faculty = await Faculty.findOne({
      where: { userId: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'code', 'name', 'credits']
        }
      ]
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Error fetching faculty profile:', error);
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

// @desc    Get student fees for faculty (read-only access to students in faculty's classes)
// @route   GET /api/faculty/fees
// @access  Private/Faculty
exports.getStudentFeesForFaculty = async (req, res, next) => {
  try {
    // Get the faculty member
    const faculty = await Faculty.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'code', 'name']
        }
      ]
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Get course IDs taught by this faculty
    const courseIds = faculty.courses.map(course => course.id);

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No courses assigned to this faculty member'
      });
    }

    // Get students enrolled in these courses with their fee information
    const students = await Student.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name', 'code']
        },
        {
          model: Fee,
          as: 'fees',
          where: { isActive: true },
          required: false
        },
        {
          model: Course,
          as: 'courses',
          where: { id: { [Op.in]: courseIds } },
          attributes: ['id', 'code', 'name'],
          through: { attributes: [] }
        }
      ],
      order: [['enrollmentNumber', 'ASC']]
    });

    // Transform data to include fee summary
    const feeData = students.map(student => {
      const currentFee = student.fees && student.fees.length > 0 
        ? student.fees[0] 
        : null;

      return {
        studentId: student.id,
        enrollmentNumber: student.enrollmentNumber,
        rollNumber: student.rollNumber,
        name: student.user.name,
        email: student.user.email,
        department: student.department?.name,
        section: student.section?.name,
        currentSemester: student.currentSemester,
        feeSummary: {
          totalFees: currentFee ? currentFee.totalFees : 0,
          paidAmount: currentFee ? currentFee.paidAmount : 0,
          remainingAmount: currentFee ? currentFee.remainingAmount : 0,
          feeStatus: currentFee ? currentFee.feeStatus : 'Unpaid'
        }
      };
    });

    res.status(200).json({
      success: true,
      count: feeData.length,
      data: feeData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student payments for faculty dashboard
// @route   GET /api/faculty/:id/students/payments
// @access  Private/Faculty
exports.getFacultyStudentPayments = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id);
    
    if (!faculty) {
      return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
    }

    // Check authorization - only the faculty themselves can access their data
    if (faculty.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to access this faculty's data`, 403));
    }

    const { status, semester, section } = req.query;

    // Build where clause for students in faculty's department
    const studentWhere = {
      departmentId: faculty.departmentId
    };

    if (semester) {
      studentWhere.currentSemester = semester;
    }
    if (section) {
      studentWhere.sectionId = section;
    }

    // Build where clause for transactions
    const transactionWhere = {
      type: 'income'
    };

    if (status) {
      transactionWhere.status = status;
    }

    // Get students and their transactions
    const students = await Student.findAll({
      where: studentWhere,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['name', 'code'],
          required: false
        },
        {
          model: Transaction,
          as: 'transactions',
          where: transactionWhere,
          required: false,
          order: [['paidDate', 'DESC']]
        },
        {
          model: Fee,
          as: 'fees',
          where: { isActive: true },
          required: false
        }
      ],
      order: [['enrollmentNumber', 'ASC']]
    });

    // Transform student payment data
    const studentPayments = students.map(student => {
      const paidTransactions = student.transactions 
        ? student.transactions.filter(t => t.status === 'paid') 
        : [];
      const pendingTransactions = student.transactions 
        ? student.transactions.filter(t => ['pending', 'overdue'].includes(t.status)) 
        : [];

      const currentFee = student.fees && student.fees.length > 0 ? student.fees[0] : null;

      return {
        studentId: student.id,
        name: student.user.name,
        email: student.user.email,
        enrollmentNumber: student.enrollmentNumber,
        rollNumber: student.rollNumber,
        section: student.section?.name,
        currentSemester: student.currentSemester,
        paymentSummary: {
          totalPaid: paidTransactions.reduce((sum, t) => sum + parseFloat(t.amount) / 100, 0),
          totalPending: pendingTransactions.reduce((sum, t) => sum + parseFloat(t.amount) / 100, 0),
          paidCount: paidTransactions.length,
          pendingCount: pendingTransactions.length,
          lastPaymentDate: paidTransactions.length > 0 ? paidTransactions[0].paidDate : null,
          feeStatus: currentFee?.feeStatus || 'Unknown'
        },
        recentTransactions: paidTransactions.slice(0, 3).map(t => ({
          id: t.id,
          amount: parseFloat(t.amount) / 100,
          paymentDate: t.paidDate,
          paymentMethod: t.paymentMethod,
          referenceNumber: t.referenceNumber
        }))
      };
    });

    // Calculate department summary
    const departmentSummary = {
      totalStudents: students.length,
      studentsWithPaidFees: studentPayments.filter(s => s.paymentSummary.paidCount > 0).length,
      studentsWithPendingFees: studentPayments.filter(s => s.paymentSummary.pendingCount > 0).length,
      totalCollected: studentPayments.reduce((sum, s) => sum + s.paymentSummary.totalPaid, 0),
      totalPending: studentPayments.reduce((sum, s) => sum + s.paymentSummary.totalPending, 0)
    };

    res.status(200).json({
      success: true,
      count: studentPayments.length,
      departmentSummary,
      data: studentPayments
    });
  } catch (error) {
    console.error('Error fetching faculty student payments:', error);
    next(error);
  }
};

// @desc    Get faculty department financial overview
// @route   GET /api/faculty/:id/dashboard/financial
// @access  Private/Faculty
exports.getFacultyFinancialOverview = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['name', 'code']
        }
      ]
    });
    
    if (!faculty) {
      return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
    }

    // Check authorization
    if (faculty.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to access this faculty's dashboard`, 403));
    }

    // Get current month date range
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get students in faculty's department
    const departmentStudents = await Student.findAll({
      where: { departmentId: faculty.departmentId },
      attributes: ['id']
    });

    const studentIds = departmentStudents.map(s => s.id);

    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          departmentInfo: {
            name: faculty.department?.name,
            code: faculty.department?.code
          },
          overview: {
            totalStudents: 0,
            monthlyCollection: 0,
            totalCollection: 0,
            pendingAmount: 0,
            recentPayments: []
          }
        }
      });
    }

    // Get monthly transactions for department students
    const monthlyTransactions = await Transaction.find({
      studentId: { $in: studentIds },
      type: 'income',
      status: 'paid',
      paidDate: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Get all-time transactions for department students
    const allTransactions = await Transaction.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          type: 'income'
        }
      },
      {
        $group: {
          _id: null,
          totalPaid: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
          },
          totalPending: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'overdue']] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Get recent payments with student details
    const recentPayments = await Transaction.find({
      studentId: { $in: studentIds },
      type: 'income',
      status: 'paid'
    })
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name'
      }
    })
    .sort({ paidDate: -1 })
    .limit(10);

    const overview = {
      totalStudents: departmentStudents.length,
      monthlyCollection: monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount) / 100, 0),
      totalCollection: parseFloat(allTransactions[0]?.totalPaid || 0) / 100,
      pendingAmount: parseFloat(allTransactions[0]?.totalPending || 0) / 100,
      recentPayments: recentPayments.map(t => ({
        id: t.id,
        amount: parseFloat(t.amount) / 100,
        paymentDate: t.paidDate,
        studentName: t.student?.user?.name || 'Unknown',
        paymentMethod: t.paymentMethod,
        referenceNumber: t.referenceNumber
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        departmentInfo: {
          name: faculty.department?.name,
          code: faculty.department?.code
        },
        overview
      }
    });
  } catch (error) {
    console.error('Error fetching faculty financial overview:', error);
    next(error);
  }
};

// @desc    Get courses assigned to the logged-in faculty
// @route   GET /api/faculty-services/faculty/courses
// @access  Private/Faculty
exports.getFacultyCourses = async (req, res, next) => {
  try {
    const facultyId = req.user.facultyProfile?.id;

    if (!facultyId) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Get courses assigned to this faculty
    const courses = await Course.findAll({
      where: {
        facultyId: facultyId
      },
      attributes: ['id', 'code', 'name', 'credits', 'courseType', 'semester'],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'shortName']
        }
      ],
      order: [['semester', 'ASC'], ['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching faculty courses:', error);
    next(error);
  }
};
