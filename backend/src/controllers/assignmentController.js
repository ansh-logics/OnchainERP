const asyncHandler = require('express-async-handler');
const { Assignment, AssignmentSubmission, Student, Faculty, Course, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, courseId, facultyId, assignmentType, status } = req.query;

  const whereClause = { isActive: true };
  if (courseId) whereClause.courseId = courseId;
  if (facultyId) whereClause.facultyId = facultyId;
  if (assignmentType) whereClause.assignmentType = assignmentType;
  if (status) whereClause.status = status;

  const assignments = await Assignment.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code']
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
      }
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['dueDate', 'ASC']]
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
    data: assignments.rows
  });
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByPk(req.params.id, {
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code', 'credits']
      },
      {
        model: Faculty,
        as: 'faculty',
        attributes: ['id', 'employeeId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }]
      },
      {
        model: AssignmentSubmission,
        as: 'submissions',
        include: [{
          model: Student,
          as: 'student',
          attributes: ['id', 'rollNumber', 'enrollmentNumber'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['name']
          }]
        }]
      }
    ]
  });

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Calculate submission statistics
  const totalSubmissions = assignment.submissions.length;
  const gradedSubmissions = assignment.submissions.filter(s => s.status === 'graded').length;
  const pendingSubmissions = assignment.submissions.filter(s => s.status === 'submitted').length;

  res.status(200).json({
    success: true,
    data: {
      ...assignment.toJSON(),
      submissionStats: {
        total: totalSubmissions,
        graded: gradedSubmissions,
        pending: pendingSubmissions,
        gradingProgress: totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0
      }
    }
  });
});

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Faculty)
const createAssignment = asyncHandler(async (req, res) => {
  const facultyId = req.user.facultyProfile?.id;

  if (!facultyId) {
    return res.status(403).json({
      success: false,
      message: 'Only faculty can create assignments'
    });
  }

  const assignmentData = {
    ...req.body,
    facultyId
  };

  const assignment = await Assignment.create(assignmentData);

  const fullAssignment = await Assignment.findByPk(assignment.id, {
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code']
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: fullAssignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Faculty - only own assignments)
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByPk(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if user is the assignment creator or admin
  const facultyId = req.user.facultyProfile?.id;
  if (assignment.facultyId !== facultyId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this assignment'
    });
  }

  await assignment.update(req.body);

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Faculty - only own assignments)
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByPk(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  const facultyId = req.user.facultyProfile?.id;
  if (assignment.facultyId !== facultyId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this assignment'
    });
  }

  await assignment.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

// @desc    Get assignment submissions
// @route   GET /api/assignments/:id/submissions
// @access  Private (Faculty)
const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  const whereClause = { assignmentId: id };
  if (status) whereClause.status = status;

  const submissions = await AssignmentSubmission.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Assignment,
        as: 'assignment',
        attributes: ['id', 'title', 'maxMarks']
      },
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'rollNumber', 'enrollmentNumber'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }]
      },
      {
        model: Faculty,
        as: 'grader',
        attributes: ['id', 'employeeId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name']
        }]
      }
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['submissionDate', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: submissions.count,
    data: submissions.rows
  });
});

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { submissionText } = req.body;
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

  // Check if submission period is valid
  const now = new Date();
  const submissionStart = new Date(assignment.submissionStartDate);
  const submissionEnd = new Date(assignment.submissionEndDate);

  if (now < submissionStart) {
    return res.status(400).json({
      success: false,
      message: 'Submission period has not started yet'
    });
  }

  if (now > submissionEnd && !assignment.allowLateSubmission) {
    return res.status(400).json({
      success: false,
      message: 'Submission period has ended'
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

  const isLateSubmission = now > submissionEnd;

  const submission = await AssignmentSubmission.create({
    assignmentId: id,
    studentId,
    submissionDate: now,
    submissionText,
    isLateSubmission,
    status: 'submitted'
  });

  res.status(201).json({
    success: true,
    message: 'Assignment submitted successfully',
    data: submission
  });
});

// @desc    Grade assignment submission
// @route   POST /api/assignments/:assignmentId/submissions/:submissionId/grade
// @access  Private (Faculty)
const gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { marksObtained, feedback } = req.body;
  const facultyId = req.user.facultyProfile?.id;

  if (!facultyId) {
    return res.status(403).json({
      success: false,
      message: 'Only faculty can grade submissions'
    });
  }

  const submission = await AssignmentSubmission.findByPk(submissionId, {
    include: [{
      model: Assignment,
      as: 'assignment'
    }]
  });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  // Validate marks
  if (marksObtained > submission.assignment.maxMarks) {
    return res.status(400).json({
      success: false,
      message: `Marks cannot exceed maximum marks (${submission.assignment.maxMarks})`
    });
  }

  await submission.update({
    marksObtained,
    feedback,
    gradedBy: facultyId,
    gradedAt: new Date(),
    status: 'graded'
  });

  res.status(200).json({
    success: true,
    message: 'Submission graded successfully',
    data: submission
  });
});

