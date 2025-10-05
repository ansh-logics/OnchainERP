const express = require('express');
const router = express.Router();
const {
  getAllSubstitutions,
  getSubstitutionsByDate,
  approveSubstitution,
  rejectSubstitution,
  getSubstitutionStats,
  cancelSubstitution
} = require('../controllers/substitutionController');

const { protect, authorize } = require('../../shared/middleware/auth');

// Apply middleware to all routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Admin substitution management routes
router.get('/faculty-substitutions', getAllSubstitutions);
router.get('/faculty-substitutions/date/:date', getSubstitutionsByDate);
router.get('/faculty-substitutions/stats', getSubstitutionStats);
router.patch('/faculty-substitutions/:id/approve', approveSubstitution);
router.patch('/faculty-substitutions/:id/reject', rejectSubstitution);
router.patch('/faculty-substitutions/:id/cancel', cancelSubstitution);

module.exports = router;
