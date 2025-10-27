const express = require('express');
const router = express.Router();

// Import individual route files
const labRoutes = require('./routes/labRoutes');

// Use the routes
router.use('/labs', labRoutes);

module.exports = router;
