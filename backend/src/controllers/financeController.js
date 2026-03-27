const { Op } = require('sequelize');
const { Transaction, Student, User, College } = require('../models');
const asyncHandler = require('express-async-handler');

async function resolveUserCollegeId(userInstance) {
  const plain = userInstance.get ? userInstance.get({ plain: true }) : userInstance;
  if (plain.studentProfile?.collegeId) return plain.studentProfile.collegeId;
  if (plain.facultyProfile?.collegeId) return plain.facultyProfile.collegeId;
  const c = await College.findOne({
    where: { adminId: plain.id },
    attributes: ['id']
  });
  return c?.id || null;
}

function serializeTransaction(t) {
  if (!t) return null;
  const row = t.get ? t.get({ plain: true }) : t;
  const stu = row.student;
  return {
    _id: row.id,
    id: row.id,
    type: row.type,
    category: row.category,
    amount: Number(row.amount),
    description: row.description,
    student: stu
      ? {
          _id: stu.id,
          name: stu.user?.name || '',
          enrollmentNumber: stu.enrollmentNumber,
          email: stu.user?.email || '',
          phone: stu.user?.phone || ''
        }
      : undefined,
    paymentMethod: row.paymentMethod,
    status: row.status,
    dueDate: row.dueDate,
    paidDate: row.paidDate,
    referenceNumber: row.referenceNumber,
    academicYear: row.academicYear,
    semester: row.semester,
    createdBy: row.processedBy
      ? {
          _id: row.processedBy.id,
          name: row.processedBy.name,
          email: row.processedBy.email
        }
      : { _id: '', name: '', email: '' },
    updatedBy: undefined,
    approvalStatus: 'approved',
    notes: undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

const transactionIncludes = [
  {
    model: Student,
    as: 'student',
    required: false,
    include: [
      { model: User, as: 'user', attributes: ['name', 'email', 'phone'] }
    ]
  },
  {
    model: User,
    as: 'processedBy',
    required: false,
    attributes: ['id', 'name', 'email']
  }
];

// @desc    Get all transactions
// @route   GET /api/finance/transactions
// @access  Private (Admin, Cashier)
const getTransactions = asyncHandler(async (req, res) => {
  const collegeId = await resolveUserCollegeId(req.user);

  if (!collegeId) {
    return res.status(200).json({
      success: true,
      count: 0,
      total: 0,
      page: 1,
      pages: 0,
      data: []
    });
  }

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

  const where = { collegeId };

  if (type) where.type = type;
  if (status) where.status = status;
  if (category) where.category = category;
  if (studentId) where.studentId = studentId;
  if (academicYear) where.academicYear = academicYear;
  if (semester !== undefined && semester !== '') {
    where.semester = parseInt(semester, 10);
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  if (search) {
    const term = `%${search}%`;
    where[Op.or] = [
      { description: { [Op.iLike]: term } },
      { referenceNumber: { [Op.iLike]: term } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    include: transactionIncludes,
    order: [['createdAt', 'DESC']],
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    distinct: true
  });

  res.status(200).json({
    success: true,
    count: rows.length,
    total: count,
    page: pageNum,
    pages: limitNum ? Math.ceil(count / limitNum) : 0,
    data: rows.map((r) => serializeTransaction(r))
  });
});

// @desc    Get single transaction
// @route   GET /api/finance/transactions/:id
// @access  Private (Admin, Cashier)
const getTransaction = asyncHandler(async (req, res) => {
  const collegeId = await resolveUserCollegeId(req.user);
  if (!collegeId) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  const transaction = await Transaction.findOne({
    where: { id: req.params.id, collegeId },
    include: transactionIncludes
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.status(200).json({
    success: true,
    data: serializeTransaction(transaction)
  });
});

// @desc    Create new transaction
// @route   POST /api/finance/transactions
// @access  Private (Admin, Cashier)
const createTransaction = asyncHandler(async (req, res) => {
  const collegeId = await resolveUserCollegeId(req.user);
  if (!collegeId) {
    return res.status(400).json({
      success: false,
      message: 'Unable to resolve college for this user'
    });
  }

  let studentId = null;
  if (req.body.student) {
    const student = await Student.findOne({
      where: { id: req.body.student, collegeId }
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found in this college'
      });
    }
    studentId = student.id;
  }

  const referenceNumber =
    req.body.referenceNumber ||
    `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const txn = await Transaction.create({
    collegeId,
    type: req.body.type,
    category: req.body.category,
    amount: req.body.amount,
    description: req.body.description,
    studentId,
    paymentMethod: req.body.paymentMethod || 'cash',
    status: req.body.status || 'pending',
    dueDate: req.body.dueDate || null,
    paidDate: req.body.paidDate || null,
    academicYear: req.body.academicYear || null,
    semester: req.body.semester != null ? req.body.semester : null,
    referenceNumber,
    processedById: req.user.id
  });

  const full = await Transaction.findByPk(txn.id, {
    include: transactionIncludes
  });

  res.status(201).json({
    success: true,
    data: serializeTransaction(full)
  });
});

// @desc    Update transaction
// @route   PUT /api/finance/transactions/:id
// @access  Private (Admin, Cashier)
const updateTransaction = asyncHandler(async (req, res) => {
  const collegeId = await resolveUserCollegeId(req.user);
  if (!collegeId) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  const transaction = await Transaction.findOne({
    where: { id: req.params.id, collegeId }
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  const canUpdate =
    req.user.role === 'admin' ||
    (req.user.role === 'cashier' &&
      transaction.processedById &&
      transaction.processedById === req.user.id);

  if (!canUpdate) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this transaction'
    });
  }

  const patch = {};
  const allow = [
    'type',
    'category',
    'amount',
    'description',
    'paymentMethod',
    'status',
    'dueDate',
    'paidDate',
    'academicYear',
    'semester',
    'referenceNumber'
  ];
  for (const key of allow) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }

  if (req.body.student !== undefined) {
    if (!req.body.student) {
      patch.studentId = null;
    } else {
      const student = await Student.findOne({
        where: { id: req.body.student, collegeId }
      });
      if (!student) {
        return res.status(400).json({
          success: false,
          message: 'Student not found in this college'
        });
      }
      patch.studentId = student.id;
    }
  }

  await transaction.update(patch);

  const full = await Transaction.findByPk(transaction.id, {
    include: transactionIncludes
  });

  res.status(200).json({
    success: true,
    data: serializeTransaction(full)
  });
});

// @desc    Delete transaction
// @route   DELETE /api/finance/transactions/:id
// @access  Private (Admin only)
const deleteTransaction = asyncHandler(async (req, res) => {
  const collegeId = await resolveUserCollegeId(req.user);
  if (!collegeId) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  const transaction = await Transaction.findOne({
    where: { id: req.params.id, collegeId }
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can delete transactions'
    });
  }

  await transaction.destroy();

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

// @desc    Approve/Reject transaction
// @route   PATCH /api/finance/transactions/:id/approve
// @access  Private (Admin only)
const approveTransaction = asyncHandler(async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      'Transaction approval workflow is not available on the current PostgreSQL schema.'
  });
});

// @desc    Get financial summary
// @route   GET /api/finance/summary
// @access  Private (Admin, Cashier)
const getFinancialSummary = asyncHandler(async (req, res) => {
  const collegeId = await resolveUserCollegeId(req.user);

  if (!collegeId) {
    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          pendingAmount: 0
        },
        pendingFees: [],
        monthlyTrends: []
      }
    });
  }

  const { startDate, endDate, academicYear } = req.query;
  const where = { collegeId };
  if (academicYear) where.academicYear = academicYear;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const totalIncome = Number(
    (await Transaction.sum('amount', { where: { ...where, type: 'income' } })) || 0
  );
  const totalExpense = Number(
    (await Transaction.sum('amount', { where: { ...where, type: 'expense' } })) || 0
  );

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        pendingAmount: 0
      },
      pendingFees: [],
      monthlyTrends: []
    }
  });
});

// @desc    Get student fee status
// @route   GET /api/finance/students/:studentId/fees
// @access  Private (Admin, Cashier, Student themselves)
const getStudentFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const collegeId = await resolveUserCollegeId(req.user);

  const student = await Student.findOne({
    where: { id: studentId, ...(collegeId ? { collegeId } : {}) },
    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  const canAccess =
    req.user.role === 'admin' ||
    req.user.role === 'cashier' ||
    (req.user.role === 'student' && student.userId === req.user.id);

  if (!canAccess) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access these fee records'
    });
  }

  const fees = await Transaction.findAll({
    where: {
      studentId: student.id,
      type: 'income',
      ...(collegeId ? { collegeId } : {})
    },
    order: [['createdAt', 'DESC']]
  });

  const totalFees = fees.reduce((sum, f) => sum + Number(f.amount), 0);
  const paidFees = fees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + Number(f.amount), 0);
  const pendingFees = fees
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + Number(f.amount), 0);
  const overdueFees = fees
    .filter((f) => f.status === 'overdue')
    .reduce((sum, f) => sum + Number(f.amount), 0);

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
  return res.status(501).json({
    success: false,
    message: 'Student payment submission is not implemented for the PostgreSQL schema yet.'
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
