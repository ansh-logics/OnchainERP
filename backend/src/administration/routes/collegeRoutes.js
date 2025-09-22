const express = require('express');
const {
  registerCollege,
  getCollege,
  updateCollege,
  getColleges,
  addDepartment,
  getCollegeDepartments,
  getCollegeStats
} = require('../controllers/collegeController');

const { protect, authorize } = require('../../shared/middleware/auth');

const router = express.Router();

// Public route for college registration
router.post('/register', registerCollege);

// Protected routes
router.use(protect); // All routes below this middleware are protected

router
  .route('/')
  .get(authorize('super_admin'), getColleges);

router
  .route('/:id')
  .get(getCollege)
  .put(authorize('admin', 'super_admin'), updateCollege);

router
  .route('/:id/departments')
  .post(authorize('admin', 'super_admin'), addDepartment)
  .get(getCollegeDepartments);

router
  .route('/:id/stats')
  .get(authorize('admin', 'super_admin'), getCollegeStats);

module.exports = router;
