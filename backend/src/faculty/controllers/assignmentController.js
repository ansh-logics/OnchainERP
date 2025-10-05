const asyncHandler = require('express-async-handler');

// Import MongoDB models (but keep Sequelize imports for compatibility)
const { Assignment, AssignmentSubmission, Student, Section, Faculty, User, Timetable, Department, getModel } = require('../../shared/db/models');
const mongoModels = require('../../shared/db/models/mongodb');
const mongoAdapter = require('../../shared/db/mongoAdapter');
const { dbSync } = require('../../shared/db/dbSync');

const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LoggingService = require('../../shared/services/LoggingService');

// Configure multer for file uploads (unchanged)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads/assignments');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|ppt|pptx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only allowed file types are permitted!'));
    }
  }
}).array('files', 5);

// Helper function to determine which database to use
const useMongoForModel = (modelName) => {
  return process.env.USE_MONGODB !== 'false' && mongoModels[modelName];
};

// Helper functions are now imported from shared modules

// @desc    Get sections assigned to faculty
// @route   GET /api/faculty-services/assignments/sections
// @access  Private (Faculty)  
const getFacultySections = asyncHandler(async (req, res) => {
  console.log('🔍 getFacultySections called');
  console.log('🔍 User:', req.user);

  // Temporary: For testing, let's return all sections if no authenticated user
  if (!req.user || !req.user.id) {
    console.log('⚠️ No authenticated user, returning all sections for testing');
    try {
      const SectionModel = getModel('Section');
      const DepartmentModel = getModel('Department');
      
      let allSections;
      
      if (useMongoForModel('Section')) {
        // MongoDB query
        allSections = await SectionModel.find({ isActive: true })
          .select('id name code batch semester currentStrength')
          .populate({
            path: 'departmentId',
            model: 'Department',
            select: 'id name code'
          })
          .limit(10);
      } else {
        // Sequelize query (fallback)
        allSections = await SectionModel.findAll({
          where: { isActive: true },
          attributes: ['id', 'name', 'code', 'batch', 'semester', 'currentStrength'],
          include: [{
            model: DepartmentModel,
            as: 'department',
            attributes: ['id', 'name', 'code']
          }],
          limit: 10
        });
      }

      return res.status(200).json({
        success: true,
        count: allSections.length,
        data: allSections,
        message: 'Test data - authentication bypassed',
        usingMongoDB: useMongoForModel('Section')
      });
    } catch (error) {
      console.error('Error fetching test sections:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch test sections'
      });
    }
  }

  const facultyUserId = req.user.id;

  try {
    // Get faculty profile
    const FacultyModel = getModel('Faculty');
    let faculty;
    
    if (useMongoForModel('Faculty')) {
      faculty = await FacultyModel.findOne({ userId: facultyUserId });
    } else {
      faculty = await FacultyModel.findOne({ where: { userId: facultyUserId } });
    }

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    // Get unique sections assigned to this faculty from timetable
    const TimetableModel = getModel('Timetable');
    const SectionModel = getModel('Section');
    const DepartmentModel = getModel('Department');
    
    let timetableEntries;
    let uniqueSections = [];

    if (useMongoForModel('Timetable')) {
      // MongoDB query
      timetableEntries = await TimetableModel.find({
        facultyId: faculty.id,
        isActive: true
      }).populate({
        path: 'sectionId',
        model: 'Section',
        select: 'id name code batch semester currentStrength',
        populate: {
          path: 'departmentId',
          model: 'Department',
          select: 'id name code'
        }
      });

      // Extract unique sections
      const sectionMap = new Map();
      timetableEntries.forEach(entry => {
        if (entry.sectionId && !sectionMap.has(entry.sectionId.id)) {
          sectionMap.set(entry.sectionId.id, entry.sectionId);
        }
      });
      uniqueSections = Array.from(sectionMap.values());
    } else {
      // Sequelize query (fallback)
      timetableEntries = await TimetableModel.findAll({
        where: {
          facultyId: faculty.id,
          isActive: true
        },
        include: [{
          model: SectionModel,
          as: 'section',
          attributes: ['id', 'name', 'code', 'batch', 'semester', 'currentStrength'],
          include: [{
            model: DepartmentModel,
            as: 'department',
            attributes: ['id', 'name', 'code']
          }]
        }]
      });

      const sectionMap = new Map();
      timetableEntries.forEach(entry => {
        if (entry.section && !sectionMap.has(entry.section.id)) {
          sectionMap.set(entry.section.id, entry.section);
        }
      });
      uniqueSections = Array.from(sectionMap.values());
    }

    // If no sections found in timetable, try to get all sections from faculty's department
    if (uniqueSections.length === 0) {
      if (useMongoForModel('Section')) {
        const departmentSections = await SectionModel.find({
          departmentId: faculty.departmentId,
          isActive: true
        }).select('id name code batch semester currentStrength')
          .populate({
            path: 'departmentId',
            model: 'Department',
            select: 'id name code'
          });
        uniqueSections.push(...departmentSections);
      } else {
        const departmentSections = await SectionModel.findAll({
          where: {
            departmentId: faculty.departmentId,
            isActive: true
          },
          attributes: ['id', 'name', 'code', 'batch', 'semester', 'currentStrength'],
          include: [{
            model: DepartmentModel,
            as: 'department',
            attributes: ['id', 'name', 'code']
          }]
        });
        uniqueSections.push(...departmentSections);
      }
    }

    await LoggingService.log({
      level: 'info',
      message: `Faculty ${faculty.id} accessed sections list`,
      userId: req.user.id,
      details: {
        sectionsCount: uniqueSections.length,
        source: uniqueSections.length > 0 ? 'timetable' : 'department',
        usingMongoDB: useMongoForModel('Section')
      }
    });

    res.status(200).json({
      success: true,
      count: uniqueSections.length,
      data: uniqueSections,
      usingMongoDB: useMongoForModel('Section')
    });

  } catch (error) {
    console.error('Error fetching faculty sections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sections'
    });
  }
});

