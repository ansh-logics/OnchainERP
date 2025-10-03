const { Permission, RolePermission, User } = require('../db/models');

/**
 * Initialize default permissions and role assignments
 */
const initializePermissions = async () => {
  try {
    console.log('Initializing permissions system...');

    // Define all permissions
    const permissions = [
      // Profile Management
      {
        name: 'view-own-profile',
        description: 'View own profile information',
        resource: 'profile',
        action: 'read',
        category: 'profile'
      },
      {
        name: 'edit-own-profile',
        description: 'Edit own profile information',
        resource: 'profile',
        action: 'update',
        category: 'profile'
      },
      {
        name: 'view-all-profiles',
        description: 'View all user profiles',
        resource: 'profile',
        action: 'read',
        category: 'profile'
      },
      {
        name: 'manage-all-profiles',
        description: 'Manage all user profiles',
        resource: 'profile',
        action: 'manage',
        category: 'profile'
      },

      // Academic Management
      {
        name: 'view-courses',
        description: 'View course information',
        resource: 'course',
        action: 'read',
        category: 'academic'
      },
      {
        name: 'manage-courses',
        description: 'Create and manage courses',
        resource: 'course',
        action: 'manage',
        category: 'academic'
      },
      {
        name: 'view-timetable',
        description: 'View timetable',
        resource: 'timetable',
        action: 'read',
        category: 'academic'
      },
      {
        name: 'manage-timetable',
        description: 'Create and manage timetable',
        resource: 'timetable',
        action: 'manage',
        category: 'academic'
      },

      // Attendance Management
      {
        name: 'view-own-attendance',
        description: 'View own attendance records',
        resource: 'attendance',
        action: 'read',
        category: 'attendance'
      },
      {
        name: 'mark-attendance',
        description: 'Mark student attendance',
        resource: 'attendance',
        action: 'create',
        category: 'attendance'
      },
      {
        name: 'manage-attendance',
        description: 'Full attendance management',
        resource: 'attendance',
        action: 'manage',
        category: 'attendance'
      },
      {
        name: 'view-attendance-reports',
        description: 'View attendance reports',
        resource: 'attendance',
        action: 'read',
        category: 'reports'
      },

      // Grades Management
      {
        name: 'view-own-grades',
        description: 'View own grade records',
        resource: 'grade',
        action: 'read',
        category: 'grades'
      },
      {
        name: 'assign-grades',
        description: 'Assign grades to students',
        resource: 'grade',
        action: 'create',
        category: 'grades'
      },
      {
        name: 'update-grades',
        description: 'Update existing grades',
        resource: 'grade',
        action: 'update',
        category: 'grades'
      },
      {
        name: 'view-grade-reports',
        description: 'View grade reports',
        resource: 'grade',
        action: 'read',
        category: 'reports'
      },

      // Assignment Management
      {
        name: 'view-assignments',
        description: 'View assignments',
        resource: 'assignment',
        action: 'read',
        category: 'assignments'
      },
      {
        name: 'submit-assignment',
        description: 'Submit assignments',
        resource: 'assignment',
        action: 'create',
        category: 'assignments'
      },
      {
        name: 'create-assignment',
        description: 'Create new assignments',
        resource: 'assignment',
        action: 'create',
        category: 'assignments'
      },
      {
        name: 'manage-assignments',
        description: 'Full assignment management',
        resource: 'assignment',
        action: 'manage',
        category: 'assignments'
      },

      // Fee Management
      {
        name: 'view-own-fees',
        description: 'View own fee information',
        resource: 'fee',
        action: 'read',
        category: 'fees'
      },
      {
        name: 'pay-fees',
        description: 'Make fee payments',
        resource: 'fee',
        action: 'create',
        category: 'fees'
      },
      {
        name: 'manage-fees',
        description: 'Manage fee structure and payments',
        resource: 'fee',
        action: 'manage',
        category: 'fees'
      },
      {
        name: 'view-payment-reports',
        description: 'View payment reports',
        resource: 'payment',
        action: 'read',
        category: 'reports'
      },

      // Library Management
      {
        name: 'view-library-books',
        description: 'View library catalog',
        resource: 'library',
        action: 'read',
        category: 'library'
      },
      {
        name: 'issue-books',
        description: 'Issue and return books',
        resource: 'library',
        action: 'create',
        category: 'library'
      },
      {
        name: 'manage-library',
        description: 'Full library management',
        resource: 'library',
        action: 'manage',
        category: 'library'
      },

      // Hostel Management
      {
        name: 'view-hostel-info',
        description: 'View hostel information',
        resource: 'hostel',
        action: 'read',
        category: 'hostel'
      },
      {
        name: 'apply-hostel',
        description: 'Apply for hostel accommodation',
        resource: 'hostel',
        action: 'create',
        category: 'hostel'
      },
      {
        name: 'manage-hostel',
        description: 'Manage hostel allocations',
        resource: 'hostel',
        action: 'manage',
        category: 'hostel'
      },

      // User Management
      {
        name: 'view-users',
        description: 'View user information',
        resource: 'user',
        action: 'read',
        category: 'users'
      },
      {
        name: 'create-users',
        description: 'Create new users',
        resource: 'user',
        action: 'create',
        category: 'users'
      },
      {
        name: 'manage-users',
        description: 'Full user management',
        resource: 'user',
        action: 'manage',
        category: 'users'
      },
      {
        name: 'manage-permissions',
        description: 'Manage user permissions',
        resource: 'permission',
        action: 'manage',
        category: 'users'
      },

      // System Management
      {
        name: 'view-system-logs',
        description: 'View system logs',
        resource: 'system',
        action: 'read',
        category: 'system'
      },
      {
        name: 'manage-system',
        description: 'System administration',
        resource: 'system',
        action: 'manage',
        category: 'system'
      },
      {
        name: 'view-reports',
        description: 'View system reports',
        resource: 'report',
        action: 'read',
        category: 'reports'
      },
      {
        name: 'generate-reports',
        description: 'Generate custom reports',
        resource: 'report',
        action: 'create',
        category: 'reports'
      }
    ];

    // Create permissions
    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
    }

    console.log(`✅ ${permissions.length} permissions initialized`);

    // Define default role permissions
    const defaultRolePermissions = {
      student: [
        'view-own-profile', 'edit-own-profile',
        'view-courses', 'view-timetable',
        'view-own-attendance', 'view-own-grades',
        'view-assignments', 'submit-assignment',
        'view-own-fees', 'pay-fees',
        'view-library-books', 'view-hostel-info', 'apply-hostel'
      ],
      faculty: [
        'view-own-profile', 'edit-own-profile',
        'view-courses', 'manage-courses',
        'view-timetable', 'manage-timetable',
        'mark-attendance', 'view-attendance-reports',
        'assign-grades', 'update-grades', 'view-grade-reports',
        'create-assignment', 'manage-assignments',
        'view-library-books', 'issue-books',
        'view-hostel-info'
      ],
      cashier: [
        'view-own-profile', 'edit-own-profile',
        'view-users',
        'manage-fees', 'view-payment-reports',
        'view-reports'
      ],
      admin: [
        'view-own-profile', 'edit-own-profile',
        'view-all-profiles', 'manage-all-profiles',
        'view-courses', 'manage-courses',
        'view-timetable', 'manage-timetable',
        'view-attendance-reports', 'manage-attendance',
        'view-grade-reports',
        'view-assignments', 'manage-assignments',
        'manage-fees', 'view-payment-reports',
        'manage-library',
        'manage-hostel',
        'view-users', 'create-users', 'manage-users', 'manage-permissions',
        'view-system-logs', 'manage-system',
        'view-reports', 'generate-reports'
      ]
    };

    console.log('Setting up default role permissions...');
    
    // Note: This would be applied when a college is created or during setup
    // For now, we just log what would be assigned
    Object.entries(defaultRolePermissions).forEach(([role, permissionNames]) => {
      console.log(`${role}: ${permissionNames.length} permissions`);
    });

    console.log('✅ Permissions system initialized successfully');
    return defaultRolePermissions;

  } catch (error) {
    console.error('❌ Error initializing permissions:', error);
    throw error;
  }
};

