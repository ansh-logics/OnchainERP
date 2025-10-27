const express = require('express');
const {
  getHostels,
  getHostel,
  createHostel,
  updateHostel,
  deleteHostel,
  getHostelRooms,
  createHostelRoom,
  getHostelOccupancy,
  allocateRoom,
  checkInStudent,
  checkOutStudent
} = require('./controllers/hostelController');

const { protect, authorize } = require('../shared/middleware/auth');
const { validate } = require('../shared/middleware/validate');

const router = express.Router();

// Public routes (authenticated users can view)
router.use(protect); // All routes require authentication
router.route('/').get(getHostels);
router.route('/:id').get(getHostel);
router.route('/:id/rooms').get(getHostelRooms);
router.route('/:id/occupancy').get(getHostelOccupancy);

// Protected routes - Admin and Faculty can allocate/manage
// Note: Faculty have limited write access for hostel management

// Admin-only routes
router.route('/').post(authorize('admin'), createHostel);
router.route('/:id').put(authorize('admin'), updateHostel).delete(authorize('admin'), deleteHostel);
router.route('/:id/rooms').post(authorize('admin'), createHostelRoom);

// Faculty and Admin can allocate rooms and check in/out students
router.route('/allocations').post(authorize('admin', 'faculty'), allocateRoom);
router.route('/:id/checkin/:studentId').post(authorize('admin', 'faculty'), checkInStudent);
router.route('/:id/checkout/:studentId').post(authorize('admin', 'faculty'), checkOutStudent);

module.exports = router;
