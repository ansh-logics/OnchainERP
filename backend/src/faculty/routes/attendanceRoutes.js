const express = require('express');
const {
  getFacultyClasses,
  getClassStudents,
  markBulkAttendance,
  getCourseAttendance,
  getAttendanceSummary,
  updateAttendance,
  deleteAttendance,
  // Simple demo endpoints
  getDepartmentSections,
  getSectionStudents,
  markSimpleAttendance,
  getDepartmentAttendance
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

module.exports = router;

