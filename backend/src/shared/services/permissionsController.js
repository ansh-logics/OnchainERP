const { Permission, RolePermission, User, College } = require('../db/models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private/Admin
exports.getPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.findAll({
      where: { isActive: true },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const category = permission.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: groupedPermissions
    });
  } catch (error) {
    await LoggingService.logError('permissions', 'get_permissions', req.user?.id, error);
    next(error);
  }
};

// @desc    Get role permissions for a specific role
// @route   GET /api/permissions/roles/:role
// @access  Private/Admin
exports.getRolePermissions = async (req, res, next) => {
  try {
    const { role } = req.params;
    const userCollegeId = req.user.collegeId;

    const rolePermissions = await RolePermission.findAll({
      where: {
        role,
        collegeId: userCollegeId,
        isActive: true
      },
      include: [
        {
          model: Permission,
          as: 'permission',
          where: { isActive: true }
        }
      ],
      order: [['permission', 'category', 'ASC'], ['permission', 'name', 'ASC']]
    });

    // Get all available permissions for comparison
    const allPermissions = await Permission.findAll({
      where: { isActive: true },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    // Create a map of granted permissions
    const grantedPermissionIds = rolePermissions.map(rp => rp.permissionId);
    
    const result = {
      role,
      grantedPermissions: rolePermissions.map(rp => rp.permission),
      availablePermissions: allPermissions.filter(p => !grantedPermissionIds.includes(p.id)),
      totalGranted: grantedPermissionIds.length,
      totalAvailable: allPermissions.length
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    await LoggingService.logError('permissions', 'get_role_permissions', req.user?.id, error);
    next(error);
  }
};

// @desc    Grant permission to role
// @route   POST /api/permissions/roles/:role/grant
// @access  Private/Admin
exports.grantPermissionToRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { permissionIds } = req.body;
    const userCollegeId = req.user.collegeId;

    if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
      return next(new ErrorResponse('Please provide permission IDs to grant', 400));
    }

    // Validate role
    const validRoles = ['student', 'faculty', 'admin', 'cashier'];
    if (!validRoles.includes(role)) {
      return next(new ErrorResponse('Invalid role specified', 400));
    }

    // Validate permissions exist
    const permissions = await Permission.findAll({
      where: {
        id: permissionIds,
        isActive: true
      }
    });

    if (permissions.length !== permissionIds.length) {
      return next(new ErrorResponse('One or more permissions not found', 404));
    }

    const results = { granted: 0, existing: 0, errors: [] };

    for (const permissionId of permissionIds) {
      try {
        const [rolePermission, created] = await RolePermission.findOrCreate({
          where: {
            role,
            permissionId,
            collegeId: userCollegeId
          },
          defaults: {
            grantedBy: req.user.id,
            isActive: true
          }
        });

        if (created) {
          results.granted++;
        } else if (!rolePermission.isActive) {
          // Reactivate if previously revoked
          await rolePermission.update({ 
            isActive: true, 
            grantedBy: req.user.id,
            grantedAt: new Date()
          });
          results.granted++;
        } else {
          results.existing++;
        }
      } catch (error) {
        results.errors.push({
          permissionId,
          error: error.message
        });
      }
    }

    // Log the action
    await LoggingService.logUserAction(
      'grant_role_permissions',
      req.user.id,
      { 
        role,
        permissionIds,
        results
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.collegeId
      }
    );

    res.status(200).json({
      success: true,
      message: `Permissions granted: ${results.granted}, already existing: ${results.existing}`,
      data: results
    });
  } catch (error) {
    await LoggingService.logError('permissions', 'grant_permission_to_role', req.user?.id, error);
    next(error);
  }
};

// @desc    Revoke permission from role
// @route   DELETE /api/permissions/roles/:role/revoke
// @access  Private/Admin
exports.revokePermissionFromRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { permissionIds } = req.body;
    const userCollegeId = req.user.collegeId;

    if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
      return next(new ErrorResponse('Please provide permission IDs to revoke', 400));
    }

    const results = { revoked: 0, notFound: 0, errors: [] };

    for (const permissionId of permissionIds) {
      try {
        const rolePermission = await RolePermission.findOne({
          where: {
            role,
            permissionId,
            collegeId: userCollegeId,
            isActive: true
          }
        });

        if (rolePermission) {
          await rolePermission.update({ isActive: false });
          results.revoked++;
        } else {
          results.notFound++;
        }
      } catch (error) {
        results.errors.push({
          permissionId,
          error: error.message
        });
      }
    }

    // Log the action
    await LoggingService.logUserAction(
      'revoke_role_permissions',
      req.user.id,
      { 
        role,
        permissionIds,
        results
      },
      { 
        userRole: req.user.role,
        collegeId: req.user.collegeId
      }
    );

    res.status(200).json({
      success: true,
      message: `Permissions revoked: ${results.revoked}, not found: ${results.notFound}`,
      data: results
    });
  } catch (error) {
    await LoggingService.logError('permissions', 'revoke_permission_from_role', req.user?.id, error);
    next(error);
  }
};

// @desc    Get permissions summary for all roles
// @route   GET /api/permissions/summary
// @access  Private/Admin
exports.getPermissionsSummary = async (req, res, next) => {
  try {
    const userCollegeId = req.user.collegeId;
    const roles = ['student', 'faculty', 'admin', 'cashier'];
    
    const summary = {};

    for (const role of roles) {
      const rolePermissions = await RolePermission.findAll({
        where: {
          role,
          collegeId: userCollegeId,
          isActive: true
        },
        include: [
          {
            model: Permission,
            as: 'permission',
            where: { isActive: true }
          }
        ]
      });

      // Group by category
      const groupedPermissions = rolePermissions.reduce((acc, rp) => {
        const category = rp.permission.category || 'general';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action
        });
        return acc;
      }, {});

      summary[role] = {
        total: rolePermissions.length,
        permissions: groupedPermissions
      };
    }

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    await LoggingService.logError('permissions', 'get_permissions_summary', req.user?.id, error);
    next(error);
  }
};

// @desc    Create new permission
// @route   POST /api/permissions
// @access  Private/Super Admin
exports.createPermission = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Only super admin can create permissions', 403));
    }

    const permission = await Permission.create(req.body);

    await LoggingService.logUserAction(
      'create_permission',
      req.user.id,
      { 
        permissionId: permission.id,
        name: permission.name
      }
    );

    res.status(201).json({
      success: true,
      data: permission
    });
  } catch (error) {
    await LoggingService.logError('permissions', 'create_permission', req.user?.id, error);
    next(error);
  }
};
