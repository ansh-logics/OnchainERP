const { Section, Department, Faculty, User } = require('../../shared/db/models');
const ErrorResponse = require('../../shared/utils/errorResponse');

// @desc    Get all sections with optional filters
// @route   GET /api/sections
// @access  Private
exports.getSections = async (req, res, next) => {
  try {
    const { departmentId, collegeId, semester, batch } = req.query;

    console.log('📋 Fetching sections with filters:', { departmentId, collegeId, semester, batch });

    // Build where clause
    const whereClause = { isActive: true };
    
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }
    
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    
    if (semester) {
      whereClause.semester = parseInt(semester);
    }
    
    if (batch) {
      whereClause.batch = batch;
    }

    const sections = await Section.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Faculty,
          as: 'classTeacher',
          attributes: ['id', 'employeeId'],
          required: false,
          include: [{
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }]
        }
      ],
      order: [['semester', 'ASC'], ['name', 'ASC']]
    });

    console.log(`✅ Found ${sections.length} sections`);

    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    console.error('❌ Error fetching sections:', error);
    next(error);
  }
};

// @desc    Get single section by ID
// @route   GET /api/sections/:id
// @access  Private
exports.getSection = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Faculty,
          as: 'classTeacher',
          attributes: ['id', 'employeeId'],
          required: false,
          include: [{
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }]
        }
      ]
    });

    if (!section) {
      return next(new ErrorResponse('Section not found', 404));
    }

    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    next(error);
  }
};

// @desc    Create a new section
// @route   POST /api/sections
// @access  Private/Admin
exports.createSection = async (req, res, next) => {
  try {
    const section = await Section.create(req.body);

    const fullSection = await Section.findByPk(section.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: fullSection
    });
  } catch (error) {
    console.error('Error creating section:', error);
    next(error);
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private/Admin
exports.updateSection = async (req, res, next) => {
  try {
    let section = await Section.findByPk(req.params.id);

    if (!section) {
      return next(new ErrorResponse('Section not found', 404));
    }

    section = await section.update(req.body);

    const fullSection = await Section.findByPk(section.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Faculty,
          as: 'classTeacher',
          attributes: ['id', 'employeeId'],
          required: false,
          include: [{
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: fullSection
    });
  } catch (error) {
    console.error('Error updating section:', error);
    next(error);
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private/Admin
exports.deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);

    if (!section) {
      return next(new ErrorResponse('Section not found', 404));
    }

    // Soft delete by setting isActive to false
    await section.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    next(error);
  }
};

