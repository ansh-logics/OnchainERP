const { User } = require('../db/models');
const { SystemLog } = require('../db/models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc    Get all users (with pagination)
// @route   GET /api/users?page=1&limit=50&role=student&search=john
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50; // Default 50 users per page
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const { role, search, isActive } = req.query;
    
    // Build where clause
    const where = {};
    if (role) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { studentId: { [Op.iLike]: `%${search}%` } },
        { facultyId: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Get total count for pagination
    const totalUsers = await User.count({ where });
    
    // Get paginated users
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Log the action
    await LoggingService.logUserAction(
      'get_all_users',
      req.user.id,
      { count: users.length, page, limit, total: totalUsers },
      { 
        userRole: req.user.role,
        collegeId: req.user.college,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      page,
      totalPages,
      limit,
      data: users
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
    const { password, ...userData } = req.body;
    
    // Generate password if not provided
    let plainPassword = password;
    if (!plainPassword) {
      plainPassword = crypto.randomBytes(8).toString('hex') + 'Aa!';
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    // Create user with hashed password
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      collegeId: req.user.collegeId
    });

    // Remove password from response but include plain password for admin
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
      data: userResponse,
      credentials: {
        email: user.email,
        password: plainPassword,
        username: user.email.split('@')[0]
      },
      message: 'User created successfully. Please share the credentials securely.'
    });
  } catch (error) {
    await LoggingService.logError('user_management', 'create_user', req.user?.id, error);
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

    // Update user
    await user.update(req.body);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Log the action
    await LoggingService.logUserAction(
      'update_user',
      req.user.id,
      { 
        targetUserId: req.params.id,
        updatedFields: Object.keys(req.body)
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.college,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    await LoggingService.logError('user_management', 'update_user', req.user?.id, error);
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

    // Log the action before deletion
    await LoggingService.logUserAction(
      'delete_user',
      req.user.id,
      { 
        targetUserId: req.params.id,
        targetUserEmail: user.email,
        targetUserRole: user.role
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.college,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    await LoggingService.logError('user_management', 'delete_user', req.user?.id, error);
    next(error);
  }
};

// @desc    Bulk import users from CSV
// @route   POST /api/users/bulk-import
// @access  Private/Admin
exports.bulkImportUsers = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a CSV file', 400));
    }
    
    // Check if user has permission to bulk import users
    const userCollegeId = req.user.college?.id || req.user.collegeId;
    
    if (req.user.role !== 'super_admin' && !userCollegeId) {
      return next(new ErrorResponse('Not authorized to bulk import users', 403));
    }
    
    const csv = req.file.buffer.toString('utf8');
    const rows = csv.split('\n').filter(row => row.trim());
    
    if (rows.length < 2) {
      return next(new ErrorResponse('CSV file must contain at least a header row and one data row', 400));
    }
    
    // Parse headers and validate format
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
    const requiredHeaders = ['name', 'email', 'role', 'phone'];
    const optionalHeaders = ['studentid', 'facultyid', 'password', 'username'];
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      return next(new ErrorResponse(`Missing required headers: ${missingHeaders.join(', ')}`, 400));
    }
    
    const usersData = [];
    const validationErrors = [];
    const createdCredentials = []; // Store credentials for admin
    
    // Process each row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',').map(cell => cell.trim());
      
      if (row.length !== headers.length) {
        validationErrors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }
      
      const userData = {};
      
      // Map CSV columns to user properties
      headers.forEach((header, index) => {
        userData[header] = row[index];
      });
      
      // Validate required fields
      if (!userData.name || !userData.email || !userData.role) {
        validationErrors.push(`Row ${i + 1}: Missing required fields (name, email, or role)`);
        continue;
      }
      
      // Validate role
      if (!['student', 'faculty', 'admin', 'cashier'].includes(userData.role)) {
        validationErrors.push(`Row ${i + 1}: Invalid role '${userData.role}'`);
        continue;
      }
      
      // Generate password if not provided
      let plainPassword = userData.password;
      if (!plainPassword) {
        plainPassword = crypto.randomBytes(8).toString('hex') + 'Aa!';
      }
      userData.generatedPassword = plainPassword;
      
      // Generate username if not provided
      let username = userData.username;
      if (!username) {
        username = userData.email.split('@')[0];
      }
      userData.generatedUsername = username;
      
      // Add college ID
      userData.college = userCollegeId;
      
      usersData.push(userData);
    }
    
    if (validationErrors.length > 0) {
      return next(new ErrorResponse(`Validation errors: ${validationErrors.join('; ')}`, 400));
    }
    
    if (usersData.length === 0) {
      return next(new ErrorResponse('No valid user data found in CSV', 400));
    }
    
    const results = {
      created: 0,
      updated: 0,
      errors: [],
      credentials: [] // Return credentials for newly created users
    };
    
    // Use transaction for atomic operations
    const transaction = await User.sequelize.transaction();
    
    try {
      for (const userData of usersData) {
        try {
          // Check if user already exists by email
          const existingUser = await User.findOne({
            where: { email: userData.email },
            transaction
          });
          
          if (existingUser) {
            // Update existing user (except password)
            const updateData = { ...userData };
            delete updateData.password; // Don't update password on bulk import
            delete updateData.generatedPassword;
            delete updateData.generatedUsername;
            delete updateData.college;
            
            await existingUser.update({
              name: updateData.name,
              phone: updateData.phone,
              role: updateData.role,
              studentId: updateData.studentid || null,
              facultyId: updateData.facultyid || null
            }, { transaction });
            results.updated++;
          } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.generatedPassword, salt);
            
            // Create new user
            const newUser = await User.create({
              name: userData.name,
              email: userData.email,
              password: hashedPassword,
              role: userData.role,
              phone: userData.phone,
              collegeId: userCollegeId,
              studentId: userData.studentid || null,
              facultyId: userData.facultyid || null,
              isActive: true
            }, { transaction });
            
            results.created++;
            
            // Store credentials for admin
            results.credentials.push({
              userId: newUser.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              username: userData.generatedUsername,
              password: userData.generatedPassword,
              studentId: userData.studentid || null,
              facultyId: userData.facultyid || null
            });
          }
        } catch (error) {
          results.errors.push({
            user: userData.name || userData.email,
            error: error.message
          });
        }
      }
      
      await transaction.commit();
      
      // Log the action
      await LoggingService.logUserAction(
        'bulk_import_users',
        req.user.id,
        { 
          created: results.created,
          updated: results.updated,
          errors: results.errors.length,
          credentialsGenerated: results.credentials.length
        },
        { 
          userRole: req.user.role,
          collegeId: req.user.college,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      );
      
      res.status(200).json({
        success: true,
        message: `Bulk import completed: ${results.created} created, ${results.updated} updated`,
        data: results
      });
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    await LoggingService.logError('user_management', 'bulk_import_users', req.user?.id, error);
    next(error);
  }
};

// @desc    Reset user password
// @route   POST /api/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    
    // Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Update user password
    await user.update({ 
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null
    });

    // Log the action
    await LoggingService.logUserAction(
      'reset_user_password',
      req.user.id,
      { 
        targetUserId: req.params.id,
        targetUserEmail: user.email
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.college,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        tempPassword: tempPassword,
        email: user.email
      }
    });
  } catch (error) {
    await LoggingService.logError('user_management', 'reset_user_password', req.user?.id, error);
    next(error);
  }
};
