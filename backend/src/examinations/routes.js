const express = require('express');
const router = express.Router();

// Import individual route files
const examRoutes = require('./routes/examRoutes');

// Use the routes
router.use('/exams', examRoutes);

module.exports = router;
