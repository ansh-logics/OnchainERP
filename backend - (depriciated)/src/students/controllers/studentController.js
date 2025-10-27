const { 
  Student, 
  User, 
  Course, 
  Department, 
  Section,
  Timetable,
  Exam,
  ExamResult,
  Transaction,
  Attendance,
  CourseEnrollment,
  College,
  Notification,
  Fee
} = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');

// @desc    Get student profile
// @route   GET /api/student-services/profile
// @access  Private/Student
const getStudentProfile = async (req, res, next) => {
  try {
    // Get student data from authenticated user
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'profilePicture', 'isActive']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code', 'shortName']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'code', 'semester', 'batch']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'shortName', 'logo']
        }
      ]
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student dashboard summary
// @route   GET /api/student-services/dashboard
// @access  Private/Student
const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'profilePicture']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name', 'code']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['name', 'semester']
        }
      ]
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get attendance statistics
    const totalAttendance = await Attendance.count({
      where: { studentId: student.id }
    });

    const presentCount = await Attendance.count({
      where: { 
        studentId: student.id,
        status: 'present'
      }
    });

    const attendancePercentage = totalAttendance > 0 
      ? ((presentCount / totalAttendance) * 100).toFixed(1)
      : 0;

    // Get enrolled courses count
    const enrolledCourses = await CourseEnrollment.count({
      where: { studentId: student.id, status: 'active' }
    });

    // Get pending fees - ensure studentId is converted to string for MongoDB
    const studentIdStr = String(student.id);
    console.log('[DASHBOARD] Looking for transactions for student ID:', studentIdStr);
    
    const pendingFees = await Transaction.find({
      studentId: studentIdStr,
      type: 'income',
      status: { $in: ['pending', 'overdue'] }
    }).select('_id amount category dueDate status');
    
    console.log('[DASHBOARD] Found pending fees:', pendingFees.length);

    const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + parseFloat(fee.amount) / 100, 0);

    // Get upcoming exams
    const upcomingExams = await Exam.findAll({
      where: {
        examDate: {
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'name'],
          required: true,
          include: [{
            model: Student,
            as: 'students',
            where: { id: student.id },
            attributes: [],
            through: { attributes: [] }
          }]
        }
      ],
      limit: 5,
      order: [['examDate', 'ASC']]
    });

    // Get recent notifications
    const notifications = await Notification.find({
      $or: [
        { recipientType: 'student' },
        { recipientId: req.user.id }
      ]
    }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          rollNumber: student.rollNumber,
          enrollmentNumber: student.enrollmentNumber,
          department: student.department?.name,
          section: student.section?.name,
          currentSemester: student.currentSemester || student.section?.semester,
          cgpa: student.cgpa,
          profilePicture: student.user.profilePicture
        },
        analytics: {
          attendance: parseFloat(attendancePercentage),
          cgpa: student.cgpa || 0,
          enrolledCourses,
          currentSemester: student.currentSemester || student.section?.semester || 1,
          creditsCompleted: 0, // TODO: Calculate from completed courses
          totalCredits: enrolledCourses * 4 // Approximate
        },
        pendingFees: {
          count: pendingFees.length,
          totalAmount: totalPendingAmount,
          fees: pendingFees.map(fee => ({
            ...fee.toObject(),
            amount: parseFloat(fee.amount) / 100
          }))
        },
        upcomingExams: upcomingExams.map(exam => ({
          id: exam.id,
          subject: exam.course?.name,
          subjectCode: exam.course?.code,
          examDate: exam.examDate,
          examType: exam.examType,
          startTime: exam.startTime,
          totalMarks: exam.totalMarks
        })),
        notifications: notifications || []
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    next(error);
  }
};

