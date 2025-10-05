const express = require('express');
const router = express.Router();
const {
  getAvailableSubstitutes,
  selectSubstitute,
  getSubstitutionRequests,
  respondToSubstitutionRequest,
  getSubstitutionHistory
} = require('../controllers/substitutionController');

const { protect, authorize } = require('../../shared/middleware/auth');
const { facultyProfile } = require('../../shared/middleware/profile');

// Apply middleware to all routes
router.use(protect);
router.use(authorize('faculty'));
router.use(facultyProfile); // Ensure faculty profile is attached

// Faculty substitution routes
router.get('/available-substitutes/:courseId/:date', getAvailableSubstitutes);
router.post('/select-substitute', selectSubstitute);
router.get('/substitution-requests', getSubstitutionRequests);
router.patch('/substitution-requests/:id/respond', respondToSubstitutionRequest);
router.get('/substitution-history', getSubstitutionHistory);

module.exports = router;
