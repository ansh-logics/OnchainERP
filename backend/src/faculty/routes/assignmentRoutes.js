const express = require('express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  submitAssignment,
  gradeSubmission,
  getStudentAssignments,
  getFacultyAssignments,
  getOverdueAssignments
} = require('../controllers/assignmentController');

const { protect, authorize } = require('../../shared/middleware/auth');
const { validate } = require('../../shared/middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

// General assignment routes
router.route('/').get(getAssignments);
router.route('/overdue').get(authorize('admin'), getOverdueAssignments);
router.route('/:id').get(getAssignment);

// Faculty routes
router.route('/').post(authorize('faculty', 'admin'), createAssignment);
router.route('/:id').put(authorize('faculty', 'admin'), updateAssignment);
router.route('/:id').delete(authorize('faculty', 'admin'), deleteAssignment);
router.route('/:id/submissions').get(authorize('faculty', 'admin'), getAssignmentSubmissions);
router.route('/:assignmentId/submissions/:submissionId/grade').post(authorize('faculty', 'admin'), gradeSubmission);

// Student routes
router.route('/:id/submit').post(authorize('student'), submitAssignment);
router.route('/student/:studentId').get(getStudentAssignments);

// Faculty specific routes
router.route('/faculty/:facultyId').get(authorize('faculty', 'admin'), getFacultyAssignments);

module.exports = router;
