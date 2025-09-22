const asyncHandler = require('express-async-handler');
const { LibraryBook, LibraryIssue, Student, Faculty, User } = require('../../shared/db/models');
const { Op } = require('sequelize');

// @desc    Get all library books
// @route   GET /api/library/books
// @access  Public
const getLibraryBooks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, subject, author, collegeId, available } = req.query;

  const whereClause = { isActive: true };
  if (collegeId) whereClause.collegeId = collegeId;
  if (category) whereClause.category = category;
  if (subject) whereClause.subject = subject;
  if (author) whereClause.author = { [Op.iLike]: `%${author}%` };
  if (available === 'true') whereClause.availableCopies = { [Op.gt]: 0 };

  // Search functionality
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { author: { [Op.iLike]: `%${search}%` } },
      { isbn: { [Op.iLike]: `%${search}%` } },
      { accessionNumber: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const books = await LibraryBook.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['title', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: books.count,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: books.count,
      pages: Math.ceil(books.count / parseInt(limit))
    },
    data: books.rows
  });
});

// @desc    Get single library book
// @route   GET /api/library/books/:id
// @access  Public
const getLibraryBook = asyncHandler(async (req, res) => {
  const book = await LibraryBook.findByPk(req.params.id, {
    include: [{
      model: LibraryIssue,
      as: 'issues',
      where: { status: ['issued', 'renewed'] },
      required: false,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'rollNumber', 'enrollmentNumber'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }]
      }]
    }]
  });

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  res.status(200).json({
    success: true,
    data: book
  });
});

// @desc    Add new library book
// @route   POST /api/library/books
// @access  Private (Admin)
const addLibraryBook = asyncHandler(async (req, res) => {
  const book = await LibraryBook.create(req.body);

  res.status(201).json({
    success: true,
    data: book
  });
});

// @desc    Update library book
// @route   PUT /api/library/books/:id
// @access  Private (Admin)
const updateLibraryBook = asyncHandler(async (req, res) => {
  const book = await LibraryBook.findByPk(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  await book.update(req.body);

  res.status(200).json({
    success: true,
    data: book
  });
});

// @desc    Delete library book
// @route   DELETE /api/library/books/:id
// @access  Private (Admin)
const deleteLibraryBook = asyncHandler(async (req, res) => {
  const book = await LibraryBook.findByPk(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Check if book has active issues
  const activeIssues = await LibraryIssue.count({
    where: { bookId: req.params.id, status: ['issued', 'renewed'] }
  });

  if (activeIssues > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete book with active issues'
    });
  }

  await book.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: 'Book deleted successfully'
  });
});

// @desc    Issue book to student
// @route   POST /api/library/books/:id/issue/:studentId
// @access  Private (Librarian/Admin)
const issueBook = asyncHandler(async (req, res) => {
  const { id: bookId, studentId } = req.params;
  const { dueDate, issueRemarks } = req.body;

  // Check if book is available
  const book = await LibraryBook.findByPk(bookId);
  if (!book || book.availableCopies <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Book is not available for issue'
    });
  }

  // Check if student has already issued this book
  const existingIssue = await LibraryIssue.findOne({
    where: {
      bookId,
      studentId,
      status: ['issued', 'renewed']
    }
  });

  if (existingIssue) {
    return res.status(400).json({
      success: false,
      message: 'Student has already issued this book'
    });
  }

  // Check student's pending fines
  const pendingFines = await LibraryIssue.sum('fineAmount', {
    where: {
      studentId,
      finePaid: false,
      fineAmount: { [Op.gt]: 0 }
    }
  });

  if (pendingFines > 0) {
    return res.status(400).json({
      success: false,
      message: `Student has pending fines of ₹${pendingFines}. Please clear before issuing new books.`
    });
  }

  // Create issue record
  const issue = await LibraryIssue.create({
    bookId,
    studentId,
    issueDate: new Date(),
    dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
    issuedBy: req.user.id,
    issueRemarks,
    status: 'issued'
  });

  // Update available copies
  await book.decrement('availableCopies');

  res.status(201).json({
    success: true,
    message: 'Book issued successfully',
    data: issue
  });
});

// @desc    Return book from student
// @route   POST /api/library/books/:id/return/:studentId
// @access  Private (Librarian/Admin)
const returnBook = asyncHandler(async (req, res) => {
  const { id: bookId, studentId } = req.params;
  const { returnRemarks } = req.body;

  const issue = await LibraryIssue.findOne({
    where: {
      bookId,
      studentId,
      status: ['issued', 'renewed']
    },
    include: [{
      model: LibraryBook,
      as: 'book'
    }]
  });

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: 'Active book issue not found'
    });
  }

  const returnDate = new Date();
  const dueDate = new Date(issue.dueDate);
  const isLate = returnDate > dueDate;
  
  let fineAmount = 0;
  if (isLate) {
    const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
    fineAmount = daysLate * 5; // ₹5 per day fine
  }

  // Update issue record
  await issue.update({
    returnDate,
    returnedTo: req.user.id,
    returnRemarks,
    status: 'returned',
    fineAmount
  });

  // Update available copies
  await issue.book.increment('availableCopies');

  res.status(200).json({
    success: true,
    message: 'Book returned successfully',
    data: {
      issue,
      fineAmount,
      isLate
    }
  });
});