/**
 * Assign default permissions to a college's roles
 */
const assignDefaultPermissionsToCollege = async (collegeId, adminUserId) => {
  try {
    console.log(`Assigning default permissions to college ${collegeId}...`);

    const defaultRolePermissions = {
      student: [
        'view-own-profile', 'edit-own-profile',
        'view-courses', 'view-timetable',
        'view-own-attendance', 'view-own-grades',
        'view-assignments', 'submit-assignment',
        'view-own-fees', 'pay-fees',
        'view-library-books', 'view-hostel-info', 'apply-hostel'
      ],
      faculty: [
        'view-own-profile', 'edit-own-profile',
        'view-courses', 'manage-courses',
        'view-timetable', 'manage-timetable',
        'mark-attendance', 'view-attendance-reports',
        'assign-grades', 'update-grades', 'view-grade-reports',
        'create-assignment', 'manage-assignments',
        'view-library-books', 'issue-books',
        'view-hostel-info'
      ],
      cashier: [
        'view-own-profile', 'edit-own-profile',
        'view-users',
        'manage-fees', 'view-payment-reports',
        'view-reports'
      ],
      admin: [
        'view-own-profile', 'edit-own-profile',
        'view-all-profiles', 'manage-all-profiles',
        'view-courses', 'manage-courses',
        'view-timetable', 'manage-timetable',
        'view-attendance-reports', 'manage-attendance',
        'view-grade-reports',
        'view-assignments', 'manage-assignments',
        'manage-fees', 'view-payment-reports',
        'manage-library',
        'manage-hostel',
        'view-users', 'create-users', 'manage-users', 'manage-permissions',
        'view-system-logs', 'manage-system',
        'view-reports', 'generate-reports'
      ]
    };

    for (const [role, permissionNames] of Object.entries(defaultRolePermissions)) {
      for (const permissionName of permissionNames) {
        const permission = await Permission.findOne({ where: { name: permissionName } });
        if (permission) {
          await RolePermission.findOrCreate({
            where: {
              role,
              permissionId: permission.id,
              collegeId
            },
            defaults: {
              grantedBy: adminUserId,
              isActive: true
            }
          });
        }
      }
    }

    console.log(`✅ Default permissions assigned to college ${collegeId}`);
  } catch (error) {
    console.error(`❌ Error assigning permissions to college ${collegeId}:`, error);
    throw error;
  }
};

module.exports = {
  initializePermissions,
  assignDefaultPermissionsToCollege
};
