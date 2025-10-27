const express = require('express');
const sectionController = require('../controllers/sectionController');
const {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection
} = sectionController;

const { protect, authorize } = require('../../shared/middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Section CRUD routes
router.route('/')
  .get(getSections)  // GET /api/sections?departmentId=xxx
  .post(authorize('admin'), createSection);

router.route('/:id')
  .get(getSection)
  .put(authorize('admin'), updateSection)
  .delete(authorize('admin'), deleteSection);

module.exports = router;

