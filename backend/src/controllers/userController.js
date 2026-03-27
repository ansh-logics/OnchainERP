const { User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.role) {
      where.role = req.query.role;
    }

    const include = [];
    if (req.query.role === 'student') {
      include.push({
        association: 'studentProfile',
        attributes: ['id', 'enrollmentNumber'],
        required: true
      });
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include,
      order: [['createdAt', 'DESC']]
    });

    let data = users.map((u) => u.get({ plain: true }));

    if (req.query.role === 'student') {
      data = data
        .filter((u) => u.studentProfile)
        .map((u) => ({
          _id: u.studentProfile.id,
          name: u.name,
          email: u.email,
          enrollmentNumber: u.studentProfile.enrollmentNumber
        }));
    } else {
      data = data.map((u) => ({ ...u, _id: u.id }));
    }

    await LoggingService.logUserAction(
      'get_all_users',
      req.user.id,
      { count: data.length },
      {
        userRole: req.user.role,
        collegeId: req.user.college,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    await LoggingService.logError('user_management', 'get_all_users', req.user?.id, error);
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { association: 'studentProfile' },
        { association: 'facultyProfile' }
      ]
    });
    
    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    // Log the action
    await LoggingService.logUserAction(
      'get_user',
      req.user.id,
      { targetUserId: req.params.id },
      { 
        userRole: req.user.role,
        collegeId: req.user.college,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    await LoggingService.logError('user_management', 'get_user', req.user?.id, error);
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Log the action
    await LoggingService.logUserAction(
      'create_user',
      req.user.id,
      { 
        newUserId: user.id,
        role: user.role,
        email: user.email
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.college,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    const patch = { ...req.body };
    delete patch.id;
    delete patch.password;
    await user.update(patch);

    const updated = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: { ...updated.get({ plain: true }), _id: updated.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
