const { Transaction, Student, User } = require('../models');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Get all transactions
// @route   GET /api/finance/transactions
// @access  Private (Admin, Cashier)
const getTransactions = asyncHandler(async (req, res) => {
  const {
    type,
    status,
    category,
    studentId,
    academicYear,
    semester,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    search
  } = req.query;

  // Build filter object
  const filter = { college: req.user.college };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (studentId) filter.student = studentId;
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Build query
  let query = Transaction.find(filter)
    .populate('student', 'name enrollmentNumber email phone')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

  // Search functionality
  if (search) {
    const searchQuery = {
      $or: [
        { description: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ]
    };
    query = Transaction.find({ ...filter, ...searchQuery })
      .populate('student', 'name enrollmentNumber email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Transaction.countDocuments({ ...filter, ...(search ? searchQuery : {}) });
  
  const transactions = await query.skip(skip).limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

// @desc    Get single transaction
// @route   GET /api/finance/transactions/:id
// @access  Private (Admin, Cashier)
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    college: req.user.college
  })
    .populate('student', 'name enrollmentNumber email phone')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('approvedBy', 'name email');

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
  // Add college and creator to request body
  req.body.college = req.user.college;
  req.body.createdBy = req.user._id;

  // Validate student exists for fee transactions
  if (req.body.student) {
    const student = await Student.findOne({
      _id: req.body.student,
      college: req.user.college
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found in this college'
      });
    }
  }

  const transaction = await Transaction.create(req.body);

  // Populate the created transaction
  await transaction.populate([
    { path: 'student', select: 'name enrollmentNumber email phone' },
    { path: 'createdBy', select: 'name email' }
  ]);

  res.status(201).json({
    success: true,
    data: transaction
  });
});

// @desc    Update transaction
// @route   PUT /api/finance/transactions/:id
// @access  Private (Admin, Cashier)
const updateTransaction = asyncHandler(async (req, res) => {
  let transaction = await Transaction.findOne({
    _id: req.params.id,
    college: req.user.college
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if user can update this transaction
  const canUpdate = req.user.role === 'admin' || 
                   (req.user.role === 'cashier' && transaction.createdBy.toString() === req.user._id.toString());

  if (!canUpdate) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this transaction'
    });
  }

  // Add updater info
  req.body.updatedBy = req.user._id;

  transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { path: 'student', select: 'name enrollmentNumber email phone' },
    { path: 'createdBy', select: 'name email' },
    { path: 'updatedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Delete transaction
// @route   DELETE /api/finance/transactions/:id
// @access  Private (Admin only)
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    college: req.user.college
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Only admin can delete transactions
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can delete transactions'
    });
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

// @desc    Approve/Reject transaction
// @route   PATCH /api/finance/transactions/:id/approve
// @access  Private (Admin only)
const approveTransaction = asyncHandler(async (req, res) => {
  const { approvalStatus, notes } = req.body;

  if (!['approved', 'rejected'].includes(approvalStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid approval status'
    });
  }

  const transaction = await Transaction.findOne({
    _id: req.params.id,
    college: req.user.college
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  transaction.approvalStatus = approvalStatus;
  transaction.approvedBy = req.user._id;
  transaction.approvedAt = new Date();
  if (notes) transaction.notes = notes;

  await transaction.save();

  await transaction.populate([
    { path: 'student', select: 'name enrollmentNumber email phone' },
    { path: 'createdBy', select: 'name email' },
    { path: 'approvedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Get financial summary
// @route   GET /api/finance/summary
// @access  Private (Admin, Cashier)
const getFinancialSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate, academicYear } = req.query;

  // Build filter
  const filter = { college: req.user.college };
  
  if (academicYear) filter.academicYear = academicYear;
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Get summary using static method
  const summary = await Transaction.getFinancialSummary(req.user.college, filter);

  // Get pending fees by category
  const pendingFees = await Transaction.aggregate([
    {
      $match: {
        college: req.user.college,
        type: 'income',
        status: { $in: ['pending', 'overdue'] },
        ...(academicYear && { academicYear })
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        overdue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  // Get monthly trends
  const monthlyTrends = await Transaction.aggregate([
    {
      $match: {
        college: req.user.college,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type'
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary,
      pendingFees,
      monthlyTrends
    }
  });
});

// @desc    Get student fee status
// @route   GET /api/finance/students/:studentId/fees
// @access  Private (Admin, Cashier, Student themselves)
const getStudentFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;

  // Check if user can access this student's fees
  const canAccess = req.user.role === 'admin' || 
                   req.user.role === 'cashier' || 
                   (req.user.role === 'student' && req.user.studentId === studentId);

  if (!canAccess) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access these fee records'
    });
  }

  // Find student
  const student = await Student.findOne({
    _id: studentId,
    college: req.user.college
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Get fee transactions
  const fees = await Transaction.getStudentFeeStatus(studentId, academicYear);

  // Calculate totals
  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const pendingFees = fees.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);
  const overdueFees = fees.filter(fee => fee.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      student,
      fees,
      summary: {
        totalFees,
        paidFees,
        pendingFees,
        overdueFees,
        paidPercentage: totalFees > 0 ? (paidFees / totalFees) * 100 : 0
      }
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
    _id: transactionId,
    student: req.user.studentId,
    college: req.user.college,
    type: 'income',
    status: { $in: ['pending', 'overdue'] }
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Fee transaction not found or already paid'
    });
  }

  // Update transaction with payment submission
  transaction.paymentMethod = paymentMethod;
  transaction.status = 'paid'; // Will be pending approval
  transaction.paidDate = new Date();
  transaction.approvalStatus = 'pending_approval';
  transaction.notes = notes || transaction.notes;
  
  if (transactionRef) {
    transaction.referenceNumber = transactionRef;
  }

  await transaction.save();

  await transaction.populate('student', 'name enrollmentNumber email phone');

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
