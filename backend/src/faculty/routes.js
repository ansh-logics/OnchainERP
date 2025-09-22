const express = require('express');
const router = express.Router();

// Import individual route files
const facultyRoutes = require('./routes/facultyRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

// Use the routes
router.use('/faculty', facultyRoutes);
router.use('/assignments', assignmentRoutes);

module.exports = router;