// @desc    Get all library issues
// @route   GET /api/library/issues
// @access  Private
const getLibraryIssues = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, studentId, overdue } = req.query;

  const whereClause = {};
  if (status) whereClause.status = status;
  if (studentId) whereClause.studentId = studentId;
  
  if (overdue === 'true') {
    whereClause.dueDate = { [Op.lt]: new Date() };
    whereClause.status = ['issued', 'renewed'];
  }

  const issues = await LibraryIssue.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: LibraryBook,
        as: 'book',
        attributes: ['id', 'title', 'author', 'accessionNumber']
      },
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'rollNumber', 'enrollmentNumber'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }]
      }
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['issueDate', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: issues.count,
    data: issues.rows
  });
});

// @desc    Get student library issues
// @route   GET /api/library/issues/student/:studentId
// @access  Private
const getStudentLibraryIssues = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { status } = req.query;

  const whereClause = { studentId };
  if (status) whereClause.status = status;

  const issues = await LibraryIssue.findAll({
    where: whereClause,
    include: [{
      model: LibraryBook,
      as: 'book',
      attributes: ['id', 'title', 'author', 'accessionNumber', 'isbn']
    }],
    order: [['issueDate', 'DESC']]
  });

  // Calculate summary
  const summary = {
    totalIssues: issues.length,
    currentIssues: issues.filter(i => ['issued', 'renewed'].includes(i.status)).length,
    overdueIssues: issues.filter(i => 
      ['issued', 'renewed'].includes(i.status) && new Date(i.dueDate) < new Date()
    ).length,
    totalFines: issues.reduce((sum, i) => sum + parseFloat(i.fineAmount || 0), 0),
    unpaidFines: issues.filter(i => !i.finePaid).reduce((sum, i) => sum + parseFloat(i.fineAmount || 0), 0)
  };

  res.status(200).json({
    success: true,
    data: {
      issues,
      summary
    }
  });
});

// @desc    Get overdue books
// @route   GET /api/library/issues/overdue
// @access  Private
const getOverdueBooks = asyncHandler(async (req, res) => {
  const { collegeId } = req.query;

  const whereClause = {
    dueDate: { [Op.lt]: new Date() },
    status: ['issued', 'renewed']
  };

  const includeClause = [
    {
      model: LibraryBook,
      as: 'book',
      attributes: ['id', 'title', 'author', 'accessionNumber']
    },
    {
      model: Student,
      as: 'student',
      attributes: ['id', 'rollNumber', 'enrollmentNumber'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone']
      }]
    }
  ];

  if (collegeId) {
    includeClause[1].where = { collegeId };
  }

  const overdueIssues = await LibraryIssue.findAll({
    where: whereClause,
    include: includeClause,
    order: [['dueDate', 'ASC']]
  });

  // Calculate fine for each overdue issue
  const overdueWithFines = overdueIssues.map(issue => {
    const daysOverdue = Math.ceil((new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));
    const calculatedFine = daysOverdue * 5; // ₹5 per day
    
    return {
      ...issue.toJSON(),
      daysOverdue,
      calculatedFine
    };
  });

  res.status(200).json({
    success: true,
    count: overdueWithFines.length,
    data: overdueWithFines
  });
});

// @desc    Renew book issue
// @route   POST /api/library/issues/:id/renew
// @access  Private
const renewBookIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newDueDate } = req.body;

  const issue = await LibraryIssue.findByPk(id);

  if (!issue || !['issued', 'renewed'].includes(issue.status)) {
    return res.status(404).json({
      success: false,
      message: 'Active issue not found'
    });
  }

  // Check if already overdue
  if (new Date(issue.dueDate) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot renew overdue book. Please return and pay fine first.'
    });
  }

  const renewalDueDate = newDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await issue.update({
    dueDate: renewalDueDate,
    status: 'renewed'
  });

  res.status(200).json({
    success: true,
    message: 'Book renewed successfully',
    data: issue
  });
});

// @desc    Pay library fine
// @route   POST /api/library/fines/:id/pay
// @access  Private
const payLibraryFine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentAmount, paymentMethod } = req.body;

  const issue = await LibraryIssue.findByPk(id);

  if (!issue || issue.fineAmount <= 0) {
    return res.status(404).json({
      success: false,
      message: 'No fine found for this issue'
    });
  }

  if (paymentAmount < issue.fineAmount) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount is less than fine amount'
    });
  }

  await issue.update({
    finePaid: true
  });

  res.status(200).json({
    success: true,
    message: 'Fine paid successfully',
    data: {
      issueId: id,
      fineAmount: issue.fineAmount,
      paymentAmount,
      paymentMethod
    }
  });
});

module.exports = {
  getLibraryBooks,
  getLibraryBook,
  addLibraryBook,
  updateLibraryBook,
  deleteLibraryBook,
  issueBook,
  returnBook,
  getLibraryIssues,
  getStudentLibraryIssues,
  getOverdueBooks,
  renewBookIssue,
  payLibraryFine
};
