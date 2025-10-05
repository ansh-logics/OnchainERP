const { User, Student, Faculty, Course, Department, Fee, Transaction, sequelize } = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');
const LoggingService = require('../../shared/services/LoggingService');

// @desc    Get system dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Count users by role
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalFaculty = await User.count({ where: { role: 'faculty' } });
    const totalAdmin = await User.count({ where: { role: 'admin' } });
    
    // Count courses
    const totalCourses = await Course.count();
    
    // Get departments from Department collection
    let whereClause = {};
    // If not super admin, only show departments from user's college
    if (req.user.role !== 'super_admin') {
      const userCollegeId = req.user.college?.id || req.user.collegeId;
      whereClause.collegeId = userCollegeId;
    }
    
    const departments = await Department.findAll({ 
      where: whereClause,
      attributes: ['name', 'shortName']
    });
    const totalDepartments = departments.length;
    const departmentNames = departments.map(dept => dept.name);
    
    // Get recent users
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['name', 'email', 'role', 'createdAt'],
      include: [
        {
          association: 'studentProfile',
          attributes: ['departmentId'],
          required: false
        },
        {
          association: 'facultyProfile', 
          attributes: ['departmentId'],
          required: false
        }
      ]
    });
    
    // Get financial summary for dashboard
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const monthlyPayments = await Transaction.find({
      type: 'income',
      status: 'paid',
      paidDate: {
        $gte: startOfMonth,
        $lte: currentDate
      }
    }).select('amount paymentMethod');

    const totalRevenue = await Transaction.aggregate([
      {
        $match: {
          type: 'income',
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const recentPayments = await Transaction.find({
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
    .limit(5);

    const financialStats = {
      monthlyRevenue: Math.round(monthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount) / 100, 0) * 100) / 100,
      monthlyTransactions: monthlyPayments.length,
      totalRevenue: Math.round(parseFloat(totalRevenue[0]?.totalAmount || 0) / 100 * 100) / 100,
      totalTransactions: parseInt(totalRevenue[0]?.totalCount || 0),
      razorpayPayments: monthlyPayments.filter(p => p.paymentMethod === 'online').length,
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: Math.round(parseFloat(p.amount) / 100 * 100) / 100,
        studentName: p.student?.user?.name || 'Unknown',
        paymentDate: p.paidDate,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        userStats: {
          totalUsers: totalStudents + totalFaculty + totalAdmin,
          totalStudents,
          totalFaculty,
          totalAdmin
        },
        courseStats: {
          totalCourses
        },
        departmentStats: {
          totalDepartments,
          departments: departmentNames
        },
        financialStats,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate student attendance report
// @route   GET /api/admin/reports/attendance
// @access  Private/Admin
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }
    
    // Get students with their attendance data (assuming attendance is stored in a separate table or JSON field)
    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          association: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    
    // Format attendance data
    const attendanceReport = students.map(student => {
      // Note: Attendance would need to be implemented as a separate model
      // For now, return placeholder data
      const attendanceByDate = {};
      
      return {
        studentId: student.id,
        enrollmentNumber: student.enrollmentNumber,
        name: student.User.name,
        email: student.User.email,
        attendance: attendanceByDate
      };
    });
    
    res.status(200).json({
      success: true,
      count: attendanceReport.length,
      data: attendanceReport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate student grade report
// @route   GET /api/admin/reports/grades
// @access  Private/Admin
exports.getGradeReport = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    
    let whereClause = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    // Get students with their grade data
    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          association: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    
    // Format grade data
    const gradeReport = students.map(student => {
      // Note: Grades would need to be implemented as a separate model
      // For now, return placeholder data
      const gradesByCourse = {};
      
      return {
        studentId: student.id,
        enrollmentNumber: student.enrollmentNumber,
        name: student.User.name,
        email: student.User.email,
        courses: gradesByCourse
      };
    });
    
    res.status(200).json({
      success: true,
      count: gradeReport.length,
      data: gradeReport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new department
// @route   POST /api/admin/departments
// @access  Private/Admin
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, hod } = req.body;
    
    // Check if HOD (Head of Department) exists
    if (hod) {
      const hodUser = await User.findByPk(hod);
      if (!hodUser) {
        return next(
          new ErrorResponse(`User not found with id of ${hod}`, 404)
        );
      }
    }
    
    // For now, we'll just return a success message
    // In a real application, you would create a Department model and save the data
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        name,
        description,
        hod
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student fees for admin dashboard
// @route   GET /api/admin/fees
// @access  Private/Admin
exports.getAllStudentFees = async (req, res, next) => {
  try {
    const { departmentId, sectionId, semester, feeStatus, showAll = false } = req.query;

    // Build where clause
    const whereClause = {
      isActive: true
    };

    // Add filters if provided
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }
    if (sectionId) {
      whereClause.sectionId = sectionId;
    }
    if (semester) {
      whereClause.currentSemester = semester;
    }

    // Get students with their fee information and transactions
    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
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
          model: Transaction,
          as: 'transactions',
          where: { 
            type: 'income',
            status: { [Op.in]: ['paid', 'pending', 'overdue'] }
          },
          required: false,
          order: [['paidDate', 'DESC']]
        }
      ],
      order: [['enrollmentNumber', 'ASC']]
    });

    // Transform data to include fee summary and transaction data
    const feeData = students.map(student => {
      const currentFee = student.fees && student.fees.length > 0 
        ? student.fees[0] 
        : null;

      // Calculate transaction-based amounts (convert from paisa to rupees)
      const paidTransactions = student.transactions 
        ? student.transactions.filter(t => t.status === 'paid') 
        : [];
      const pendingTransactions = student.transactions 
        ? student.transactions.filter(t => ['pending', 'overdue'].includes(t.status)) 
        : [];

      const actualPaidAmount = paidTransactions.reduce((sum, t) => sum + parseFloat(t.amount) / 100, 0);
      const actualPendingAmount = pendingTransactions.reduce((sum, t) => sum + parseFloat(t.amount) / 100, 0);

      // Get recent payments (last 5 transactions)
      const recentPayments = paidTransactions
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          amount: Math.round(parseFloat(t.amount) / 100 * 100) / 100, // Ensure proper decimal formatting
          paymentDate: t.paidDate,
          paymentMethod: t.paymentMethod,
          referenceNumber: t.referenceNumber,
          category: t.category,
          description: t.description
        }));

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
          // Use Fee table data for overall fee structure, but prioritize Transaction data for amounts
          // Ensure all numbers are properly converted to avoid concatenation issues
          totalFees: currentFee ? parseFloat(currentFee.totalFees) : 0,
          paidAmount: Math.round(actualPaidAmount * 100) / 100, // Use actual payments from transactions, rounded to 2 decimal places
          remainingAmount: currentFee ? Math.max(0, Math.round((parseFloat(currentFee.totalFees) - actualPaidAmount) * 100) / 100) : 0,
          feeStatus: currentFee ? currentFee.feeStatus : 'Unpaid',
          academicYear: currentFee ? currentFee.academicYear : null,
          semester: currentFee ? parseInt(currentFee.semester) : null,
          
          // Additional transaction-based data
          feeRecordPaidAmount: currentFee ? Math.round(parseFloat(currentFee.paidAmount) * 100) / 100 : 0, // Original fee record amount
          actualPaidAmount: Math.round(actualPaidAmount * 100) / 100, // Actual payments from transactions
          actualPendingAmount: Math.round(actualPendingAmount * 100) / 100,
          totalTransactionAmount: Math.round((actualPaidAmount + actualPendingAmount) * 100) / 100,
          paidTransactionCount: paidTransactions.length,
          pendingTransactionCount: pendingTransactions.length,
          
          // Flag if there's a discrepancy between Fee and Transaction data
          hasDiscrepancy: currentFee && Math.abs(parseFloat(currentFee.paidAmount) - actualPaidAmount) > 0.01
        },
        recentPayments,
        allTransactions: student.transactions ? student.transactions.map(t => ({
          id: t.id,
          amount: Math.round(parseFloat(t.amount) / 100 * 100) / 100, // Ensure proper decimal formatting
          status: t.status,
          paymentDate: t.paidDate,
          paymentMethod: t.paymentMethod,
          referenceNumber: t.referenceNumber,
          category: t.category,
          description: t.description
        })) : []
      };
    });

    // Filter out students with no pending amounts (only show those who need to pay)
    // Unless showAll=true is passed as query parameter
    let filteredData = feeData;
    if (showAll !== 'true') {
      filteredData = feeData.filter(student => {
        const remainingAmount = parseFloat(student.feeSummary.remainingAmount) || 0;
        return remainingAmount > 0; // Only include students with pending payments
      });
    }

    // Apply fee status filter if provided
    if (feeStatus) {
      filteredData = filteredData.filter(student => 
        student.feeSummary.feeStatus === feeStatus
      );
    }

    res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student transactions for admin dashboard
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllStudentTransactions = async (req, res, next) => {
  try {
    const { 
      departmentId, 
      sectionId, 
      semester, 
      status, 
      paymentMethod, 
      startDate, 
      endDate,
      onlyPendingPayments = false,
      page = 1,
      limit = 50
    } = req.query;

    // Build where clause for transactions
    const transactionWhere = {
      type: 'income' // Only income transactions (student fees)
    };

    if (status) {
      transactionWhere.status = status;
    }
    if (paymentMethod) {
      transactionWhere.paymentMethod = paymentMethod;
    }
    if (startDate || endDate) {
      transactionWhere.paidDate = {};
      if (startDate) {
        transactionWhere.paidDate[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        transactionWhere.paidDate[Op.lte] = new Date(endDate);
      }
    }

    // Build where clause for students
    const studentWhere = {};
    if (departmentId) {
      studentWhere.departmentId = departmentId;
    }
    if (sectionId) {
      studentWhere.sectionId = sectionId;
    }
    if (semester) {
      studentWhere.currentSemester = semester;
    }

    // Get transactions with student details
    const transactions = await Transaction.find({
      ...transactionWhere,
      // Note: studentWhere conditions would need to be handled with a separate Student query or aggregation
    })
    .populate({
      path: 'studentId',
      match: studentWhere,
      populate: [
        {
          path: 'userId',
          select: 'name email'
        },
        {
          path: 'departmentId',
          select: 'name code'
        },
        {
          path: 'sectionId',
          select: 'name code'
        }
      ]
    })
    .sort({ paidDate: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await Transaction.countDocuments({
      ...transactionWhere,
      // Note: For complex joins with studentWhere, might need aggregation
    });

    // Transform transaction data
    const transactionData = transactions.map(transaction => ({
      id: transaction.id,
      referenceNumber: transaction.referenceNumber,
      amount: Math.round(parseFloat(transaction.amount) / 100 * 100) / 100, // Convert from paisa to rupees with proper rounding
      category: transaction.category,
      description: transaction.description,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      paymentDate: transaction.paidDate,
      createdAt: transaction.createdAt,
      academicYear: transaction.academicYear,
      semester: transaction.semester,
      bankReferenceNumber: transaction.bankReferenceNumber,
      notes: transaction.notes,
      student: {
        id: transaction.student.id,
        name: transaction.student.user.name,
        email: transaction.student.user.email,
        enrollmentNumber: transaction.student.enrollmentNumber,
        rollNumber: transaction.student.rollNumber,
        department: transaction.student.department?.name,
        departmentCode: transaction.student.department?.code,
        section: transaction.student.section?.name,
        sectionCode: transaction.student.section?.code,
        currentSemester: transaction.student.currentSemester
      }
    }));

    // Calculate summary statistics
    const paidTransactions = transactionData.filter(t => t.status === 'paid');
    const pendingTransactions = transactionData.filter(t => ['pending', 'overdue'].includes(t.status));
    
    const summary = {
      totalTransactions: transactionData.length,
      paidCount: paidTransactions.length,
      pendingCount: pendingTransactions.length,
      totalAmount: transactionData.reduce((sum, t) => sum + t.amount, 0),
      paidAmount: paidTransactions.reduce((sum, t) => sum + t.amount, 0),
      pendingAmount: pendingTransactions.reduce((sum, t) => sum + t.amount, 0),
      razorpayCount: transactionData.filter(t => t.paymentMethod === 'online').length,
      offlineCount: transactionData.filter(t => t.paymentMethod !== 'online').length
    };

    res.status(200).json({
      success: true,
      count: transactionData.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      summary,
      data: transactionData
    });
  } catch (error) {
    console.error('Error fetching student transactions:', error);
    next(error);
  }
};

// @desc    Get dashboard financial summary
// @route   GET /api/admin/dashboard/financial
// @access  Private/Admin
exports.getFinancialSummary = async (req, res, next) => {
  try {
    // Get transaction summary for the current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyTransactions = await Transaction.find({
      type: 'income',
      paidDate: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).select('amount status paymentMethod paidDate');

    // Get all-time summary
    const allTimeStats = await Transaction.aggregate([
      { $match: { type: 'income' } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'overdue']] }, 1, 0] }
          },
          totalPaidAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
          },
          totalPendingAmount: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'overdue']] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find({
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

    // Process monthly data
    const monthlyData = {
      totalTransactions: monthlyTransactions.length,
      paidCount: monthlyTransactions.filter(t => t.status === 'paid').length,
      pendingCount: monthlyTransactions.filter(t => ['pending', 'overdue'].includes(t.status)).length,
      totalAmount: monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount) / 100, 0),
      paidAmount: monthlyTransactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + parseFloat(t.amount) / 100, 0),
      pendingAmount: monthlyTransactions.filter(t => ['pending', 'overdue'].includes(t.status)).reduce((sum, t) => sum + parseFloat(t.amount) / 100, 0),
      razorpayCount: monthlyTransactions.filter(t => t.paymentMethod === 'online').length
    };

    // Process all-time data
    const allTimeData = allTimeStats[0] ? {
      totalTransactions: parseInt(allTimeStats[0].totalCount) || 0,
      paidCount: parseInt(allTimeStats[0].paidCount) || 0,
      pendingCount: parseInt(allTimeStats[0].pendingCount) || 0,
      totalPaidAmount: parseFloat(allTimeStats[0].totalPaidAmount || 0) / 100,
      totalPendingAmount: parseFloat(allTimeStats[0].totalPendingAmount || 0) / 100
    } : {
      totalTransactions: 0,
      paidCount: 0,
      pendingCount: 0,
      totalPaidAmount: 0,
      totalPendingAmount: 0
    };

    // Process recent transactions
    const recentPayments = recentTransactions.map(t => ({
      id: t.id,
      amount: parseFloat(t.amount) / 100,
      paymentDate: t.paidDate,
      paymentMethod: t.paymentMethod,
      referenceNumber: t.referenceNumber,
      studentName: t.student?.user?.name || 'Unknown',
      category: t.category
    }));

    res.status(200).json({
      success: true,
      data: {
        monthly: monthlyData,
        allTime: allTimeData,
        recentPayments
      }
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    next(error);
  }
};
