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
} = require('../controllers/hostelController');

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public routes
router.route('/').get(getHostels);
router.route('/:id').get(getHostel);
router.route('/:id/rooms').get(getHostelRooms);
router.route('/:id/occupancy').get(getHostelOccupancy);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

router.route('/').post(createHostel);
router.route('/:id').put(updateHostel).delete(deleteHostel);
router.route('/:id/rooms').post(createHostelRoom);
router.route('/allocations').post(allocateRoom);

// Warden/Admin routes
router.route('/:id/checkin/:studentId').post(checkInStudent);
router.route('/:id/checkout/:studentId').post(checkOutStudent);

module.exports = router;
