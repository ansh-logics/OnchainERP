const express = require('express');
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamHalls,
  createExamHall,
  updateExamHall,
  getExamSchedule,
  addExamResults,
  getExamResults,
  getStudentExams
} = require('../controllers/examController');

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Exam routes
router.route('/').get(getExams);
router.route('/:id').get(getExam);
router.route('/:id/schedule').get(getExamSchedule);
router.route('/:id/results').get(getExamResults);
router.route('/student/:studentId').get(getStudentExams);

// Admin only routes
router.route('/').post(authorize('admin'), createExam);
router.route('/:id').put(authorize('admin'), updateExam);
router.route('/:id').delete(authorize('admin'), deleteExam);

// Faculty/Admin routes
router.route('/:id/results').post(authorize('faculty', 'admin'), addExamResults);

// Exam halls routes
router.route('/halls').get(getExamHalls);
router.route('/halls').post(authorize('admin'), createExamHall);
router.route('/halls/:id').put(authorize('admin'), updateExamHall);

module.exports = router;
