const asyncHandler = require('express-async-handler');
const { Timetable, Faculty, Course, Section, College, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get timetable
// @route   GET /api/timetable
// @access  Private
const getTimetable = asyncHandler(async (req, res) => {
  const { collegeId, sectionId, facultyId, academicYear, semester, dayOfWeek } = req.query;

  const whereClause = { isActive: true };
  if (collegeId) whereClause.collegeId = collegeId;
  if (sectionId) whereClause.sectionId = sectionId;
  if (facultyId) whereClause.facultyId = facultyId;
  if (academicYear) whereClause.academicYear = academicYear;
  if (semester) whereClause.semester = semester;
  if (dayOfWeek) whereClause.dayOfWeek = dayOfWeek;

  const timetable = await Timetable.findAll({
    where: whereClause,
    include: [
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code', 'batch']
      },
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
          attributes: ['name']
        }]
      },
      {
        model: Classroom,
        as: 'classroom',
        attributes: ['id', 'roomNumber', 'building', 'capacity']
      }
    ],
    order: [['dayOfWeek', 'ASC'], ['period', 'ASC']]
  });

  // Group by day and section for better organization
  const organizedTimetable = {};
  timetable.forEach(entry => {
    const day = entry.dayOfWeek;
    const sectionKey = entry.section.id;
    
    if (!organizedTimetable[day]) {
      organizedTimetable[day] = {};
    }
    
    if (!organizedTimetable[day][sectionKey]) {
      organizedTimetable[day][sectionKey] = {
        section: entry.section,
        periods: []
      };
    }
    
    organizedTimetable[day][sectionKey].periods.push(entry);
  });

  res.status(200).json({
    success: true,
    count: timetable.length,
    data: {
      raw: timetable,
      organized: organizedTimetable
    }
  });
});

// @desc    Get single timetable entry
// @route   GET /api/timetable/:id
// @access  Private
const getTimetableEntry = asyncHandler(async (req, res) => {
  const timetableEntry = await Timetable.findByPk(req.params.id, {
    include: [
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code', 'batch']
      },
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
        model: Classroom,
        as: 'classroom',
        attributes: ['id', 'roomNumber', 'building', 'capacity', 'facilities']
      }
    ]
  });

  if (!timetableEntry) {
    return res.status(404).json({
      success: false,
      message: 'Timetable entry not found'
    });
  }

  res.status(200).json({
    success: true,
    data: timetableEntry
  });
});

// @desc    Create timetable entry
// @route   POST /api/timetable
// @access  Private (Admin)
const createTimetableEntry = asyncHandler(async (req, res) => {
  const {
    collegeId,
    sectionId,
    courseId,
    facultyId,
    classroomId,
    dayOfWeek,
    startTime,
    endTime,
    period,
    academicYear,
    semester,
    classType,
    effectiveFrom
  } = req.body;

  // Check for conflicts
  const conflicts = await checkTimetableConflicts({
    facultyId,
    classroomId,
    dayOfWeek,
    startTime,
    endTime,
    academicYear,
    semester,
    effectiveFrom,
    excludeId: null
  });

  if (conflicts.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Timetable conflicts detected',
      conflicts
    });
  }

  const timetableEntry = await Timetable.create(req.body);

  const fullEntry = await Timetable.findByPk(timetableEntry.id, {
    include: [
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code']
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
      },
      {
        model: Classroom,
        as: 'classroom',
        attributes: ['id', 'roomNumber', 'building']
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: fullEntry
  });
});

