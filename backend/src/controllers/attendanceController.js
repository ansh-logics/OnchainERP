const asyncHandler = require('express-async-handler');
const { Attendance, Student, Course, Faculty, Section, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private (Faculty)
const markAttendance = asyncHandler(async (req, res) => {
  const { courseId, sectionId, attendanceDate, period, attendanceData, topic, classType } = req.body;
  const facultyId = req.user.facultyProfile?.id;

  if (!facultyId) {
    return res.status(403).json({
      success: false,
      message: 'Only faculty can mark attendance'
    });
  }

  // Get students in the section
  const students = await Student.findAll({
    where: { sectionId, isActive: true }
  });

  const attendanceRecords = [];

  // Create attendance records for each student
  for (const student of students) {
    const studentAttendance = attendanceData.find(att => att.studentId === student.id);
    
    const attendanceRecord = await Attendance.create({
      studentId: student.id,
      courseId,
      facultyId,
      attendanceDate,
      period,
      status: studentAttendance?.status || 'absent',
      classType: classType || 'theory',
      topic,
      markedBy: facultyId
    });

    attendanceRecords.push(attendanceRecord);
  }

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    data: attendanceRecords
  });
});

// @desc    Get attendance for course and date
// @route   GET /api/attendance/course/:courseId/date/:date
// @access  Private (Faculty/Admin)
const getCourseAttendanceByDate = asyncHandler(async (req, res) => {
  const { courseId, date } = req.params;
  const { period } = req.query;

  const whereClause = {
    courseId,
    attendanceDate: date
  };

  if (period) {
    whereClause.period = period;
  }

  const attendance = await Attendance.findAll({
    where: whereClause,
    include: [
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
    order: [['period', 'ASC'], [{ model: Student, as: 'student' }, 'rollNumber', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

// @desc    Get student attendance summary
// @route   GET /api/attendance/student/:studentId/summary
// @access  Private
const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { courseId, startDate, endDate } = req.query;

  const whereClause = { studentId };
  if (courseId) whereClause.courseId = courseId;
  if (startDate && endDate) {
    whereClause.attendanceDate = {
      [Op.between]: [startDate, endDate]
    };
  }

  const attendance = await Attendance.findAll({
    where: whereClause,
    include: [{
      model: Course,
      as: 'course',
      attributes: ['id', 'name', 'code', 'credits']
    }],
    order: [['attendanceDate', 'DESC']]
  });

  // Calculate summary by course
  const courseSummary = {};
  attendance.forEach(att => {
    const courseKey = att.course.id;
    if (!courseSummary[courseKey]) {
      courseSummary[courseKey] = {
        course: att.course,
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
        lateClasses: 0,
        excusedClasses: 0,
        attendancePercentage: 0
      };
    }

    courseSummary[courseKey].totalClasses++;
    switch (att.status) {
      case 'present':
        courseSummary[courseKey].presentClasses++;
        break;
      case 'absent':
        courseSummary[courseKey].absentClasses++;
        break;
      case 'late':
        courseSummary[courseKey].lateClasses++;
        break;
      case 'excused':
        courseSummary[courseKey].excusedClasses++;
        break;
    }
  });

  // Calculate attendance percentage for each course
  Object.keys(courseSummary).forEach(courseId => {
    const summary = courseSummary[courseId];
    const attendedClasses = summary.presentClasses + summary.lateClasses + summary.excusedClasses;
    summary.attendancePercentage = summary.totalClasses > 0 
      ? Math.round((attendedClasses / summary.totalClasses) * 100) 
      : 0;
  });

  res.status(200).json({
    success: true,
    data: {
      studentId,
      period: { startDate, endDate },
      courseSummary: Object.values(courseSummary),
      totalRecords: attendance.length
    }
  });
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Faculty/Admin)
const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, modificationReason } = req.body;
  const facultyId = req.user.facultyProfile?.id;

  const attendance = await Attendance.findByPk(id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  await attendance.update({
    status,
    modifiedBy: facultyId,
    modifiedAt: new Date(),
    modificationReason
  });

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    data: attendance
  });
});

// @desc    Get daily attendance report
// @route   GET /api/attendance/reports/daily
// @access  Private (Admin)
const getDailyAttendanceReport = asyncHandler(async (req, res) => {
  const { date, collegeId, departmentId } = req.query;

  const whereClause = {
    attendanceDate: date || new Date().toISOString().split('T')[0]
  };

  const includeClause = [
    {
      model: Student,
      as: 'student',
      attributes: ['id', 'rollNumber', 'enrollmentNumber'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    },
    {
      model: Course,
      as: 'course',
      attributes: ['id', 'name', 'code']
    }
  ];

  // Add college/department filters through student
  if (collegeId || departmentId) {
    const studentWhere = {};
    if (collegeId) studentWhere.collegeId = collegeId;
    if (departmentId) studentWhere.departmentId = departmentId;
    
    includeClause[0].where = studentWhere;
  }

  const attendance = await Attendance.findAll({
    where: whereClause,
    include: includeClause,
    order: [['period', 'ASC'], [{ model: Course, as: 'course' }, 'name', 'ASC']]
  });

  // Calculate summary statistics
  const summary = {
    totalRecords: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length
  };

  summary.attendancePercentage = summary.totalRecords > 0 
    ? Math.round(((summary.present + summary.late + summary.excused) / summary.totalRecords) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      date: whereClause.attendanceDate,
      summary,
      records: attendance
    }
  });
});

// @desc    Get monthly attendance report
// @route   GET /api/attendance/reports/monthly
// @access  Private (Admin)
const getMonthlyAttendanceReport = asyncHandler(async (req, res) => {
  const { year, month, collegeId, departmentId, courseId } = req.query;

  const currentDate = new Date();
  const reportYear = year || currentDate.getFullYear();
  const reportMonth = month || (currentDate.getMonth() + 1);

  const startDate = new Date(reportYear, reportMonth - 1, 1);
  const endDate = new Date(reportYear, reportMonth, 0);

  const whereClause = {
    attendanceDate: {
      [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    }
  };

  if (courseId) whereClause.courseId = courseId;

  const includeClause = [
    {
      model: Student,
      as: 'student',
      attributes: ['id', 'rollNumber', 'departmentId'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    },
    {
      model: Course,
      as: 'course',
      attributes: ['id', 'name', 'code']
    }
  ];

  // Add filters
  if (collegeId || departmentId) {
    const studentWhere = {};
    if (collegeId) studentWhere.collegeId = collegeId;
    if (departmentId) studentWhere.departmentId = departmentId;
    
    includeClause[0].where = studentWhere;
  }

  const attendance = await Attendance.findAll({
    where: whereClause,
    include: includeClause,
    order: [['attendanceDate', 'ASC']]
  });

  // Group by student and course
  const studentSummary = {};
  attendance.forEach(att => {
    const studentKey = `${att.studentId}_${att.courseId}`;
    if (!studentSummary[studentKey]) {
      studentSummary[studentKey] = {
        student: att.student,
        course: att.course,
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendancePercentage: 0
      };
    }

    studentSummary[studentKey].totalClasses++;
    studentSummary[studentKey][att.status]++;
  });

  // Calculate percentages
  Object.values(studentSummary).forEach(summary => {
    const attended = summary.present + summary.late + summary.excused;
    summary.attendancePercentage = summary.totalClasses > 0 
      ? Math.round((attended / summary.totalClasses) * 100) 
      : 0;
  });

  res.status(200).json({
    success: true,
    data: {
      period: { year: reportYear, month: reportMonth },
      summary: Object.values(studentSummary),
      totalRecords: attendance.length
    }
  });
});

// @desc    Get low attendance alerts
// @route   GET /api/attendance/alerts/low-attendance
// @access  Private (Admin/Faculty)
const getLowAttendanceAlerts = asyncHandler(async (req, res) => {
  const { threshold = 75, courseId, departmentId } = req.query;

  // Get all students with their attendance records
  const whereClause = {};
  if (courseId) whereClause.courseId = courseId;

  const includeClause = [
    {
      model: Student,
      as: 'student',
      attributes: ['id', 'rollNumber', 'enrollmentNumber', 'departmentId'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone']
      }]
    },
    {
      model: Course,
      as: 'course',
      attributes: ['id', 'name', 'code']
    }
  ];

  if (departmentId) {
    includeClause[0].where = { departmentId };
  }

  const attendance = await Attendance.findAll({
    where: whereClause,
    include: includeClause
  });

  // Calculate attendance percentage for each student-course combination
  const studentCourseMap = {};
  attendance.forEach(att => {
    const key = `${att.studentId}_${att.courseId}`;
    if (!studentCourseMap[key]) {
      studentCourseMap[key] = {
        student: att.student,
        course: att.course,
        totalClasses: 0,
        attendedClasses: 0
      };
    }

    studentCourseMap[key].totalClasses++;
    if (['present', 'late', 'excused'].includes(att.status)) {
      studentCourseMap[key].attendedClasses++;
    }
  });

  // Filter students with low attendance
  const lowAttendanceStudents = Object.values(studentCourseMap)
    .map(item => ({
      ...item,
      attendancePercentage: item.totalClasses > 0 
        ? Math.round((item.attendedClasses / item.totalClasses) * 100) 
        : 0
    }))
    .filter(item => item.attendancePercentage < threshold)
    .sort((a, b) => a.attendancePercentage - b.attendancePercentage);

  res.status(200).json({
    success: true,
    data: {
      threshold: parseInt(threshold),
      alertCount: lowAttendanceStudents.length,
      students: lowAttendanceStudents
    }
  });
});

// @desc    Mark bulk attendance
// @route   POST /api/attendance/bulk-mark
// @access  Private (Faculty)
const markBulkAttendance = asyncHandler(async (req, res) => {
  const { courseId, sectionId, attendanceDate, period, defaultStatus, topic, classType, overrides } = req.body;
  const facultyId = req.user.facultyProfile?.id;

  if (!facultyId) {
    return res.status(403).json({
      success: false,
      message: 'Only faculty can mark attendance'
    });
  }

  // Get all students in the section
  const students = await Student.findAll({
    where: { sectionId, isActive: true }
  });

  const attendanceRecords = [];

  for (const student of students) {
    const override = overrides?.find(o => o.studentId === student.id);
    const status = override?.status || defaultStatus;

    const attendanceRecord = await Attendance.create({
      studentId: student.id,
      courseId,
      facultyId,
      attendanceDate,
      period,
      status,
      classType: classType || 'theory',
      topic,
      markedBy: facultyId
    });

    attendanceRecords.push(attendanceRecord);
  }

  res.status(201).json({
    success: true,
    message: `Bulk attendance marked for ${attendanceRecords.length} students`,
    data: {
      totalMarked: attendanceRecords.length,
      defaultStatus,
      overridesApplied: overrides?.length || 0
    }
  });
});

module.exports = {
  markAttendance,
  getCourseAttendanceByDate,
  getStudentAttendanceSummary,
  updateAttendance,
  getDailyAttendanceReport,
  getMonthlyAttendanceReport,
  getLowAttendanceAlerts,
  markBulkAttendance
};
