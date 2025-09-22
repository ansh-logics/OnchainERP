const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  getFinancialSummary,
  getStudentFees,
  submitFeePayment
} = require('./controllers/financeController');

const { protect, authorize } = require('../shared/middleware/auth');
const { validateTransaction } = require('../shared/middleware/validate');

const router = express.Router();

// Protect all routes
router.use(protect);

// Finance summary - Admin and Cashier access
router.get('/summary', authorize('admin', 'cashier'), getFinancialSummary);

// Transaction routes
router.route('/transactions')
  .get(authorize('admin', 'cashier'), getTransactions)
  .post(authorize('admin', 'cashier'), validateTransaction, createTransaction);

router.route('/transactions/:id')
  .get(authorize('admin', 'cashier'), getTransaction)
  .put(authorize('admin', 'cashier'), updateTransaction)
  .delete(authorize('admin'), deleteTransaction);

// Approval routes - Admin only
router.patch('/transactions/:id/approve', authorize('admin'), approveTransaction);

// Student fee routes
router.get('/students/:studentId/fees', getStudentFees);
router.post('/students/submit-payment', authorize('student'), submitFeePayment);

module.exports = router;
