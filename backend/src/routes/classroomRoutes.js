const express = require('express');
const {
  getClassrooms,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getAvailableClassrooms,
  bookClassroom,
  getClassroomBookings,
  cancelClassroomBooking,
  getClassroomUtilization
} = require('../controllers/classroomController');

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

// General classroom routes
router.route('/').get(getClassrooms);
router.route('/available').get(getAvailableClassrooms);
router.route('/utilization').get(authorize('admin'), getClassroomUtilization);
router.route('/:id').get(getClassroom);

// Admin only routes
router.route('/').post(authorize('admin'), createClassroom);
router.route('/:id').put(authorize('admin'), updateClassroom);
router.route('/:id').delete(authorize('admin'), deleteClassroom);

// Booking routes
router.route('/:id/book').post(authorize('admin', 'faculty'), bookClassroom);
router.route('/:id/bookings').get(getClassroomBookings);
router.route('/bookings/:id').delete(authorize('admin', 'faculty'), cancelClassroomBooking);

module.exports = router;
