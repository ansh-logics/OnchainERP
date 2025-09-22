const express = require('express');
const router = express.Router();

// Import individual route files
const courseRoutes = require('./routes/courseRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

// Use the routes
router.use('/courses', courseRoutes);
router.use('/departments', departmentRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/timetables', timetableRoutes);

module.exports = router;