// @desc    Get student assignments
// @route   GET /api/assignments/student/:studentId
// @access  Private
const getStudentAssignments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  // Get student's enrolled courses
  const student = await Student.findByPk(studentId, {
    include: [{
      model: Course,
      as: 'courses',
      through: { attributes: [] }
    }]
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  const courseIds = student.courses.map(course => course.id);

  const whereClause = {
    courseId: { [Op.in]: courseIds },
    isActive: true
  };

  if (status) whereClause.status = status;

  const assignments = await Assignment.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code']
      },
      {
        model: AssignmentSubmission,
        as: 'submissions',
        where: { studentId },
        required: false
      }
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['dueDate', 'ASC']]
  });

  // Add submission status for each assignment
  const assignmentsWithStatus = assignments.rows.map(assignment => {
    const submission = assignment.submissions[0];
    return {
      ...assignment.toJSON(),
      submissionStatus: submission ? submission.status : 'not_submitted',
      submission: submission || null,
      isOverdue: new Date() > new Date(assignment.dueDate) && !submission
    };
  });

  res.status(200).json({
    success: true,
    count: assignments.count,
    data: assignmentsWithStatus
  });
});

// @desc    Get faculty assignments
// @route   GET /api/assignments/faculty/:facultyId
// @access  Private (Faculty)
const getFacultyAssignments = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  const whereClause = { facultyId, isActive: true };
  if (status) whereClause.status = status;

  const assignments = await Assignment.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code']
      }
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['dueDate', 'ASC']]
  });

  // Get submission stats for each assignment
  const assignmentsWithStats = await Promise.all(
    assignments.rows.map(async (assignment) => {
      const submissionStats = await AssignmentSubmission.count({
        where: { assignmentId: assignment.id },
        group: ['status']
      });

      const stats = {
        total: 0,
        submitted: 0,
        graded: 0,
        returned: 0
      };

      submissionStats.forEach(stat => {
        stats.total += stat.count;
        stats[stat.status] = stat.count;
      });

      return {
        ...assignment.toJSON(),
        submissionStats: stats
      };
    })
  );

  res.status(200).json({
    success: true,
    count: assignments.count,
    data: assignmentsWithStats
  });
});

// @desc    Get overdue assignments
// @route   GET /api/assignments/overdue
// @access  Private (Admin)
const getOverdueAssignments = asyncHandler(async (req, res) => {
  const { collegeId, departmentId } = req.query;

  const currentDate = new Date().toISOString().split('T')[0];
  
  const assignments = await Assignment.findAll({
    where: {
      dueDate: { [Op.lt]: currentDate },
      status: 'active',
      isActive: true
    },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code', 'departmentId', 'collegeId'],
        where: {
          ...(collegeId && { collegeId }),
          ...(departmentId && { departmentId })
        }
      },
      {
        model: Faculty,
        as: 'faculty',
        attributes: ['id', 'employeeId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }]
      }
    ],
    order: [['dueDate', 'ASC']]
  });

  // Get submission statistics for overdue assignments
  const overdueWithStats = await Promise.all(
    assignments.map(async (assignment) => {
      const totalSubmissions = await AssignmentSubmission.count({
        where: { assignmentId: assignment.id }
      });

      const expectedSubmissions = await Student.count({
        include: [{
          model: Course,
          as: 'courses',
          where: { id: assignment.courseId },
          through: { attributes: [] }
        }]
      });

      return {
        ...assignment.toJSON(),
        submissionStats: {
          submitted: totalSubmissions,
          expected: expectedSubmissions,
          pending: expectedSubmissions - totalSubmissions,
          submissionRate: expectedSubmissions > 0 ? Math.round((totalSubmissions / expectedSubmissions) * 100) : 0
        }
      };
    })
  );

  res.status(200).json({
    success: true,
    count: overdueWithStats.length,
    data: overdueWithStats
  });
});

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  submitAssignment,
  gradeSubmission,
  getStudentAssignments,
  getFacultyAssignments,
  getOverdueAssignments
};
