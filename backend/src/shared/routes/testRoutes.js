const express = require('express');
const router = express.Router();
const mongoModels = require('../db/models/mongodb');

// Test endpoint to verify MongoDB connection and data
router.get('/test/mongo-stats', async (req, res) => {
  try {
    const stats = {};
    
    // Get counts from MongoDB
    stats.users = await mongoModels.User.countDocuments();
    stats.colleges = await mongoModels.College.countDocuments();
    stats.departments = await mongoModels.Department.countDocuments();
    stats.faculty = await mongoModels.Faculty.countDocuments();
    stats.students = await mongoModels.Student.countDocuments();
    stats.sections = await mongoModels.Section.countDocuments();
    stats.assignments = await mongoModels.Assignment.countDocuments();
    stats.attendance = await mongoModels.Attendance.countDocuments();
    
    // Get sample users
    const sampleUsers = await mongoModels.User.find()
      .select('firstName lastName email role')
      .limit(5);
    
    res.json({
      success: true,
      message: 'MongoDB is connected and working!',
      database: 'MongoDB',
      connectionStatus: 'Connected',
      stats,
      sampleUsers,
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MongoDB connection test failed',
      error: error.message
    });
  }
});

// Test endpoint to get sample assignments (no auth required)
router.get('/test/assignments', async (req, res) => {
  try {
    const assignments = await mongoModels.Assignment.find()
      .populate('sectionId', 'name code batch')
      .populate('facultyId', 'designation')
      .limit(10);
    
    res.json({
      success: true,
      message: 'Sample assignments from MongoDB',
      count: assignments.length,
      data: assignments,
      usingMongoDB: true
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// Test endpoint to get sample sections (no auth required)
router.get('/test/sections', async (req, res) => {
  try {
    const sections = await mongoModels.Section.find()
      .populate('departmentId', 'name code')
      .limit(10);
    
    res.json({
      success: true,
      message: 'Sample sections from MongoDB',
      count: sections.length,
      data: sections,
      usingMongoDB: true
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sections',
      error: error.message
    });
  }
});

module.exports = router;
