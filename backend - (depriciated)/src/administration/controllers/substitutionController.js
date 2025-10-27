const { 
  FacultySubstitution, 
  Faculty, 
  User, 
  Course, 
  Section,
  Timetable,
  Department,
  College,
  Classroom,
  sequelize
} = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');

// @desc    Get all faculty substitutions for admin (with filters)
// @route   GET /api/admin/faculty-substitutions
// @access  Private/Admin
const getAllSubstitutions = async (req, res, next) => {
  try {
    const { 
      date, 
      startDate, 
      endDate, 
      status, 
      departmentId, 
      facultyId,
      courseId,
      page = 1, 
      limit = 20 
    } = req.query;

    const whereClause = {};

    // Date filters
    if (date) {
      whereClause.date = date;
    } else if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Faculty filter (can be absent or substitute faculty)
    if (facultyId) {
      whereClause[Op.or] = [
        { absentFacultyId: facultyId },
        { substituteFacultyId: facultyId }
      ];
    }

    // Course filter
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const includeClause = [
      {
        model: Faculty,
        as: 'absentFaculty',
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Department, as: 'department', attributes: ['id', 'name', 'shortName'] }
        ],
        ...(departmentId && {
          where: { departmentId }
        })
      },
      {
        model: Faculty,
        as: 'substituteFaculty',
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Department, as: 'department', attributes: ['id', 'name', 'shortName'] }
        ]
      },
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'code', 'credits']
      },
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'semester', 'batch']
      },
      {
        model: Timetable,
        as: 'timetable',
        include: [
          { 
            model: Classroom, 
            as: 'classroom',
            attributes: ['id', 'name', 'capacity', 'building']
          }
        ]
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'name', 'email'],
        required: false
      },
      {
        model: User,
        as: 'confirmer',
        attributes: ['id', 'name', 'email'],
        required: false
      }
    ];

    const offset = (page - 1) * limit;

    const { count, rows: substitutions } = await FacultySubstitution.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      data: substitutions,
      pagination: {
        current: parseInt(page),
        totalPages,
        totalRecords: count,
        limit: parseInt(limit),
        hasNext,
        hasPrev
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get substitutions for a specific date
// @route   GET /api/admin/faculty-substitutions/date/:date
// @access  Private/Admin
const getSubstitutionsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { status } = req.query;

    const whereClause = { date };
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
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: Department, as: 'department', attributes: ['name', 'shortName'] }
          ]
        },
        {
          model: Faculty,
          as: 'substituteFaculty',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
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
      order: [
        [{ model: Timetable, as: 'timetable' }, 'startTime', 'ASC']
      ]
    });

    // Group by time slots for better display
    const groupedByTime = substitutions.reduce((acc, sub) => {
      const timeKey = `${sub.timetable.startTime}-${sub.timetable.endTime}`;
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(sub);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        date,
        substitutions,
        groupedByTime,
        summary: {
          total: substitutions.length,
          pending: substitutions.filter(s => s.status === 'pending').length,
          confirmed: substitutions.filter(s => s.status === 'confirmed').length,
          rejected: substitutions.filter(s => s.status === 'rejected').length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a substitution request
// @route   PATCH /api/admin/faculty-substitutions/:id/approve
// @access  Private/Admin
const approveSubstitution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const substitution = await FacultySubstitution.findOne({
      where: {
        id,
        status: 'pending'
      },
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
        { model: Timetable, as: 'timetable' }
      ]
    });

    if (!substitution) {
      return next(new ErrorResponse('Substitution request not found or already processed', 404));
    }

    await substitution.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      remarks
    });

    res.status(200).json({
      success: true,
      data: substitution,
      message: 'Substitution request approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a substitution request
// @route   PATCH /api/admin/faculty-substitutions/:id/reject
// @access  Private/Admin
const rejectSubstitution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks) {
      return next(new ErrorResponse('Rejection reason is required', 400));
    }

    const substitution = await FacultySubstitution.findOne({
      where: {
        id,
        status: { [Op.in]: ['pending', 'approved'] }
      },
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
        { model: Course, as: 'course' }
      ]
    });

    if (!substitution) {
      return next(new ErrorResponse('Substitution request not found or cannot be rejected', 404));
    }

    await substitution.update({
      status: 'rejected',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      remarks
    });

    res.status(200).json({
      success: true,
      data: substitution,
      message: 'Substitution request rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get substitution statistics
// @route   GET /api/admin/faculty-substitutions/stats
// @access  Private/Admin
const getSubstitutionStats = async (req, res, next) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const includeClause = [];
    if (departmentId) {
      includeClause.push({
        model: Faculty,
        as: 'absentFaculty',
        where: { departmentId },
        attributes: []
      });
    }

    // Get overall statistics
    const totalSubstitutions = await FacultySubstitution.count({
      where: whereClause,
      ...(includeClause.length > 0 && { include: includeClause })
    });

    const statusCounts = await FacultySubstitution.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      ...(includeClause.length > 0 && { include: includeClause })
    });

    // Get department-wise statistics
    const departmentStats = await FacultySubstitution.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('FacultySubstitution.id')), 'count']
      ],
      include: [
        {
          model: Faculty,
          as: 'absentFaculty',
          attributes: [],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name', 'shortName']
            }
          ]
        }
      ],
      group: ['absentFaculty.department.id', 'absentFaculty.department.name', 'absentFaculty.department.shortName']
    });

    // Get most active faculty (those requesting most substitutions)
    const activeFaculty = await FacultySubstitution.findAll({
      where: whereClause,
      attributes: [
        'absentFacultyId',
        [sequelize.fn('COUNT', sequelize.col('FacultySubstitution.id')), 'count']
      ],
      include: [
        {
          model: Faculty,
          as: 'absentFaculty',
          attributes: ['id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email']
            },
            {
              model: Department,
              as: 'department',
              attributes: ['name']
            }
          ]
        }
      ],
      group: ['absentFacultyId', 'absentFaculty.id', 'absentFaculty.user.id', 'absentFaculty.department.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('FacultySubstitution.id')), 'DESC']],
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        totalSubstitutions,
        statusBreakdown: statusCounts,
        departmentStats,
        mostActiveFaculty: activeFaculty
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a substitution (by admin)
// @route   PATCH /api/admin/faculty-substitutions/:id/cancel
// @access  Private/Admin
const cancelSubstitution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const substitution = await FacultySubstitution.findOne({
      where: {
        id,
        status: { [Op.in]: ['pending', 'approved', 'confirmed'] }
      }
    });

    if (!substitution) {
      return next(new ErrorResponse('Substitution not found or cannot be cancelled', 404));
    }

    await substitution.update({
      status: 'cancelled',
      remarks: remarks || 'Cancelled by administrator'
    });

    res.status(200).json({
      success: true,
      message: 'Substitution cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubstitutions,
  getSubstitutionsByDate,
  approveSubstitution,
  rejectSubstitution,
  getSubstitutionStats,
  cancelSubstitution
};
