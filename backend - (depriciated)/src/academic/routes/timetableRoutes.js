const express = require('express');
const {
  getTimetable,
  getTimetableEntry,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getSectionTimetable,
  getFacultyTimetable,
  getClassroomSchedule,
  getTimetableConflicts
} = require('../controllers/timetableController');

const { protect, authorize } = require('../../shared/middleware/auth');
const { validate } = require('../../shared/middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

// General timetable routes
router.route('/').get(getTimetable);
router.route('/conflicts').get(authorize('admin'), getTimetableConflicts);
router.route('/:id').get(getTimetableEntry);

// Admin only routes
router.route('/').post(authorize('admin'), createTimetableEntry);
router.route('/:id').put(authorize('admin'), updateTimetableEntry);
router.route('/:id').delete(authorize('admin'), deleteTimetableEntry);

// Specific schedule routes
router.route('/section/:sectionId').get(getSectionTimetable);
router.route('/faculty/:facultyId').get(getFacultyTimetable);
router.route('/classroom/:classroomId').get(getClassroomSchedule);

module.exports = router;
