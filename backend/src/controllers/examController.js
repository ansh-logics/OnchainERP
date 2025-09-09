const asyncHandler = require('express-async-handler');
const { Exam, ExamHall, ExamResult, Course, Faculty, Student, College, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
const getExams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, collegeId, courseId, examType, status } = req.query;

  const whereClause = { isActive: true };
  if (collegeId) whereClause.collegeId = collegeId;
  if (courseId) whereClause.courseId = courseId;
  if (examType) whereClause.examType = examType;
  if (status) whereClause.status = status;

  const exams = await Exam.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code', 'credits']
      },
      {
        model: ExamHall,
        as: 'examHall',
        attributes: ['id', 'hallName', 'hallCode', 'capacity']
      },
      {
        model: Faculty,
        as: 'invigilator',
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
    order: [['examDate', 'ASC'], ['startTime', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: exams.count,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: exams.count,
      pages: Math.ceil(exams.count / parseInt(limit))
    },
    data: exams.rows
  });
});

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id, {
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code', 'credits', 'departmentId']
      },
      {
        model: ExamHall,
        as: 'examHall',
        attributes: ['id', 'hallName', 'hallCode', 'capacity', 'location']
      },
      {
        model: Faculty,
        as: 'invigilator',
        attributes: ['id', 'employeeId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }]
      },
      {
        model: ExamResult,
        as: 'results',
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

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  // Calculate result statistics
  const results = exam.results;
  const totalStudents = results.length;
  const publishedResults = results.filter(r => r.status === 'published').length;
  const passedStudents = results.filter(r => r.marksObtained >= exam.passingMarks).length;

  res.status(200).json({
    success: true,
    data: {
      ...exam.toJSON(),
      resultStats: {
        total: totalStudents,
        published: publishedResults,
        passed: passedStudents,
        failed: publishedResults - passedStudents,
        passPercentage: publishedResults > 0 ? Math.round((passedStudents / publishedResults) * 100) : 0
      }
    }
  });
});

// @desc    Create exam
// @route   POST /api/exams
// @access  Private (Admin)
const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create(req.body);

  const fullExam = await Exam.findByPk(exam.id, {
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code']
      },
      {
        model: ExamHall,
        as: 'examHall',
        attributes: ['id', 'hallName', 'hallCode']
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: fullExam
  });
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin)
const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  await exam.update(req.body);

  res.status(200).json({
    success: true,
    data: exam
  });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin)
const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  await exam.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: 'Exam deleted successfully'
  });
});

// @desc    Get exam halls
// @route   GET /api/exam-halls
// @access  Private
const getExamHalls = asyncHandler(async (req, res) => {
  const { collegeId, capacity } = req.query;

  const whereClause = { isActive: true };
  if (collegeId) whereClause.collegeId = collegeId;
  if (capacity) whereClause.capacity = { [Op.gte]: parseInt(capacity) };

  const examHalls = await ExamHall.findAll({
    where: whereClause,
    order: [['hallName', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: examHalls.length,
    data: examHalls
  });
});

// @desc    Create exam hall
// @route   POST /api/exam-halls
// @access  Private (Admin)
const createExamHall = asyncHandler(async (req, res) => {
  const examHall = await ExamHall.create(req.body);

  res.status(201).json({
    success: true,
    data: examHall
  });
});

// @desc    Update exam hall
// @route   PUT /api/exam-halls/:id
// @access  Private (Admin)
const updateExamHall = asyncHandler(async (req, res) => {
  const examHall = await ExamHall.findByPk(req.params.id);

  if (!examHall) {
    return res.status(404).json({
      success: false,
      message: 'Exam hall not found'
    });
  }

  await examHall.update(req.body);

  res.status(200).json({
    success: true,
    data: examHall
  });
});

// @desc    Get exam schedule
// @route   GET /api/exams/:id/schedule
// @access  Private
const getExamSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  const whereClause = { collegeId: id, isActive: true };
  
  if (startDate && endDate) {
    whereClause.examDate = {
      [Op.between]: [startDate, endDate]
    };
  }

  const exams = await Exam.findAll({
    where: whereClause,
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code', 'semester']
      },
      {
        model: ExamHall,
        as: 'examHall',
        attributes: ['id', 'hallName', 'location']
      },
      {
        model: Faculty,
        as: 'invigilator',
        attributes: ['id'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name']
        }]
      }
    ],
    order: [['examDate', 'ASC'], ['startTime', 'ASC']]
  });

  // Group exams by date
  const schedule = {};
  exams.forEach(exam => {
    const date = exam.examDate;
    if (!schedule[date]) {
      schedule[date] = [];
    }
    schedule[date].push(exam);
  });

  res.status(200).json({
    success: true,
    data: {
      period: { startDate, endDate },
      schedule,
      totalExams: exams.length
    }
  });
});

