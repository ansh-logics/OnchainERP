const express = require('express');
const router = express.Router();

// Import individual route files
const attendanceRoutes = require('./routes/attendanceRoutes');

// Use the routes
router.use('/attendance', attendanceRoutes);

// Student-related routes will be imported from admissions module
// as students are managed there
module.exports = router;
