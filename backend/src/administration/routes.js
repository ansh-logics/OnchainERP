const express = require('express');
const router = express.Router();

// Import individual route files
const collegeRoutes = require('./routes/collegeRoutes');

// Use the routes
router.use('/colleges', collegeRoutes);

// Admin routes will be handled separately in shared services
module.exports = router;
