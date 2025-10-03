const express = require('express');
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  addCourse,
  addLab,
  createSections,
  getDepartmentStats,
  assignRollNumbersToStudents,
  resetRollNumbers,
  bulkImportDepartments
} = require('../controllers/departmentController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { protect, authorize } = require('../../shared/middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getDepartments)
  .post(authorize('admin', 'super_admin'), createDepartment);

router
  .route('/:id')
  .get(getDepartment)
  .put(authorize('admin', 'super_admin'), updateDepartment)
  .delete(authorize('admin', 'super_admin'), deleteDepartment);

router
  .route('/:id/courses')
  .post(authorize('admin', 'super_admin'), addCourse);

router
  .route('/:id/labs')
  .post(authorize('admin', 'super_admin'), addLab);

router
  .route('/:id/sections')
  .post(authorize('admin', 'super_admin'), createSections);

router
  .route('/:id/stats')
  .get(getDepartmentStats);

router
  .route('/:id/assign-roll-numbers')
  .post(authorize('admin', 'super_admin'), assignRollNumbersToStudents);

router
  .route('/:id/reset-roll-numbers')
  .post(authorize('admin', 'super_admin'), resetRollNumbers);

router
  .route('/bulk-import')
  .post(authorize('admin', 'super_admin'), upload.single('file'), bulkImportDepartments);

module.exports = router;