// @desc    Get all assignments created by the logged-in faculty
// @route   GET /api/faculty-services/assignments
// @access  Private (Faculty) - temporarily public for development
const getAllFacultyAssignments = asyncHandler(async (req, res) => {
  try {
    // Simple direct query to avoid recursion issues for now
    const AssignmentModel = getModel('Assignment');
    
    if (useMongoForModel('Assignment')) {
      console.log('🔍 Using MongoDB for assignments...');
      
      // Simple MongoDB query without complex where clause conversion
      const assignments = await AssignmentModel.find({})
        .populate({
          path: 'sectionId',
          model: 'Section',
          select: 'name code batch semester'
        })
        .sort({ createdAt: -1 })
        .limit(10);

      console.log(`📊 Found ${assignments.length} assignments`);

      res.status(200).json({
        success: true,
        message: 'Assignments fetched successfully',
        data: assignments,
        count: assignments.length,
        usingMongoDB: true
      });

    } else {
      console.log('🔍 Using PostgreSQL for assignments...');
      
      const assignments = await AssignmentModel.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Assignments fetched successfully',
        data: assignments,
        count: assignments.length,
        usingMongoDB: false
      });
    }

  } catch (error) {
    console.error('Error fetching faculty assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// @desc    Create new assignment
// @route   POST /api/faculty-services/assignments
// @access  Private (Faculty)
const createAssignment = asyncHandler(async (req, res) => {
  try {
    // Get faculty profile (same logic as above)
    let facultyUserId = req.user?.id;
    
    if (!facultyUserId) {
      // Development fallback
      const FacultyModel = getModel('Faculty');
      const firstFaculty = useMongoForModel('Faculty') 
        ? await FacultyModel.findOne({}).populate('userId', 'id')
        : await FacultyModel.findOne({ include: [{ model: getModel('User'), as: 'user', attributes: ['id'] }] });
      
      if (firstFaculty) {
        facultyUserId = useMongoForModel('Faculty') ? firstFaculty.userId.id : firstFaculty.user.id;
      }
    }

    const FacultyModel = getModel('Faculty');
    const faculty = useMongoForModel('Faculty')
      ? await FacultyModel.findOne({ userId: facultyUserId })
      : await FacultyModel.findOne({ where: { userId: facultyUserId } });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    // Validate section exists
    const SectionModel = getModel('Section');
    const section = useMongoForModel('Section')
      ? await SectionModel.findById(req.body.sectionId)
      : await SectionModel.findByPk(req.body.sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Prepare assignment data
    const assignmentData = {
      ...req.body,
      facultyId: faculty.id,
      assignedDate: req.body.assignedDate || new Date(),
      submissionStartDate: req.body.submissionStartDate || new Date(),
      submissionEndDate: req.body.submissionEndDate || req.body.dueDate
    };

    // Create assignment
    const AssignmentModel = getModel('Assignment');
    let newAssignment;

    if (useMongoForModel('Assignment')) {
      newAssignment = await AssignmentModel.create(assignmentData);
      // Sync to PostgreSQL if enabled
      await dbSync.syncToPostgres('Assignment', 'create', newAssignment);
    } else {
      newAssignment = await AssignmentModel.create(assignmentData);
      // Sync to MongoDB if enabled
      await dbSync.syncToMongo('Assignment', 'create', newAssignment);
    }

    // Log the activity
    await LoggingService.log({
      level: 'info',
      message: `Faculty ${faculty.id} created new assignment`,
      userId: facultyUserId,
      details: {
        assignmentId: newAssignment.id,
        title: newAssignment.title,
        sectionId: newAssignment.sectionId,
        usingMongoDB: useMongoForModel('Assignment')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: newAssignment,
      usingMongoDB: useMongoForModel('Assignment')
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
});

// Export all functions
module.exports = {
  getFacultySections,
  getAllFacultyAssignments,
  createAssignment,
  upload
};
