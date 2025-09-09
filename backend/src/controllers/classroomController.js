const asyncHandler = require('express-async-handler');
const { Classroom, College, Department, Course, Faculty, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all classrooms
// @route   GET /api/classrooms
// @access  Private
const getClassrooms = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, collegeId, roomType, building, hasProjector, hasAC, capacity } = req.query;

  const whereClause = { isActive: true };
  if (collegeId) whereClause.collegeId = collegeId;
  if (roomType) whereClause.roomType = roomType;
  if (building) whereClause.building = building;
  if (hasProjector) whereClause.hasProjector = hasProjector === 'true';
  if (hasAC) whereClause.hasAC = hasAC === 'true';
  if (capacity) whereClause.capacity = { [Op.gte]: parseInt(capacity) };

  const classrooms = await Classroom.findAndCountAll({
    where: whereClause,
    include: [{
      model: College,
      as: 'college',
      attributes: ['id', 'name', 'shortName']
    }],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['building', 'ASC'], ['roomNumber', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: classrooms.count,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: classrooms.count,
      pages: Math.ceil(classrooms.count / parseInt(limit))
    },
    data: classrooms.rows
  });
});

// @desc    Get single classroom
// @route   GET /api/classrooms/:id
// @access  Private
const getClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findByPk(req.params.id, {
    include: [{
      model: College,
      as: 'college',
      attributes: ['id', 'name', 'shortName']
    }]
  });

  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found'
    });
  }

  // Get current utilization
  const currentTimetable = await Timetable.count({
    where: {
      classroomId: req.params.id,
      isActive: true
    }
  });

  res.status(200).json({
    success: true,
    data: {
      ...classroom.toJSON(),
      utilization: {
        totalClasses: currentTimetable,
        utilizationPercentage: Math.round((currentTimetable / 56) * 100) // Assuming 7 days * 8 periods max
      }
    }
  });
});

// @desc    Create classroom
// @route   POST /api/classrooms
// @access  Private (Admin)
const createClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.create(req.body);

  res.status(201).json({
    success: true,
    data: classroom
  });
});

// @desc    Update classroom
// @route   PUT /api/classrooms/:id
// @access  Private (Admin)
const updateClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findByPk(req.params.id);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found'
    });
  }

  await classroom.update(req.body);

  res.status(200).json({
    success: true,
    data: classroom
  });
});

// @desc    Delete classroom
// @route   DELETE /api/classrooms/:id
// @access  Private (Admin)
const deleteClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findByPk(req.params.id);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found'
    });
  }

  // Check if classroom is currently being used in timetable
  const activeUsage = await Timetable.count({
    where: {
      classroomId: req.params.id,
      isActive: true
    }
  });

  if (activeUsage > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete classroom that is currently scheduled in timetable'
    });
  }

  await classroom.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: 'Classroom deleted successfully'
  });
});

// @desc    Get available classrooms
// @route   GET /api/classrooms/available
// @access  Private
const getAvailableClassrooms = asyncHandler(async (req, res) => {
  const { collegeId, dayOfWeek, startTime, endTime, capacity, roomType, date } = req.query;

  const whereClause = { isActive: true };
  if (collegeId) whereClause.collegeId = collegeId;
  if (capacity) whereClause.capacity = { [Op.gte]: parseInt(capacity) };
  if (roomType) whereClause.roomType = roomType;

  // Get all classrooms matching criteria
  const allClassrooms = await Classroom.findAll({
    where: whereClause,
    order: [['building', 'ASC'], ['roomNumber', 'ASC']]
  });

  // If no time constraints provided, return all matching classrooms
  if (!dayOfWeek || !startTime || !endTime) {
    return res.status(200).json({
      success: true,
      count: allClassrooms.length,
      data: allClassrooms
    });
  }

  // Find classrooms that are NOT booked during the specified time
  const bookedClassrooms = await Timetable.findAll({
    where: {
      dayOfWeek: parseInt(dayOfWeek),
      startTime: { [Op.lt]: endTime },
      endTime: { [Op.gt]: startTime },
      isActive: true,
      ...(date && {
        effectiveFrom: { [Op.lte]: date },
        [Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [Op.gte]: date } }
        ]
      })
    },
    attributes: ['classroomId']
  });

  const bookedClassroomIds = bookedClassrooms.map(booking => booking.classroomId).filter(id => id);
  
  const availableClassrooms = allClassrooms.filter(
    classroom => !bookedClassroomIds.includes(classroom.id)
  );

  res.status(200).json({
    success: true,
    count: availableClassrooms.length,
    data: availableClassrooms,
    timeSlot: {
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      date
    }
  });
});