// @desc    Add exam results
// @route   POST /api/exams/:id/results
// @access  Private (Faculty/Admin)
const addExamResults = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { results } = req.body; // Array of { studentId, marksObtained, remarks }
  const facultyId = req.user.facultyProfile?.id;

  const exam = await Exam.findByPk(id);
  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  const examResults = [];

  for (const result of results) {
    // Calculate grade and grade points based on marks
    let grade = 'F';
    let gradePoints = 0;

    const percentage = (result.marksObtained / exam.maxMarks) * 100;
    
    if (percentage >= 90) { grade = 'A+'; gradePoints = 10; }
    else if (percentage >= 80) { grade = 'A'; gradePoints = 9; }
    else if (percentage >= 70) { grade = 'B+'; gradePoints = 8; }
    else if (percentage >= 60) { grade = 'B'; gradePoints = 7; }
    else if (percentage >= 50) { grade = 'C'; gradePoints = 6; }
    else if (percentage >= 40) { grade = 'D'; gradePoints = 5; }

    const examResult = await ExamResult.create({
      examId: id,
      studentId: result.studentId,
      marksObtained: result.marksObtained,
      grade,
      gradePoints,
      remarks: result.remarks,
      evaluatedBy: facultyId,
      evaluatedAt: new Date()
    });

    examResults.push(examResult);
  }

  res.status(201).json({
    success: true,
    message: `Results added for ${examResults.length} students`,
    data: examResults
  });
});

// @desc    Get exam results
// @route   GET /api/exams/:id/results
// @access  Private
const getExamResults = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId, status } = req.query;

  const whereClause = { examId: id };
  if (studentId) whereClause.studentId = studentId;
  if (status) whereClause.status = status;

  const results = await ExamResult.findAll({
    where: whereClause,
    include: [
      {
        model: Exam,
        as: 'exam',
        attributes: ['id', 'examName', 'examType', 'maxMarks', 'passingMarks']
      },
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'rollNumber', 'enrollmentNumber'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name']
        }]
      }
    ],
    order: [[{ model: Student, as: 'student' }, 'rollNumber', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: results.length,
    data: results
  });
});

// @desc    Get student exams
// @route   GET /api/exams/student/:studentId
// @access  Private
const getStudentExams = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { examType, status } = req.query;

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

  if (examType) whereClause.examType = examType;
  if (status) whereClause.status = status;

  const exams = await Exam.findAll({
    where: whereClause,
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code']
      },
      {
        model: ExamHall,
        as: 'examHall',
        attributes: ['id', 'hallName', 'location']
      },
      {
        model: ExamResult,
        as: 'results',
        where: { studentId },
        required: false
      }
    ],
    order: [['examDate', 'ASC'], ['startTime', 'ASC']]
  });

  // Add result status for each exam
  const examsWithResults = exams.map(exam => {
    const result = exam.results[0];
    return {
      ...exam.toJSON(),
      result: result || null,
      hasResult: !!result
    };
  });

  res.status(200).json({
    success: true,
    count: examsWithResults.length,
    data: examsWithResults
  });
});

module.exports = {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamHalls,
  createExamHall,
  updateExamHall,
  getExamSchedule,
  addExamResults,
  getExamResults,
  getStudentExams
};
