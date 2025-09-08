const express = require('express');
const {
  getDashboardStats,
  getAttendanceReport,
  getGradeReport,
  createDepartment
} = require('../controllers/adminController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// Reports
router.get('/reports/attendance', getAttendanceReport);
router.get('/reports/grades', getGradeReport);

// Department management
router.post('/departments', createDepartment);

module.exports = router;
