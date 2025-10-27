const express = require('express');
const {
  getFacultyClasses,
  getClassStudents,
  markBulkAttendance,
  getCourseAttendance,
  getAttendanceSummary,
  getSectionAttendanceSummary,
  updateAttendance,
  deleteAttendance,
  // Simple demo endpoints
  getDepartmentSections,
  getSectionStudents,
  markSimpleAttendance,
  getDepartmentAttendance,
  // Student endpoints
  getStudentAttendance,
  getStudentAttendancePercentage,
  // Admin endpoints
  getComprehensiveAttendanceReport,
  getPeriodWiseStats,
  // Department-level endpoints
  getDepartmentWiseStats,
  getDepartmentDetailedStats
} = require('../controllers/attendanceController');

const router = express.Router();

const { protect, authorize, checkPermission } = require('../../shared/middleware/auth');

// Protect all routes
router.use(protect);

// ========== SIMPLE DEMO ROUTES (NO PERMISSION CHECK) ==========
router.get(
  '/demo/sections/:departmentId',
  getDepartmentSections
);

router.get(
  '/demo/section-students/:sectionId',
  getSectionStudents
);

router.post(
  '/demo/mark',
  markSimpleAttendance
);

router.get(
  '/demo/department-attendance/:departmentId',
  getDepartmentAttendance
);
// ========================================

// Faculty attendance routes
router.get(
  '/classes',
  authorize('faculty', 'admin'),
  getFacultyClasses
);

router.get(
  '/students/:courseId/:sectionId',
  authorize('faculty', 'admin'),
  getClassStudents
);

router.post(
  '/mark',
  authorize('faculty', 'admin'),
  checkPermission('attendance', 'create'),
  markBulkAttendance
);

router.get(
  '/records/:courseId',
  authorize('faculty', 'admin'),
  getCourseAttendance
);

router.get(
  '/summary/:courseId',
  authorize('faculty', 'admin'),
  getAttendanceSummary
);

router.get(
  '/summary/section/:sectionId',
  authorize('faculty', 'admin'),
  getSectionAttendanceSummary
);

router.put(
  '/:attendanceId',
  authorize('faculty', 'admin'),
  checkPermission('attendance', 'update'),
  updateAttendance
);

router.delete(
  '/:attendanceId',
  authorize('faculty', 'admin'),
  checkPermission('attendance', 'delete'),
  deleteAttendance
);

// Student attendance routes
router.get(
  '/student/my-attendance',
  authorize('student'),
  getStudentAttendance
);

router.get(
  '/student/percentage',
  authorize('student'),
  getStudentAttendancePercentage
);

// Admin comprehensive reports
router.get(
  '/admin/comprehensive-report',
  authorize('admin'),
  getComprehensiveAttendanceReport
);

router.get(
  '/admin/period-stats',
  authorize('admin'),
  getPeriodWiseStats
);

// Department-level attendance reports
router.get(
  '/admin/department-stats',
  authorize('admin', 'faculty'),
  getDepartmentWiseStats
);

router.get(
  '/admin/department-detail/:departmentId',
  authorize('admin', 'faculty'),
  getDepartmentDetailedStats
);

module.exports = router;

