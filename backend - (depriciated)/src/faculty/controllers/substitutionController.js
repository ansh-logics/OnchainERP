const { 
  FacultySubstitution, 
  Faculty, 
  User, 
  Course, 
  Section,
  Timetable,
  Department,
  College,
  Classroom
} = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');
const notificationService = require('../services/substitutionNotificationService');

// @desc    Get available substitute faculty for a specific course and date
// @route   GET /api/faculty-services/substitutions/available-substitutes/:courseId/:date
// @access  Private/Faculty
const getAvailableSubstitutes = async (req, res, next) => {
  try {
    const { courseId, date } = req.params;
    const { periods } = req.query; // Get periods from query parameter
    const requestingFacultyId = req.user.facultyProfile?.id;

    if (!requestingFacultyId) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Get the requesting faculty's college and department
    const requestingFaculty = await Faculty.findByPk(requestingFacultyId, {
      include: [
        { model: College, as: 'college' },
        { model: Department, as: 'department' }
      ]
    });

    // Get day of week for the given date
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay() === 0 ? 7 : targetDate.getDay(); // Convert Sunday (0) to 7

    // Build query conditions for timetable
    const timetableQuery = {
      courseId: courseId,
      facultyId: requestingFacultyId, // Ensure this faculty teaches this course
      dayOfWeek: dayOfWeek,
      isActive: true,
      effectiveFrom: { [Op.lte]: date },
      [Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [Op.gte]: date } }
      ]
    };

    // Parse periods from query parameter if provided
    let selectedPeriods = [];
    if (periods) {
      selectedPeriods = periods.split(',').map(p => parseInt(p.trim()));
      timetableQuery.period = { [Op.in]: selectedPeriods };
    }

    // Find all timetable entries for the given course and date
    const courseSchedules = await Timetable.findAll({
      where: timetableQuery,
      include: [
        { model: Course, as: 'course' },
        { model: Section, as: 'section' }
      ]
    });

    if (courseSchedules.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          course: null,
          schedules: [],
          availableFaculty: { sameDepartment: [], otherDepartments: [] }
        },
        message: 'No classes scheduled for this course and periods on the specified date'
      });
    }

    // Get all time slots that need substitution
    const timeSlots = courseSchedules.map(schedule => ({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      period: schedule.period,
      timetableId: schedule.id
    }));

    // Find faculty who are NOT scheduled during any of these time slots on the same date
    const conflictingTimetableIds = await Timetable.findAll({
      where: {
        dayOfWeek: dayOfWeek,
        isActive: true,
        effectiveFrom: { [Op.lte]: date },
        [Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [Op.gte]: date } }
        ],
        [Op.or]: timeSlots.map(slot => ({
          [Op.and]: [
            { startTime: { [Op.lt]: slot.endTime } },
            { endTime: { [Op.gt]: slot.startTime } }
          ]
        }))
      },
      attributes: ['facultyId']
    });

    const busyFacultyIds = conflictingTimetableIds.map(t => t.facultyId);

    // Also exclude faculty who already have substitution assignments for this date
    const substituteAssignments = await FacultySubstitution.findAll({
      where: {
        date: date,
        status: { [Op.in]: ['approved', 'confirmed'] }
      },
      attributes: ['substituteFacultyId']
    });

    const assignedSubstituteIds = substituteAssignments.map(s => s.substituteFacultyId);

    // Combine all excluded faculty IDs
    const excludedFacultyIds = [...new Set([...busyFacultyIds, ...assignedSubstituteIds, requestingFacultyId])];

    // Find available faculty from the same college and preferably same department
    const availableFaculty = await Faculty.findAll({
      where: {
        collegeId: requestingFaculty.collegeId,
        id: { [Op.notIn]: excludedFacultyIds }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'profilePicture'],
          where: { isActive: true }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'shortName']
        }
      ],
      order: [
        // Prioritize faculty from the same department
        [{ model: Department, as: 'department' }, 'name', 'ASC']
      ]
    });

    // Categorize faculty by department priority
    const sameDeptFaculty = availableFaculty.filter(f => f.departmentId === requestingFaculty.departmentId);
    const otherDeptFaculty = availableFaculty.filter(f => f.departmentId !== requestingFaculty.departmentId);

    const responseData = {
      course: courseSchedules[0].course,
      schedules: courseSchedules.map(schedule => ({
        id: schedule.id,
        section: schedule.section,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        period: schedule.period,
        classType: schedule.classType
      })),
      availableFaculty: {
        sameDepartment: sameDeptFaculty,
        otherDepartments: otherDeptFaculty
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a substitution request
// @route   POST /api/faculty-services/select-substitute
// @access  Private/Faculty
const selectSubstitute = async (req, res, next) => {
  try {
    const { courseId, substituteFacultyId, date, reason, periods } = req.body;
    const absentFacultyId = req.user.facultyProfile?.id;

    if (!absentFacultyId) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Validate input
    if (!courseId || !substituteFacultyId || !date || !periods || periods.length === 0) {
      return next(new ErrorResponse('Missing required fields', 400));
    }

    // Check if substitute faculty exists and is different from requesting faculty
    if (absentFacultyId === substituteFacultyId) {
      return next(new ErrorResponse('Cannot substitute for yourself', 400));
    }

    const substituteFaculty = await Faculty.findByPk(substituteFacultyId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!substituteFaculty) {
      return next(new ErrorResponse('Substitute faculty not found', 404));
    }

    // Get day of week for the given date
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay() === 0 ? 7 : targetDate.getDay();

    // Verify timetable entries exist for the specified periods and belong to the requesting faculty
    const timetableEntries = await Timetable.findAll({
      where: {
        courseId: courseId,
        facultyId: absentFacultyId,
        dayOfWeek: dayOfWeek,
        period: { [Op.in]: periods },
        isActive: true,
        effectiveFrom: { [Op.lte]: date },
        [Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [Op.gte]: date } }
        ]
      },
      include: [
        { model: Course, as: 'course' },
        { model: Section, as: 'section' }
      ]
    });

    if (timetableEntries.length !== periods.length) {
      return next(new ErrorResponse('One or more periods not found or unauthorized for this faculty', 400));
    }

    // Check for existing substitutions on the same date and periods
    const timetableIds = timetableEntries.map(t => t.id);
    const existingSubstitutions = await FacultySubstitution.findAll({
      where: {
        timetableId: { [Op.in]: timetableIds },
        date: date,
        status: { [Op.notIn]: ['rejected', 'cancelled'] }
      }
    });

    if (existingSubstitutions.length > 0) {
      return next(new ErrorResponse('Substitution already exists for one or more of these periods', 409));
    }

    // Create substitution requests for each timetable entry
    const substitutionPromises = timetableEntries.map(timetable => 
      FacultySubstitution.create({
        facultyId: absentFacultyId,
        timetableId: timetable.id,
        substituteFacultyId: substituteFacultyId,
        date: date,
        reason: reason,
        status: 'pending'
      })
    );

    const substitutions = await Promise.all(substitutionPromises);    // Fetch complete substitution data for response
    const createdSubstitutions = await FacultySubstitution.findAll({
      where: { id: { [Op.in]: substitutions.map(s => s.id) } },
      include: [
        {
          model: Faculty,
          as: 'absentFaculty',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        },
        {
          model: Faculty,
          as: 'substituteFaculty',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        },
        { model: Course, as: 'course' },
        { model: Section, as: 'section' },
        {
          model: Timetable,
          as: 'timetable',
          include: [{ model: Classroom, as: 'classroom' }]
        }
      ]
    });

    // Send notification to substitute faculty
    try {
      for (const substitution of createdSubstitutions) {
        await notificationService.notifySubstitutionRequest(substitution);
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      data: createdSubstitutions,
      message: `Substitution request sent to ${substituteFaculty.user.name}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty substitution requests (for substitute faculty)
// @route   GET /api/faculty-services/substitution-requests
// @access  Private/Faculty
const getSubstitutionRequests = async (req, res, next) => {
  try {
    const facultyId = req.user.facultyProfile?.id;

    if (!facultyId) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    const { status = 'pending' } = req.query;

    const substitutions = await FacultySubstitution.findAll({
      where: {
        substituteFacultyId: facultyId,
        ...(status && { status })
      },
      include: [
        {
          model: Faculty,
          as: 'absentFaculty',
          include: [
            { model: User, as: 'user', attributes: ['name', 'email', 'phone'] },
            { model: Department, as: 'department', attributes: ['name', 'shortName'] }
          ]
        },
        { model: Course, as: 'course' },
        { model: Section, as: 'section' },
        {
          model: Timetable,
          as: 'timetable',
          include: [{ model: Classroom, as: 'classroom' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: substitutions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to substitution request (accept/decline)
// @route   PATCH /api/faculty-services/substitution-requests/:id/respond
// @access  Private/Faculty
const respondToSubstitutionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; // action: 'confirm' or 'reject'
    const facultyId = req.user.facultyProfile?.id;

    if (!facultyId) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    if (!['confirm', 'reject'].includes(action)) {
      return next(new ErrorResponse('Invalid action. Must be "confirm" or "reject"', 400));
    }

    const substitution = await FacultySubstitution.findOne({
      where: {
        id,
        substituteFacultyId: facultyId,
        status: 'pending'
      },
      include: [
        {
          model: Faculty,
          as: 'absentFaculty',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        },
        { model: Course, as: 'course' },
        { model: Timetable, as: 'timetable' }
      ]
    });

    if (!substitution) {
      return next(new ErrorResponse('Substitution request not found or unauthorized', 404));
    }

    // Update substitution status
    await substitution.update({
      status: action === 'confirm' ? 'confirmed' : 'rejected',
      remarks,
      confirmedBy: action === 'confirm' ? req.user.id : null,
      confirmedAt: action === 'confirm' ? new Date() : null
    });

    // Send notification to absent faculty
    try {
      await notificationService.notifySubstitutionResponse(substitution, action === 'confirm' ? 'confirmed' : 'rejected');
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.status(200).json({
      success: true,
      data: substitution,
      message: `Substitution request ${action}ed successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my substitution history (both as absent and substitute faculty)
// @route   GET /api/faculty-services/substitution-history
// @access  Private/Faculty
const getSubstitutionHistory = async (req, res, next) => {
  try {
    const facultyId = req.user.facultyProfile?.id;

    if (!facultyId) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    const { startDate, endDate, status } = req.query;

    const whereClause = {
      [Op.or]: [
        { absentFacultyId: facultyId },
        { substituteFacultyId: facultyId }
      ]
    };

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const substitutions = await FacultySubstitution.findAll({
      where: whereClause,
      include: [
        {
          model: Faculty,
          as: 'absentFaculty',
          include: [
            { model: User, as: 'user', attributes: ['name', 'email'] },
            { model: Department, as: 'department', attributes: ['name'] }
          ]
        },
        {
          model: Faculty,
          as: 'substituteFaculty',
          include: [
            { model: User, as: 'user', attributes: ['name', 'email'] },
            { model: Department, as: 'department', attributes: ['name'] }
          ]
        },
        { model: Course, as: 'course' },
        { model: Section, as: 'section' },
        {
          model: Timetable,
          as: 'timetable',
          include: [{ model: Classroom, as: 'classroom' }]
        }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    // Categorize substitutions
    const asAbsentFaculty = substitutions.filter(s => s.absentFacultyId === facultyId);
    const asSubstituteFaculty = substitutions.filter(s => s.substituteFacultyId === facultyId);

    res.status(200).json({
      success: true,
      data: {
        asAbsentFaculty,
        asSubstituteFaculty,
        total: substitutions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSubstitutes,
  selectSubstitute,
  getSubstitutionRequests,
  respondToSubstitutionRequest,
  getSubstitutionHistory
};
