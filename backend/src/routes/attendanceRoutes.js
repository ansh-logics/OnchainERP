const express = require('express');
const {
  markAttendance,
  getCourseAttendanceByDate,
  getStudentAttendanceSummary,
  updateAttendance,
  getDailyAttendanceReport,
  getMonthlyAttendanceReport,
  getLowAttendanceAlerts,
  markBulkAttendance
} = require('../controllers/attendanceController');

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Faculty routes
router.route('/mark').post(authorize('faculty', 'admin'), markAttendance);
router.route('/bulk-mark').post(authorize('faculty', 'admin'), markBulkAttendance);
router.route('/:id').put(authorize('faculty', 'admin'), updateAttendance);

// Public authenticated routes
router.route('/course/:courseId/date/:date').get(getCourseAttendanceByDate);
router.route('/student/:studentId/summary').get(getStudentAttendanceSummary);

// Admin/Faculty reports
router.route('/reports/daily').get(authorize('faculty', 'admin'), getDailyAttendanceReport);
router.route('/reports/monthly').get(authorize('faculty', 'admin'), getMonthlyAttendanceReport);
router.route('/alerts/low-attendance').get(authorize('faculty', 'admin'), getLowAttendanceAlerts);

module.exports = router;
