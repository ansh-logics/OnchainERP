const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../shared/middleware/auth');

// Import controllers
const { 
  getAllStudentFees, 
  getAllStudentTransactions,
  getFinancialSummary
} = require('./controllers/adminController');

// Import individual route files
const collegeRoutes = require('./routes/collegeRoutes');
const substitutionRoutes = require('./routes/substitutionRoutes');

// Use the routes
router.use('/colleges', collegeRoutes);
router.use('/', substitutionRoutes);

// Admin fee management routes
router.get('/fees', protect, authorize('admin', 'super_admin'), getAllStudentFees);
router.get('/transactions', protect, authorize('admin', 'super_admin'), getAllStudentTransactions);
router.get('/dashboard/financial', protect, authorize('admin', 'super_admin'), getFinancialSummary);

module.exports = router;
