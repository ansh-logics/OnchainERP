const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../shared/middleware/auth');

// Import controller
const { createStudentPaymentOrder } = require('../controllers/studentController');

// POST /api/student/pay/order - Create payment order
router.post('/pay/order', protect, authorize('student'), createStudentPaymentOrder);

module.exports = router;
