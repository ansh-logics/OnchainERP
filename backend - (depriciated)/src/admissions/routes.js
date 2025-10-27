const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  addStudentToDepartment,
  getStudentAttendance,
  getStudentGrades,
  submitAssignment,
  submitAssignmentWithFile,
  uploadProfilePicture,
  getStudentDashboard,
  registerCourse
} = require('./controllers/studentController');

const router = express.Router();

const { protect, authorize, checkPermission } = require('../shared/middleware/auth');
const { uploadProfilePicture: profileUpload, uploadAssignment } = require('../shared/middleware/upload');

// Protect all routes
router.use(protect);

// All users can access these routes with proper permissions
router.get('/', authorize('admin', 'faculty'), getStudents);
router.post('/', authorize('admin'), createStudent);
router.get('/:id', checkPermission('student', 'read'), getStudent);
router.post('/:id/department', authorize('admin'), addStudentToDepartment);
router.get('/:id/attendance', checkPermission('attendance', 'read'), getStudentAttendance);
router.get('/:id/grades', checkPermission('grade', 'read'), getStudentGrades);

// Only the student themselves can submit assignments
router.post('/:id/assignments/:assignmentId', 
  authorize('student'),
  checkPermission('assignment', 'create'), 
  submitAssignment
);

// Assignment submission with file upload
router.post('/:id/assignments/:assignmentId/upload',
  authorize('student'),
  checkPermission('assignment', 'create'),
  uploadAssignment,
  submitAssignmentWithFile
);

// Profile picture upload for students
router.post('/:id/profile-picture',
  authorize('student', 'admin'),
  profileUpload,
  uploadProfilePicture
);

// Student dashboard
router.get('/:id/dashboard',
  authorize('student', 'admin'),
  checkPermission('student', 'read'),
  getStudentDashboard
);

// Only admin can register students for courses
router.post('/:id/courses/:courseId', 
  authorize('admin'), 
  registerCourse
);

module.exports = router;
