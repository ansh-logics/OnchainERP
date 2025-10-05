const express = require('express');
const router = express.Router();

// Import individual route files
const facultyRoutes = require('./routes/facultyRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const substitutionRoutes = require('./routes/substitutionRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

// Import the getFacultyCourses controller
const { getFacultyCourses } = require('./controllers/facultyController');
const { protect, authorize } = require('../shared/middleware/auth');
const { facultyProfile } = require('../shared/middleware/profile');

// Use the routes
router.use('/faculty', facultyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/substitutions', substitutionRoutes);
router.use('/assignments', assignmentRoutes);

// Direct courses route for faculty services
router.get('/courses', protect, authorize('faculty'), facultyProfile, getFacultyCourses);

module.exports = router;
