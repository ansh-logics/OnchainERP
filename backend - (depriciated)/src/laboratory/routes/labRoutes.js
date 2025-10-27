const express = require('express');
const {
  createLab,
  getLabs,
  getLab,
  updateLab,
  deleteLab,
  addEquipment,
  updateEquipment,
  removeEquipment,
  addMaintenanceRecord,
  getLabAvailability
} = require('../controllers/labController');

const { protect, authorize } = require('../../shared/middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getLabs)
  .post(authorize('admin', 'super_admin'), createLab);

router
  .route('/:id')
  .get(getLab)
  .put(authorize('admin', 'faculty', 'super_admin'), updateLab)
  .delete(authorize('admin', 'super_admin'), deleteLab);

router
  .route('/:id/equipment')
  .post(authorize('admin', 'faculty', 'super_admin'), addEquipment);

router
  .route('/:id/equipment/:equipmentId')
  .put(authorize('admin', 'faculty', 'super_admin'), updateEquipment)
  .delete(authorize('admin', 'faculty', 'super_admin'), removeEquipment);

router
  .route('/:id/maintenance')
  .post(authorize('admin', 'faculty', 'super_admin'), addMaintenanceRecord);

router
  .route('/:id/availability')
  .get(getLabAvailability);

module.exports = router;