// @desc    Update timetable entry
// @route   PUT /api/timetable/:id
// @access  Private (Admin)
const updateTimetableEntry = asyncHandler(async (req, res) => {
  const timetableEntry = await Timetable.findByPk(req.params.id);

  if (!timetableEntry) {
    return res.status(404).json({
      success: false,
      message: 'Timetable entry not found'
    });
  }

  // If updating schedule-related fields, check for conflicts
  const scheduleFields = ['facultyId', 'classroomId', 'dayOfWeek', 'startTime', 'endTime', 'academicYear', 'semester', 'effectiveFrom'];
  const isScheduleUpdate = scheduleFields.some(field => req.body[field] !== undefined);

  if (isScheduleUpdate) {
    const updateData = { ...timetableEntry.toJSON(), ...req.body };
    const conflicts = await checkTimetableConflicts({
      ...updateData,
      excludeId: req.params.id
    });

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Timetable conflicts detected',
        conflicts
      });
    }
  }

  await timetableEntry.update(req.body);

  res.status(200).json({
    success: true,
    data: timetableEntry
  });
});

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private (Admin)
const deleteTimetableEntry = asyncHandler(async (req, res) => {
  const timetableEntry = await Timetable.findByPk(req.params.id);

  if (!timetableEntry) {
    return res.status(404).json({
      success: false,
      message: 'Timetable entry not found'
    });
  }

  await timetableEntry.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: 'Timetable entry deleted successfully'
  });
});

// @desc    Get section timetable
// @route   GET /api/timetable/section/:sectionId
// @access  Private
const getSectionTimetable = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const { academicYear, semester } = req.query;

  const whereClause = {
    sectionId,
    isActive: true
  };

  if (academicYear) whereClause.academicYear = academicYear;
  if (semester) whereClause.semester = semester;

  const timetable = await Timetable.findAll({
    where: whereClause,
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
          attributes: ['name']
        }]
      },
      {
        model: Classroom,
        as: 'classroom',
        attributes: ['id', 'roomNumber', 'building']
      }
    ],
    order: [['dayOfWeek', 'ASC'], ['period', 'ASC']]
  });

  // Organize by day and period
  const weeklySchedule = {};
  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let day = 1; day <= 7; day++) {
    weeklySchedule[dayNames[day]] = timetable
      .filter(entry => entry.dayOfWeek === day)
      .sort((a, b) => a.period - b.period);
  }

  res.status(200).json({
    success: true,
    data: {
      sectionId,
      academicYear: academicYear || 'current',
      semester: semester || 'current',
      weeklySchedule,
      totalClasses: timetable.length
    }
  });
});

// @desc    Get faculty timetable
// @route   GET /api/timetable/faculty/:facultyId
// @access  Private
const getFacultyTimetable = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const { academicYear, semester } = req.query;

  const whereClause = {
    facultyId,
    isActive: true
  };

  if (academicYear) whereClause.academicYear = academicYear;
  if (semester) whereClause.semester = semester;

  const timetable = await Timetable.findAll({
    where: whereClause,
    include: [
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code', 'batch']
      },
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code', 'credits']
      },
      {
        model: Classroom,
        as: 'classroom',
        attributes: ['id', 'roomNumber', 'building']
      }
    ],
    order: [['dayOfWeek', 'ASC'], ['period', 'ASC']]
  });

  // Calculate workload
  const workload = {
    totalClasses: timetable.length,
    coursesCount: new Set(timetable.map(t => t.courseId)).size,
    sectionsCount: new Set(timetable.map(t => t.sectionId)).size,
    theoryClasses: timetable.filter(t => t.classType === 'theory').length,
    practicalClasses: timetable.filter(t => t.classType === 'practical').length,
    tutorialClasses: timetable.filter(t => t.classType === 'tutorial').length
  };

  res.status(200).json({
    success: true,
    data: {
      facultyId,
      timetable,
      workload
    }
  });
});