// @desc    Get student courses
// @route   GET /api/student-services/courses
// @access  Private/Student
const getStudentCourses = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get enrolled courses
    const enrollments = await CourseEnrollment.findAll({
      where: { 
        studentId: student.id,
        status: 'active'
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'name', 'credits', 'courseType', 'description']
        }
      ]
    });

    // For each course, get attendance and assignments stats
    const coursesWithStats = await Promise.all(enrollments.map(async (enrollment) => {
      const courseId = enrollment.courseId;

      // Get attendance for this course
      const totalClasses = await Attendance.count({
        where: { 
          studentId: student.id,
          courseId: courseId
        }
      });

      const presentClasses = await Attendance.count({
        where: { 
          studentId: student.id,
          courseId: courseId,
          status: 'present'
        }
      });

      const attendancePercentage = totalClasses > 0 
        ? ((presentClasses / totalClasses) * 100).toFixed(1)
        : 0;

      // TODO: Get assignments data when Assignment model is available
      const assignments = {
        total: 0,
        completed: 0
      };

      return {
        id: enrollment.course.id,
        code: enrollment.course.code,
        name: enrollment.course.name,
        credits: enrollment.course.credits,
        courseType: enrollment.course.courseType,
        description: enrollment.course.description,
        enrollmentId: enrollment.id,
        enrollmentDate: enrollment.enrollmentDate,
        grade: enrollment.grade,
        attendance: {
          total: totalClasses,
          present: presentClasses,
          percentage: parseFloat(attendancePercentage)
        },
        assignments: assignments
      };
    }));

    res.status(200).json({
      success: true,
      count: coursesWithStats.length,
      data: coursesWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student timetable
// @route   GET /api/student-services/timetable
// @access  Private/Student
const getStudentTimetable = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'semester']
        }
      ]
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    if (!student.sectionId) {
      return res.status(200).json({
        success: true,
        message: 'No section assigned yet',
        data: []
      });
    }

    // Get timetable for the student's section
    const timetable = await Timetable.findAll({
      where: { sectionId: student.sectionId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'name', 'credits']
        },
        {
          model: User,
          as: 'faculty',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [
        ['dayOfWeek', 'ASC'],
        ['period', 'ASC']
      ]
    });

    // Group by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timetableByDay = days.map(day => ({
      day,
      slots: timetable
        .filter(slot => slot.dayOfWeek === day)
        .map(slot => ({
          id: slot.id,
          period: slot.period,
          startTime: slot.startTime,
          endTime: slot.endTime,
          course: {
            id: slot.course?.id,
            code: slot.course?.code,
            name: slot.course?.name,
            credits: slot.course?.credits
          },
          faculty: slot.faculty ? {
            id: slot.faculty.id,
            name: slot.faculty.name
          } : null,
          classType: slot.classType,
          roomNumber: slot.roomNumber
        }))
    }));

    res.status(200).json({
      success: true,
      data: {
        section: student.section,
        timetable: timetableByDay
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student exam results
// @route   GET /api/student-services/results
// @access  Private/Student
const getStudentResults = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get all exam results for the student
    const results = await ExamResult.findAll({
      where: { studentId: student.id },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'examType', 'examDate', 'totalMarks', 'passingMarks'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'code', 'name', 'credits']
            }
          ]
        }
      ],
      order: [['exam', 'examDate', 'DESC']]
    });

    // Group by semester/exam type
    const formattedResults = results.map(result => ({
      id: result.id,
      examId: result.examId,
      courseCode: result.exam?.course?.code,
      courseName: result.exam?.course?.name,
      credits: result.exam?.course?.credits,
      examType: result.exam?.examType,
      examDate: result.exam?.examDate,
      marksObtained: result.marksObtained,
      totalMarks: result.exam?.totalMarks,
      passingMarks: result.exam?.passingMarks,
      grade: result.grade,
      percentage: result.exam?.totalMarks 
        ? ((result.marksObtained / result.exam.totalMarks) * 100).toFixed(2)
        : 0,
      isPassed: result.marksObtained >= result.exam?.passingMarks,
      remarks: result.remarks
    }));

    // Calculate overall statistics
    const totalExams = results.length;
    const passedExams = formattedResults.filter(r => r.isPassed).length;
    const averagePercentage = formattedResults.length > 0
      ? (formattedResults.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / formattedResults.length).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        results: formattedResults,
        statistics: {
          totalExams,
          passedExams,
          failedExams: totalExams - passedExams,
          averagePercentage: parseFloat(averagePercentage),
          cgpa: student.cgpa || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student notifications
// @route   GET /api/student-services/notifications
// @access  Private/Student
const getStudentNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = {
      $or: [
        { recipientType: 'student' },
        { recipientId: req.user.id }
      ]
    };

    if (unreadOnly === 'true') {
      query.readAt = { $exists: false };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/student-services/notifications/:id/read
// @access  Private/Student
const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    // Set readAt timestamp if not already set
    if (!notification.readAt) {
      notification.readAt = new Date();
      await notification.save();
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student fees/transactions
// @route   GET /api/student-services/fees
// @access  Private/Student
const getStudentFees = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    const { status } = req.query;

    const whereClause = {
      studentId: String(student.id),
      type: 'income'
    };

    if (status) {
      whereClause.status = status;
    }

    const fees = await Transaction.find(whereClause).sort({ dueDate: -1 });

    // Calculate summary (convert from paisa to rupees)
    const totalPaid = fees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + parseFloat(f.amount) / 100, 0);

    const totalPending = fees
      .filter(f => ['pending', 'overdue'].includes(f.status))
      .reduce((sum, f) => sum + parseFloat(f.amount) / 100, 0);

    const totalAmount = fees.reduce((sum, f) => sum + parseFloat(f.amount) / 100, 0);

    // Convert fee amounts from paisa to rupees for display
    const feesWithConvertedAmounts = fees.map(fee => ({
      ...fee.toObject(),
      amount: parseFloat(fee.amount) / 100
    }));

    res.status(200).json({
      success: true,
      count: fees.length,
      data: {
        fees: feesWithConvertedAmounts,
        summary: {
          totalAmount,
          totalPaid,
          totalPending,
          paidCount: fees.filter(f => f.status === 'paid').length,
          pendingCount: fees.filter(f => ['pending', 'overdue'].includes(f.status)).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student fee summary
// @route   GET /api/student-services/fee-summary
// @access  Private/Student
const getStudentFeeSummary = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get current fee record for the student
    const currentFee = await Fee.findOne({
      where: {
        studentId: student.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!currentFee) {
      return res.status(200).json({
        success: true,
        data: {
          totalFees: 0,
          paidAmount: 0,
          remainingAmount: 0,
          feeStatus: 'Unpaid'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalFees: currentFee.totalFees,
        paidAmount: currentFee.paidAmount,
        remainingAmount: currentFee.remainingAmount,
        feeStatus: currentFee.feeStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay order for payment
// @route   POST /api/student-services/create-payment-order
// @access  Private/Student
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return next(new ErrorResponse('Invalid payment amount', 400));
    }

    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get current fee record or create a default one for testing
    let currentFee = await Fee.findOne({
      where: {
        studentId: student.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!currentFee) {
      // Create a default fee record for testing/demo purposes
      currentFee = await Fee.create({
        studentId: student.id,
        collegeId: student.collegeId || '00000000-0000-0000-0000-000000000000',
        academicYear: '2024-25',
        semester: student.currentSemester || 1,
        totalFees: 100000, // Default ₹1,00,000
        paidAmount: 0,
        feeStatus: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
      });

      console.log('Created default fee record for student:', student.enrollmentNumber);
    }

    if (amount > currentFee.remainingAmount) {
      return next(new ErrorResponse(`Payment amount (₹${amount}) exceeds remaining balance (₹${currentFee.remainingAmount})`, 400));
    }

    // Create Razorpay order
    const { createOrder, generateShortReceipt } = require('../../shared/services/razorpayService');
    
    // Generate a shorter receipt ID to comply with Razorpay's 40-character limit
    const shortReceipt = generateShortReceipt('fee', student.enrollmentNumber);
    
    const orderData = {
      amount: amount,
      receipt: shortReceipt,
      notes: {
        student_id: student.id,
        enrollment_number: student.enrollmentNumber,
        fee_id: currentFee.id,
        academic_year: currentFee.academicYear,
        semester: currentFee.semester
      }
    };

    const razorpayOrder = await createOrder(orderData);

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RP4iA95YzW2bj1',
        studentName: student.user.name,
        studentEmail: student.user.email,
        description: `Fee payment for ${student.enrollmentNumber}`,
        feeSummary: {
          totalFees: currentFee.totalFees,
          paidAmount: currentFee.paidAmount,
          remainingAmount: currentFee.remainingAmount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and process Razorpay payment
// @route   POST /api/student-services/verify-payment
// @access  Private/Student
const verifyAndProcessPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return next(new ErrorResponse('Missing payment verification data', 400));
    }

    // Verify payment signature
    const { verifyPayment, getPaymentDetails } = require('../../shared/services/razorpayService');
    
    const isValid = verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid) {
      return next(new ErrorResponse('Payment verification failed', 400));
    }

    // Get payment details
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);

    const student = await Student.findOne({
      where: { userId: req.user.id },
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
        }
      ]
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get current fee record
    let currentFee = await Fee.findOne({
      where: {
        studentId: student.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!currentFee) {
      // This shouldn't happen if payment order was created properly, but handle it gracefully
      return next(new ErrorResponse('No active fee record found. Please create a new payment order.', 404));
    }

    // Update fee record
    const newPaidAmount = parseFloat(currentFee.paidAmount) + parseFloat(amount);
    await currentFee.update({
      paidAmount: newPaidAmount
    });

    // Create transaction record
    const transaction = await Transaction.create({
      collegeId: student.collegeId,
      studentId: student.id,
      type: 'income',
      category: 'tuition_fee',
      amount: paymentDetails.amount, // Use amount from Razorpay (already in paisa)
      description: `Fee payment via Razorpay - ${student.enrollmentNumber}`,
      paymentMethod: 'online',
      status: 'paid',
      paidDate: new Date(),
      referenceNumber: `RZP_${razorpay_payment_id}`,
      bankReferenceNumber: razorpay_order_id,
      academicYear: currentFee.academicYear,
      semester: currentFee.semester,
      notes: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_method: paymentDetails.method
      })
    });

    // Prepare receipt data for frontend
    const receiptData = {
      transactionId: transaction.referenceNumber,
      feeType: 'tuition',
      amount: parseFloat(amount),
      paymentDate: transaction.paidDate.toISOString(),
      semester: `Semester ${currentFee.semester}`,
      studentName: student.user.name,
      studentId: transaction.id.slice(0, 8).toUpperCase(),
      rollNumber: student.rollNumber,
      enrollmentNumber: student.enrollmentNumber,
      department: student.department?.name || 'N/A',
      paymentMethod: 'Razorpay',
      dueDate: currentFee.dueDate || new Date().toISOString(),
      academicYear: currentFee.academicYear || '2024-25'
    };

    res.status(200).json({
      success: true,
      message: 'Payment verified and processed successfully',
      data: {
        totalFees: currentFee.totalFees,
        paidAmount: newPaidAmount,
        remainingAmount: currentFee.remainingAmount,
        feeStatus: currentFee.feeStatus,
        transactionId: transaction.id,
        razorpayPaymentId: razorpay_payment_id,
        receiptNumber: transaction.referenceNumber,
        receiptData: receiptData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process student payment (Legacy - for backward compatibility)
// @route   POST /api/student-services/pay
// @access  Private/Student
const processStudentPayment = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return next(new ErrorResponse('Invalid payment amount', 400));
    }

    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get current fee record for the student
    const currentFee = await Fee.findOne({
      where: {
        studentId: student.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!currentFee) {
      return next(new ErrorResponse('No active fee record found', 404));
    }

    if (amount > currentFee.remainingAmount) {
      return next(new ErrorResponse('Payment amount exceeds remaining balance', 400));
    }

    // Update fee record
    const newPaidAmount = parseFloat(currentFee.paidAmount) + parseFloat(amount);
    await currentFee.update({
      paidAmount: newPaidAmount
    });

    // Create transaction record
    const transaction = await Transaction.create({
      collegeId: student.collegeId,
      studentId: student.id,
      type: 'income',
      category: 'tuition_fee',
      amount: amount * 100, // Convert to paisa for precision
      description: `Fee payment for student ${student.enrollmentNumber}`,
      paymentMethod: 'online',
      status: 'paid',
      paidDate: new Date(),
      referenceNumber: `FEE-${Date.now()}-${student.id.slice(0, 8)}`,
      academicYear: currentFee.academicYear,
      semester: currentFee.semester
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        totalFees: currentFee.totalFees,
        paidAmount: newPaidAmount,
        remainingAmount: currentFee.remainingAmount,
        feeStatus: currentFee.feeStatus,
        transactionId: transaction.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming exams for student
// @route   GET /api/student-services/exams/upcoming
// @access  Private/Student
const getUpcomingExams = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    const upcomingExams = await Exam.findAll({
      where: {
        examDate: {
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'name', 'credits'],
          required: true,
          include: [{
            model: Student,
            as: 'students',
            where: { id: student.id },
            attributes: [],
            through: { attributes: [] }
          }]
        }
      ],
      order: [['examDate', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: upcomingExams.length,
      data: upcomingExams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create payment order (specific endpoint as per requirements)
// @route   POST /api/student/pay/order  
// @access  Private/Student
const createStudentPaymentOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    
    console.log('Creating payment order for user:', { userId: req.user?.id, amount });

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Find student using authenticated user
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get current fee record
    const currentFee = await Fee.findOne({
      where: {
        studentId: student.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!currentFee) {
      return res.status(404).json({
        success: false,
        message: 'No active fee record found'
      });
    }

    // Validate remaining amount > 0
    if (currentFee.remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending fees found'
      });
    }

    if (amount > currentFee.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds remaining balance'
      });
    }

    // Create Razorpay order
    try {
      const { createOrder, generateShortReceipt } = require('../../shared/services/razorpayService');
      
      // Generate a shorter receipt ID to comply with Razorpay's 40-character limit
      const shortReceipt = generateShortReceipt('rcpt', student.id);
      
      const orderData = {
        amount: amount,
        receipt: shortReceipt,
        notes: {
          student_id: student.id,
          enrollment_number: student.enrollmentNumber,
          fee_id: currentFee.id,
          academic_year: currentFee.academicYear,
          semester: currentFee.semester.toString()
        }
      };

      console.log('Creating order with data:', orderData);
      
      const razorpayOrder = await createOrder(orderData);

      console.log('Order created successfully:', razorpayOrder);

      // Return order details as per requirements
      return res.status(200).json({
        success: true,
        data: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          status: razorpayOrder.status,
          receipt: razorpayOrder.receipt
        }
      });

    } catch (orderError) {
      console.error('Order creation failed:', orderError);
      return res.status(500).json({
        success: false,
        message: `Failed to create payment order: ${orderError.message}`
      });
    }

  } catch (error) {
    console.error('Payment order creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating payment order'
    });
  }
};

// @desc    Get payment receipt data
// @route   GET /api/student-services/receipt/:transactionId
// @access  Private/Student
const getPaymentReceipt = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    
    const student = await Student.findOne({
      where: { userId: req.user.id },
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
          model: College,
          as: 'college',
          attributes: ['name', 'shortName', 'address', 'phone', 'email']
        }
      ]
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      where: {
        [Op.or]: [
          { id: transactionId },
          { referenceNumber: transactionId }
        ],
        studentId: student.id,
        status: 'paid'
      }
    });

    if (!transaction) {
      return next(new ErrorResponse('Receipt not found or payment not completed', 404));
    }

    // Get fee details
    const fee = await Fee.findByPk(transaction.feeId || null);

    // Generate receipt data
    const receiptData = {
      // Receipt Details
      receiptNumber: `RCP${transaction.id}${Date.now().toString().slice(-4)}`,
      transactionId: transaction.referenceNumber || transaction.id,
      paymentDate: transaction.paidDate || transaction.createdAt,
      paymentMethod: transaction.paymentMethod === 'online' ? 'Razorpay' : transaction.paymentMethod,
      
      // Student Details
      studentName: student.user.name,
      studentId: transaction.id.slice(0, 8).toUpperCase(),
      rollNumber: student.rollNumber,
      enrollmentNumber: student.enrollmentNumber,
      department: student.department?.name || 'N/A',
      
      // Fee Details
      feeType: transaction.category.replace('_', ' ') || 'tuition fee',
      amount: parseFloat(transaction.amount) / 100, // Convert from paisa to rupees
      semester: transaction.semester ? `Semester ${transaction.semester}` : 'Current Semester',
      academicYear: transaction.academicYear || '2024-25',
      dueDate: fee?.dueDate || transaction.createdAt,
      
      // College Details
      collegeName: student.college?.name || 'OnchainERP College',
      collegeAddress: student.college?.address || 'College Address',
      collegePhone: student.college?.phone || '+91-XXXXXXXXXX',
      collegeEmail: student.college?.email || 'info@onchainerp.edu',
      
      // Additional Details
      description: transaction.description || `Fee payment for ${student.enrollmentNumber}`,
      bankReferenceNumber: transaction.bankReferenceNumber,
      notes: transaction.notes ? JSON.parse(transaction.notes) : {},
      
      // Status
      status: 'paid',
      generatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: receiptData
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    next(error);
  }
};

// @desc    Get all receipts for student
// @route   GET /api/student-services/receipts
// @access  Private/Student
const getStudentReceipts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get paid transactions for receipts
    const transactions = await Transaction.find({
      studentId: String(student.id),
      status: 'paid',
      type: 'income'
    })
    .sort({ paidDate: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const receipts = transactions.map(transaction => ({
      id: transaction.id,
      receiptNumber: `RCP${transaction.id}${Date.now().toString().slice(-4)}`,
      transactionId: transaction.referenceNumber || transaction.id,
      amount: parseFloat(transaction.amount) / 100,
      category: transaction.category,
      paymentDate: transaction.paidDate || transaction.createdAt,
      paymentMethod: transaction.paymentMethod === 'online' ? 'Razorpay' : transaction.paymentMethod,
      semester: transaction.semester,
      academicYear: transaction.academicYear
    }));

    const total = await Transaction.countDocuments({
      studentId: String(student.id),
      status: 'paid',
      type: 'income'
    });

    res.status(200).json({
      success: true,
      count: receipts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: receipts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentProfile,
  getStudentDashboard,
  getStudentCourses,
  getStudentTimetable,
  getStudentResults,
  getStudentNotifications,
  markNotificationAsRead,
  getStudentFees,
  getStudentFeeSummary,
  processStudentPayment,
  createPaymentOrder,
  verifyAndProcessPayment,
  getUpcomingExams,
  createStudentPaymentOrder,
  getPaymentReceipt,
  getStudentReceipts
};

