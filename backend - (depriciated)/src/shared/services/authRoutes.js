const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateDetails
} = require('./authController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public routes
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], validate, login);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected routes (all routes below this middleware are protected)
router.use(protect);

router.post('/register', authorize('admin', 'super_admin'), [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('role', 'Role is required').isIn(['student', 'faculty']),
  body('department', 'Department is required').notEmpty()
], validate, register);

router.get('/me', getMe);
router.post('/logout', logout);
router.put('/update-password', updatePassword);
router.put('/update-details', updateDetails);

// Admin only routes
router.get('/admin/users', authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
});

module.exports = router;
