const { Transaction, Student, User } = require('../../shared/db/models');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../../shared/utils/errorResponse');
const LoggingService = require('../../shared/services/LoggingService');

// @desc    Get all transactions
// @route   GET /api/finance/transactions
// @access  Private (Admin, Cashier, Faculty)
const getTransactions = asyncHandler(async (req, res) => {
  const {
    type,
    status,
    category,
    studentId,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    search
  } = req.query;

  // Build where clause for Sequelize
  const whereClause = { collegeId: req.user.collegeId };

  if (type) whereClause.type = type;
  if (status) whereClause.status = status;
  if (category) whereClause.category = category;
  if (studentId) whereClause.studentId = studentId;

  // Date range filter
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
    if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
  }

  // Search functionality
  if (search) {
    whereClause[Op.or] = [
      { description: { [Op.iLike]: `%${search}%` } },
      { referenceNumber: { [Op.iLike]: `%${search}%` } },
      { notes: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Count total
  const total = await Transaction.countDocuments(whereClause);

  // Get transactions with pagination
  const transactions = await Transaction.find(whereClause)
    .populate({
      path: 'studentId',
      select: 'id enrollmentNumber',
      populate: {
        path: 'userId',
        select: 'name email phone'
      }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  // Transform data for frontend
  const transformedTransactions = transactions.map(t => ({
    id: t.id,
    amount: t.amount,
    type: t.type,
    category: t.category,
    status: t.status,
    description: t.description,
    dueDate: t.dueDate,
    paidDate: t.paidDate,
    paymentMethod: t.paymentMethod,
    referenceNumber: t.referenceNumber,
    notes: t.notes,
    student: t.student ? {
      id: t.student.id,
      name: t.student.user?.name || 'N/A',
      enrollmentNumber: t.student.enrollmentNumber,
      email: t.student.user?.email
    } : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));

  res.status(200).json({
    success: true,
    count: transformedTransactions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: transformedTransactions
  });
});

// @desc    Get single transaction
// @route   GET /api/finance/transactions/:id
// @access  Private (Admin, Cashier)
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    where: {
      id: req.params.id,
      collegeId: req.user.collegeId
    },
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'enrollmentNumber'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }]
      }
    ]
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Create new transaction
// @route   POST /api/finance/transactions
// @access  Private (Admin, Cashier)
const createTransaction = asyncHandler(async (req, res) => {
  // Add college to request body
  req.body.collegeId = req.user.collegeId;

  // Validate student exists for fee transactions
  if (req.body.studentId) {
    const student = await Student.findOne({
      where: {
        id: req.body.studentId,
        collegeId: req.user.collegeId
      }
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found in this college'
      });
    }
  }

  const transaction = await Transaction.create(req.body);

  // Fetch with associations
  const fullTransaction = await Transaction.findByPk(transaction.id, {
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'enrollmentNumber'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }]
      }
    ]
  });

  // Log the action
  await LoggingService.logUserAction(
    'create_transaction',
    req.user.id,
    {
      transactionId: transaction.id,
      amount: transaction.amount,
      type: transaction.type
    },
    {
      userRole: req.user.role,
      collegeId: req.user.collegeId,
      ip: req.ip
    }
  );

  res.status(201).json({
    success: true,
    data: fullTransaction
  });
});

// @desc    Update transaction
// @route   PUT /api/finance/transactions/:id
// @access  Private (Admin, Cashier)
const updateTransaction = asyncHandler(async (req, res) => {
  let transaction = await Transaction.findOne({
    where: {
      id: req.params.id,
      collegeId: req.user.collegeId
    }
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Update transaction
  await transaction.update(req.body);

  // Fetch updated with associations
  const updatedTransaction = await Transaction.findByPk(transaction.id, {
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'enrollmentNumber'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }]
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: updatedTransaction
  });
});

// @desc    Delete transaction
// @route   DELETE /api/finance/transactions/:id
// @access  Private (Admin only)
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    where: {
      id: req.params.id,
      collegeId: req.user.collegeId
    }
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Soft delete by updating isActive
  if (transaction.isActive !== undefined) {
    await transaction.update({ isActive: false });
  } else {
    await transaction.destroy();
  }

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

// @desc    Approve transaction
// @route   PATCH /api/finance/transactions/:id/approve
// @access  Private (Admin only)
const approveTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    where: {
      id: req.params.id,
      collegeId: req.user.collegeId
    }
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  if (transaction.status === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Transaction already approved'
    });
  }

  // Update transaction status
  await transaction.update({
    status: 'paid',
    paidDate: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Transaction approved successfully',
    data: transaction
  });
});

// @desc    Get financial summary
// @route   GET /api/finance/summary
// @access  Private (Admin, Cashier, Faculty)
const getFinancialSummary = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  // Get all transactions for the college
  const allTransactions = await Transaction.find({
    collegeId,
    type: 'income' // Only count income transactions for fees
  });

  // Calculate summary
  const totalCollected = allTransactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalPending = allTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalOverdue = allTransactions
    .filter(t => t.status === 'overdue')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const collectionRate = (totalCollected + totalPending) > 0
    ? Math.round((totalCollected / (totalCollected + totalPending)) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalCollected,
      totalPending,
      totalOverdue,
      collectionRate
    }
  });
});

// @desc    Get student fees
// @route   GET /api/finance/students/:studentId/fees
// @access  Private
const getStudentFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Verify student exists and belongs to user's college
  const student = await Student.findOne({
    where: {
      id: studentId,
      collegeId: req.user.collegeId
    }
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Get all transactions for this student
  const transactions = await Transaction.find({
    studentId,
    type: 'income'
  }).sort({ createdAt: -1 });

  // Calculate summary
  const totalFees = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const paidAmount = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const pendingAmount = transactions
    .filter(t => t.status === 'pending' || t.status === 'overdue')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      student: {
        id: student.id,
        enrollmentNumber: student.enrollmentNumber
      },
      summary: {
        totalFees,
        paidAmount,
        pendingAmount
      },
      transactions
    }
  });
});

// @desc    Submit fee payment (by student)
// @route   POST /api/finance/students/submit-payment
// @access  Private (Student)
const submitFeePayment = asyncHandler(async (req, res) => {
  const { transactionId, paymentMethod, transactionRef, notes } = req.body;

  // Find the fee transaction
  const transaction = await Transaction.findOne({
    where: {
      id: transactionId,
      studentId: req.user.studentId,
      collegeId: req.user.collegeId,
      type: 'income',
      status: { [Op.in]: ['pending', 'overdue'] }
    }
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Fee transaction not found or already paid'
    });
  }

  // Update transaction with payment submission
  await transaction.update({
    paymentMethod,
    status: 'paid',
    paidDate: new Date(),
    referenceNumber: transactionRef || transaction.referenceNumber,
    notes: notes || transaction.notes
  });

  res.status(200).json({
    success: true,
    message: 'Payment submitted successfully. Awaiting approval.',
    data: transaction
  });
});

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  getFinancialSummary,
  getStudentFees,
  submitFeePayment
};
