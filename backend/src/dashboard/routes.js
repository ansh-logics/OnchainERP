const express = require('express');
const router = express.Router();
const { 
  getDashboardAnalytics,
  getSystemHealth
} = require('./controllers/dashboardController');

const { protect, authorize } = require('../shared/middleware/auth');

// Dashboard Analytics - Admin and Faculty (faculty gets limited view)
router.get('/analytics', protect, authorize('admin', 'super_admin', 'faculty'), getDashboardAnalytics);

// System Health - Admin only
router.get('/health', protect, authorize('admin', 'super_admin'), getSystemHealth);

module.exports = router;