// @desc    Get classroom schedule
// @route   GET /api/timetable/classroom/:classroomId
// @access  Private
const getClassroomSchedule = asyncHandler(async (req, res) => {
  const { classroomId } = req.params;
  const { academicYear, semester } = req.query;

  const whereClause = {
    classroomId,
    isActive: true
  };

  if (academicYear) whereClause.academicYear = academicYear;
  if (semester) whereClause.semester = semester;

  const schedule = await Timetable.findAll({
    where: whereClause,
    include: [
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code', 'batch']
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
    order: [['dayOfWeek', 'ASC'], ['period', 'ASC']]
  });

  // Calculate utilization
  const totalPeriods = 7 * 8; // 7 days * 8 periods (assuming max 8 periods per day)
  const utilisationPercentage = Math.round((schedule.length / totalPeriods) * 100);

  res.status(200).json({
    success: true,
    data: {
      classroomId,
      schedule,
      utilization: {
        totalClasses: schedule.length,
        utilisationPercentage,
        availableSlots: totalPeriods - schedule.length
      }
    }
  });
});

// @desc    Check timetable conflicts
// @route   GET /api/timetable/conflicts
// @access  Private (Admin)
const getTimetableConflicts = asyncHandler(async (req, res) => {
  const { collegeId, academicYear, semester } = req.query;

  const whereClause = { isActive: true };
  if (collegeId) whereClause.collegeId = collegeId;
  if (academicYear) whereClause.academicYear = academicYear;
  if (semester) whereClause.semester = semester;

  const timetableEntries = await Timetable.findAll({
    where: whereClause,
    include: [
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code']
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
      },
      {
        model: Classroom,
        as: 'classroom',
        attributes: ['id', 'roomNumber', 'building']
      }
    ]
  });

  const conflicts = [];

  // Check for faculty conflicts
  const facultySchedule = {};
  timetableEntries.forEach(entry => {
    const key = `${entry.facultyId}_${entry.dayOfWeek}_${entry.startTime}_${entry.endTime}`;
    
    if (!facultySchedule[key]) {
      facultySchedule[key] = [];
    }
    facultySchedule[key].push(entry);
    
    if (facultySchedule[key].length > 1) {
      conflicts.push({
        type: 'faculty_conflict',
        message: 'Faculty scheduled for multiple classes at the same time',
        entries: facultySchedule[key]
      });
    }
  });

  // Check for classroom conflicts
  const classroomSchedule = {};
  timetableEntries.forEach(entry => {
    if (entry.classroomId) {
      const key = `${entry.classroomId}_${entry.dayOfWeek}_${entry.startTime}_${entry.endTime}`;
      
      if (!classroomSchedule[key]) {
        classroomSchedule[key] = [];
      }
      classroomSchedule[key].push(entry);
      
      if (classroomSchedule[key].length > 1) {
        conflicts.push({
          type: 'classroom_conflict',
          message: 'Classroom booked for multiple classes at the same time',
          entries: classroomSchedule[key]
        });
      }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalConflicts: conflicts.length,
      conflicts
    }
  });
});

// Helper function to check for timetable conflicts
const checkTimetableConflicts = async (params) => {
  const {
    facultyId,
    classroomId,
    dayOfWeek,
    startTime,
    endTime,
    academicYear,
    semester,
    effectiveFrom,
    excludeId
  } = params;

  const whereClause = {
    dayOfWeek,
    academicYear,
    semester,
    isActive: true,
    [Op.and]: [
      {
        [Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [Op.gte]: effectiveFrom } }
        ]
      },
      { effectiveFrom: { [Op.lte]: effectiveFrom } }
    ],
    [Op.or]: [
      // Time overlap conditions
      {
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime }
      }
    ]
  };

  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const conflicts = [];

  // Check faculty conflicts
  if (facultyId) {
    const facultyConflicts = await Timetable.findAll({
      where: { ...whereClause, facultyId }
    });
    
    if (facultyConflicts.length > 0) {
      conflicts.push({
        type: 'faculty_conflict',
        message: 'Faculty is already scheduled at this time',
        conflictingEntries: facultyConflicts
      });
    }
  }

  // Check classroom conflicts
  if (classroomId) {
    const classroomConflicts = await Timetable.findAll({
      where: { ...whereClause, classroomId }
    });
    
    if (classroomConflicts.length > 0) {
      conflicts.push({
        type: 'classroom_conflict',
        message: 'Classroom is already booked at this time',
        conflictingEntries: classroomConflicts
      });
    }
  }

  return conflicts;
};

module.exports = {
  getTimetable,
  getTimetableEntry,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getSectionTimetable,
  getFacultyTimetable,
  getClassroomSchedule,
  getTimetableConflicts
};
