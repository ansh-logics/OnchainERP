const express = require('express');
const {
  getPasswordResetRequests,
  createPasswordResetRequest,
  reviewPasswordResetRequest,
  getMyPasswordResetRequests,
  getPasswordResetRequest,
  getPasswordResetStats
} = require('./passwordResetController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User routes (any authenticated user)
router.route('/request')
  .post(createPasswordResetRequest);

router.route('/my-requests')
  .get(getMyPasswordResetRequests);

// Admin routes
router.use(authorize('admin', 'super_admin'));

router.route('/')
  .get(getPasswordResetRequests);

router.route('/stats')
  .get(getPasswordResetStats);

router.route('/:id')
  .get(getPasswordResetRequest);

router.route('/:id/review')
  .put(reviewPasswordResetRequest);

module.exports = router;
