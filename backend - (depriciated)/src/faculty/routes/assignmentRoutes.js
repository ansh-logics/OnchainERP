const express = require('express');
const {
  getFacultySections,
  getAllFacultyAssignments,
  createAssignment
} = require('../controllers/assignmentController');

const { protect, authorize } = require('../../shared/middleware/auth');
const { validate } = require('../../shared/middleware/validate');

const router = express.Router();

// All routes require authentication and faculty role
// router.use(protect);
// router.use(authorize('faculty'));

// Faculty section-based assignment routes
router.route('/sections').get(getFacultySections);
router.route('/').post(createAssignment);
router.route('/').get(getAllFacultyAssignments);

module.exports = router;
