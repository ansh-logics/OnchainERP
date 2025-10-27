const express = require('express');
const router = express.Router();

// Import individual route files
const libraryRoutes = require('./routes/libraryRoutes');

// Use the routes
router.use('/library', libraryRoutes);

module.exports = router;
