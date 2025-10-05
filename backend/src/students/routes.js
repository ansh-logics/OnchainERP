const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../shared/middleware/auth');

// Import controllers
const {
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
  getPaymentReceipt,
  getStudentReceipts
} = require('./controllers/studentController');

// Import individual route files
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const testRoutes = require('./routes/testRoutes');

// All routes require authentication as student
router.use(protect);
router.use(authorize('student'));

// Student profile routes
router.get('/profile', getStudentProfile);

// Dashboard summary
router.get('/dashboard', getStudentDashboard);

// Courses
router.get('/courses', getStudentCourses);

// Timetable
router.get('/timetable', getStudentTimetable);

// Results/Grades
router.get('/results', getStudentResults);

// Exams
router.get('/exams/upcoming', getUpcomingExams);

// Fees/Transactions
router.get('/fees', getStudentFees);
router.get('/fee-summary', getStudentFeeSummary);
router.post('/pay', processStudentPayment); // Legacy endpoint
router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyAndProcessPayment);

// Receipts
router.get('/receipts', getStudentReceipts);
router.get('/receipt/:transactionId', getPaymentReceipt);

// Notifications
router.get('/notifications', getStudentNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);

// Attendance routes (existing)
router.use('/attendance', attendanceRoutes);
router.use('/assignments', assignmentRoutes);

// Test routes for debugging
router.use('/test', testRoutes);

module.exports = router;
