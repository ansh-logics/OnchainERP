const express = require('express');
const {
  getMyAssignments,
  submitAssignment,
  getMySubmission,
  getAssignmentStats
} = require('../controllers/assignmentController');

const { protect, authorize } = require('../../shared/middleware/auth');
const { studentProfile } = require('../../shared/middleware/profile');

const router = express.Router();

// All routes require authentication and student role
router.use(protect);
router.use(authorize('student'));
router.use(studentProfile);

// Student assignment routes
router.route('/my')
  .get(getMyAssignments);

router.route('/stats')
  .get(getAssignmentStats);

router.route('/:id/submit')
  .post(submitAssignment);

router.route('/:id/submission')
  .get(getMySubmission);

module.exports = router;