// @desc    Book classroom
// @route   POST /api/classrooms/:id/book
// @access  Private (Admin/Faculty)
const bookClassroom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    sectionId, 
    courseId, 
    facultyId, 
    dayOfWeek, 
    startTime, 
    endTime, 
    period,
    academicYear, 
    semester, 
    effectiveFrom,
    effectiveTo,
    classType 
  } = req.body;

  // Check if classroom exists
  const classroom = await Classroom.findByPk(id);
  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found'
    });
  }

  // Check for conflicts
  const conflictingBookings = await Timetable.findAll({
    where: {
      classroomId: id,
      dayOfWeek,
      startTime: { [Op.lt]: endTime },
      endTime: { [Op.gt]: startTime },
      isActive: true,
      effectiveFrom: { [Op.lte]: effectiveFrom },
      [Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [Op.gte]: effectiveFrom } }
      ]
    }
  });

  if (conflictingBookings.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Classroom is already booked for the specified time',
      conflicts: conflictingBookings
    });
  }

  // Create timetable entry for the booking
  const booking = await Timetable.create({
    collegeId: classroom.collegeId,
    sectionId,
    courseId,
    facultyId,
    classroomId: id,
    dayOfWeek,
    startTime,
    endTime,
    period,
    academicYear,
    semester,
    classType: classType || 'theory',
    effectiveFrom,
    effectiveTo
  });

  res.status(201).json({
    success: true,
    message: 'Classroom booked successfully',
    data: booking
  });
});

// @desc    Get classroom bookings
// @route   GET /api/classrooms/:id/bookings
// @access  Private
const getClassroomBookings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { academicYear, semester, startDate, endDate } = req.query;

  const whereClause = {
    classroomId: id,
    isActive: true
  };

  if (academicYear) whereClause.academicYear = academicYear;
  if (semester) whereClause.semester = semester;
  
  if (startDate && endDate) {
    whereClause.effectiveFrom = { [Op.lte]: endDate };
    whereClause[Op.or] = [
      { effectiveTo: null },
      { effectiveTo: { [Op.gte]: startDate } }
    ];
  }

  const bookings = await Timetable.findAll({
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
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Cancel classroom booking
// @route   DELETE /api/classrooms/bookings/:id
// @access  Private (Admin/Faculty)
const cancelClassroomBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Timetable.findByPk(id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user has permission to cancel this booking
  const facultyId = req.user.facultyProfile?.id;
  if (booking.facultyId !== facultyId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    });
  }

  await booking.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: 'Classroom booking cancelled successfully'
  });
});

// @desc    Get classroom utilization report
// @route   GET /api/classrooms/utilization
// @access  Private (Admin)
const getClassroomUtilization = asyncHandler(async (req, res) => {
  const { collegeId, academicYear, semester } = req.query;

  const classroomWhere = { isActive: true };
  if (collegeId) classroomWhere.collegeId = collegeId;

  const timetableWhere = { isActive: true };
  if (academicYear) timetableWhere.academicYear = academicYear;
  if (semester) timetableWhere.semester = semester;

  // Get all classrooms
  const classrooms = await Classroom.findAll({
    where: classroomWhere,
    include: [{
      model: Timetable,
      as: 'timetable',
      where: timetableWhere,
      required: false
    }],
    order: [['building', 'ASC'], ['roomNumber', 'ASC']]
  });

  // Calculate utilization for each classroom
  const utilizationReport = classrooms.map(classroom => {
    const totalBookings = classroom.timetable ? classroom.timetable.length : 0;
    const maxPossibleSlots = 56; // 7 days * 8 periods
    const utilizationPercentage = Math.round((totalBookings / maxPossibleSlots) * 100);

    return {
      id: classroom.id,
      roomNumber: classroom.roomNumber,
      building: classroom.building,
      capacity: classroom.capacity,
      roomType: classroom.roomType,
      totalBookings,
      utilizationPercentage,
      availableSlots: maxPossibleSlots - totalBookings
    };
  });

  // Calculate overall statistics
  const totalClassrooms = utilizationReport.length;
  const totalBookings = utilizationReport.reduce((sum, room) => sum + room.totalBookings, 0);
  const averageUtilization = totalClassrooms > 0 
    ? Math.round(utilizationReport.reduce((sum, room) => sum + room.utilizationPercentage, 0) / totalClassrooms)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalClassrooms,
        totalBookings,
        averageUtilization
      },
      classrooms: utilizationReport
    }
  });
});

module.exports = {
  getClassrooms,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getAvailableClassrooms,
  bookClassroom,
  getClassroomBookings,
  cancelClassroomBooking,
  getClassroomUtilization
};
