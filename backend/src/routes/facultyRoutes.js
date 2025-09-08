const express = require('express');
const {
  getAllFaculty,
  getFaculty,
  getFacultyCourses,
  markAttendance,
  gradeAssignment,
  createAssignment,
  uploadProfilePicture,
  getFacultyDashboard,
  createFaculty
} = require('../controllers/facultyController');

const router = express.Router();

const { protect, authorize, checkPermission } = require('../middleware/auth');
const { uploadProfilePicture: profileUpload } = require('../middleware/upload');

// Protect all routes
router.use(protect);

// Routes for getting faculty information
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

module.exports = router;
