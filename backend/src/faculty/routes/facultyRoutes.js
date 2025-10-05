const express = require('express');
const {
  getAllFaculty,
  getFaculty,
  getMyProfile,
  getFacultyCourses,
  markAttendance,
  gradeAssignment,
  createAssignment,
  uploadProfilePicture,
  getFacultyDashboard,
  createFaculty,
  getStudentFeesForFaculty,
  getFacultyStudentPayments,
  getFacultyFinancialOverview
} = require('../controllers/facultyController');

const router = express.Router();

const { protect, authorize, checkPermission } = require('../../shared/middleware/auth');
const { uploadProfilePicture: profileUpload } = require('../../shared/middleware/upload');
const { facultyProfile } = require('../../shared/middleware/profile');

// Protect all routes
router.use(protect);

// Routes for getting faculty information
router.get('/profile', authorize('faculty'), facultyProfile, getMyProfile);  // Current faculty profile
router.get('/courses', authorize('faculty'), facultyProfile, getFacultyCourses);  // Current faculty courses
router.get('/fees', authorize('faculty'), getStudentFeesForFaculty);  // Student fees for faculty courses
router.post('/', authorize('admin'), createFaculty);
router.get('/', authorize('admin'), getAllFaculty);
router.get('/:id', authorize('admin', 'faculty'), getFaculty);
router.get('/:id/courses', authorize('admin', 'faculty'), getFacultyCourses);

// Routes for faculty actions
router.post(
  '/:id/courses/:courseId/attendance', 
  authorize('faculty'), 
  checkPermission('attendance', 'create'),
  markAttendance
);

router.post(
  '/:id/students/:studentId/assignments/:assignmentId/grade',
  authorize('faculty'),
  checkPermission('grade', 'create'),
  gradeAssignment
);

router.post(
  '/:id/courses/:courseId/assignments',
  authorize('faculty'),
  checkPermission('assignment', 'create'),
  createAssignment
);

// Profile picture upload for faculty
router.post('/:id/profile-picture',
  authorize('faculty', 'admin'),
  profileUpload,
  uploadProfilePicture
);

// Faculty dashboard
router.get('/:id/dashboard',
  authorize('faculty', 'admin'),
  checkPermission('faculty', 'read'),
  getFacultyDashboard
);

// Faculty payment-related routes
router.get('/:id/students/payments',
  authorize('faculty', 'admin'),
  checkPermission('faculty', 'read'),
  getFacultyStudentPayments
);

router.get('/:id/dashboard/financial',
  authorize('faculty', 'admin'),
  checkPermission('faculty', 'read'),
  getFacultyFinancialOverview
);

module.exports = router;
