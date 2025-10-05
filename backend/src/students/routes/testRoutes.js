const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../shared/middleware/auth');

// Test authentication endpoint
router.get('/auth-test', protect, authorize('student'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    data: {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      hasStudentProfile: !!req.user.studentProfile,
      studentId: req.user.studentProfile?.id || null
    }
  });
});

module.exports = router;
