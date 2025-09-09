const express = require('express');
const {
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
} = require('../controllers/libraryController');

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public routes
router.route('/books').get(getLibraryBooks);
router.route('/books/:id').get(getLibraryBook);

// Protected routes
router.use(protect);

// Issue management routes
router.route('/issues').get(getLibraryIssues);
router.route('/issues/overdue').get(getOverdueBooks);
router.route('/issues/student/:studentId').get(getStudentLibraryIssues);
router.route('/issues/:id/renew').post(renewBookIssue);

// Admin/Librarian routes
router.route('/books').post(authorize('admin', 'faculty'), addLibraryBook);
router.route('/books/:id').put(authorize('admin', 'faculty'), updateLibraryBook);
router.route('/books/:id').delete(authorize('admin'), deleteLibraryBook);

router.route('/books/:id/issue/:studentId').post(authorize('admin', 'faculty'), issueBook);
router.route('/books/:id/return/:studentId').post(authorize('admin', 'faculty'), returnBook);

// Fine management
router.route('/fines/:id/pay').post(payLibraryFine);

module.exports = router;
