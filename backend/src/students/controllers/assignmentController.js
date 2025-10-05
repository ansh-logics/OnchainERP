const asyncHandler = require('express-async-handler');
const { Assignment, AssignmentSubmission, Student, Section, Faculty, User } = require('../../shared/db/models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LoggingService = require('../../shared/services/LoggingService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads/assignments');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|ppt|pptx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only allowed file types are permitted!'));
    }
  }
}).array('files', 5); // Allow up to 5 files

// @desc    Get student's assignments (section-based)
// @route   GET /api/student-services/assignments/my
// @access  Private (Student)
const getMyAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?.id;
  const { status, page = 1, limit = 20 } = req.query;

  if (!studentId) {
    return res.status(403).json({
      success: false,
      message: 'Only students can access assignments'
    });
  }

  // Get student's section
  const student = await Student.findByPk(studentId, {
    include: [{
      model: Section,
      as: 'section',
      attributes: ['id', 'name', 'code', 'batch', 'semester']
    }]
  });

  if (!student || !student.sectionId) {
    return res.status(404).json({
      success: false,
      message: 'Student profile or section not found'
    });
  }

  const whereClause = {
    sectionId: student.sectionId,
    isActive: true
  };

  if (status) whereClause.status = status;

  const assignments = await Assignment.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code', 'batch']
      },
      {
        model: Faculty,
        as: 'faculty',
        attributes: ['id', 'employeeId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name']
        }]
      },
      {
        model: AssignmentSubmission,
        as: 'submissions',
        where: { studentId },
        required: false,
        include: [{
          model: Faculty,
          as: 'grader',
          attributes: ['id'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['name']
          }]
        }]
      }
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['dueDate', 'ASC']]
  });

  // Add submission status for each assignment
  const assignmentsWithStatus = assignments.rows.map(assignment => {
    const submission = assignment.submissions[0];
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    return {
      ...assignment.toJSON(),
      submission: submission || null,
      isOverdue: now > dueDate && !submission,
      submissionFormat: assignment.submissionFormat ? assignment.submissionFormat.split(',') : ['pdf']
    };
  });

  await LoggingService.log({
    level: 'info',
    message: `Student ${studentId} accessed assignments`,
    userId: req.user.id,
    details: {
      sectionId: student.sectionId,
      assignmentsCount: assignments.count
    }
  });

  res.status(200).json({
    success: true,
    count: assignments.count,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: assignments.count,
      pages: Math.ceil(assignments.count / parseInt(limit))
    },
    data: assignmentsWithStatus
  });
});

// @desc    Submit assignment
// @route   POST /api/student-services/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.studentProfile?.id;

  if (!studentId) {
    return res.status(403).json({
      success: false,
      message: 'Only students can submit assignments'
    });
  }

  const assignment = await Assignment.findByPk(id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if student has already submitted
  const existingSubmission = await AssignmentSubmission.findOne({
    where: { assignmentId: id, studentId }
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'Assignment already submitted'
    });
  }

  // Handle file upload with promise wrapper
  const handleUpload = () => {
    return new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  try {
    await handleUpload();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }

  const { submissionText } = req.body;
  const files = req.files || [];

  // Check if submission period is valid
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  const isLateSubmission = now > dueDate;

  // Create file URLs for uploaded files
  const fileUrls = files.map(file => `/uploads/assignments/${file.filename}`);

  const submission = await AssignmentSubmission.create({
    assignmentId: id,
    studentId,
    submissionDate: now,
    submissionText: submissionText || null,
    fileUrls: fileUrls.length > 0 ? fileUrls : null,
    isLateSubmission,
    status: 'submitted'
  });

  res.status(201).json({
    success: true,
    message: isLateSubmission 
      ? 'Assignment submitted successfully (Late Submission)' 
      : 'Assignment submitted successfully',
    data: submission
  });
});

// @desc    Get assignment submission
// @route   GET /api/student-services/assignments/:id/submission
// @access  Private (Student)
const getMySubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.studentProfile?.id;

  if (!studentId) {
    return res.status(403).json({
      success: false,
      message: 'Only students can access submissions'
    });
  }

  const submission = await AssignmentSubmission.findOne({
    where: { assignmentId: id, studentId },
    include: [
      {
        model: Assignment,
        as: 'assignment',
        attributes: ['id', 'title', 'maxMarks', 'dueDate'],
        include: [{
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'code']
        }]
      },
      {
        model: Faculty,
        as: 'grader',
        attributes: ['id'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name']
        }]
      }
    ]
  });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Get assignment submission stats for student (section-based)
// @route   GET /api/student-services/assignments/stats
// @access  Private (Student)
const getAssignmentStats = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?.id;

  if (!studentId) {
    return res.status(403).json({
      success: false,
      message: 'Only students can access assignment stats'
    });
  }

  // Get student's section
  const student = await Student.findByPk(studentId);

  if (!student || !student.sectionId) {
    return res.status(404).json({
      success: false,
      message: 'Student profile or section not found'
    });
  }

  // Get all assignments for student's section
  const totalAssignments = await Assignment.count({
    where: {
      sectionId: student.sectionId,
      isActive: true
    }
  });

  // Get submission statistics
  const submissions = await AssignmentSubmission.findAll({
    where: { studentId },
    include: [{
      model: Assignment,
      as: 'assignment',
      where: {
        sectionId: student.sectionId,
        isActive: true
      }
    }]
  });

  const submittedCount = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.marksObtained !== null);
  const gradedCount = gradedSubmissions.length;
  const pendingGrading = submissions.filter(s => s.marksObtained === null).length;

  // Calculate average score
  const totalMarks = gradedSubmissions.reduce((sum, s) => sum + s.marksObtained, 0);
  const totalMaxMarks = gradedSubmissions.reduce((sum, s) => sum + s.assignment.maxMarks, 0);
  const averageScore = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;

  // Get pending assignments
  const now = new Date();
  const pendingAssignments = await Assignment.count({
    where: {
      sectionId: student.sectionId,
      isActive: true,
      dueDate: { [Op.gte]: now }
    },
    include: [{
      model: AssignmentSubmission,
      as: 'submissions',
      where: { studentId },
      required: false
    }],
    having: {
      '$submissions.id$': null
    }
  });

  // Get overdue assignments
  const overdueAssignments = await Assignment.count({
    where: {
      sectionId: student.sectionId,
      isActive: true,
      dueDate: { [Op.lt]: now }
    },
    include: [{
      model: AssignmentSubmission,
      as: 'submissions',
      where: { studentId },
      required: false
    }],
    having: {
      '$submissions.id$': null
    }
  });

  await LoggingService.log({
    level: 'info',
    message: `Student ${studentId} accessed assignment stats`,
    userId: req.user.id,
    details: {
      sectionId: student.sectionId,
      totalAssignments,
      submittedCount
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalAssignments,
      submittedCount,
      gradedCount,
      pendingGrading,
      pendingAssignments,
      overdueAssignments,
      averageScore,
      submissionRate: totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0
    }
  });
});

module.exports = {
  getMyAssignments,
  submitAssignment,
  getMySubmission,
  getAssignmentStats
};
