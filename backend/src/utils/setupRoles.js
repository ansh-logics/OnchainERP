const mongoose = require('mongoose');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

/**
 * Initialize default roles and permissions
 */
const initializeRolesAndPermissions = async () => {
  try {
    console.log('Initializing roles and permissions...');
    
    // Define permissions
    const permissionsToCreate = [
      // Student permissions
      {
        name: 'view-own-profile',
        description: 'View own profile information',
        resource: 'profile',
        action: 'read'
      },
      {
        name: 'edit-own-profile',
        description: 'Edit own profile information',
        resource: 'profile',
        action: 'update'
      },
      {
        name: 'view-own-attendance',
        description: 'View own attendance records',
        resource: 'attendance',
        action: 'read'
      },
      {
        name: 'view-own-grades',
        description: 'View own grade records',
        resource: 'grade',
        action: 'read'
      },
      {
        name: 'submit-assignment',
        description: 'Submit assignments',
        resource: 'assignment',
        action: 'create'
      },
      {
        name: 'register-event',
        description: 'Register for events',
        resource: 'event',
        action: 'create'
      },
      
      // Faculty permissions
      {
        name: 'view-faculty-profile',
        description: 'View faculty profile information',
        resource: 'profile',
        action: 'read'
      },
      {
        name: 'edit-faculty-profile',
        description: 'Edit faculty profile information',
        resource: 'profile',
        action: 'update'
      },
      {
        name: 'mark-attendance',
        description: 'Mark student attendance',
        resource: 'attendance',
        action: 'create'
      },
      {
        name: 'update-attendance',
        description: 'Update student attendance',
        resource: 'attendance',
        action: 'update'
      },
      {
        name: 'assign-grades',
        description: 'Assign grades to students',
        resource: 'grade',
        action: 'create'
      },
      {
        name: 'update-grades',
        description: 'Update student grades',
        resource: 'grade',
        action: 'update'
      },
      {
        name: 'create-assignment',
        description: 'Create assignments',
        resource: 'assignment',
        action: 'create'
      },
      {
        name: 'view-course-students',
        description: 'View students in a course',
        resource: 'course',
        action: 'read'
      },
      
      // Admin permissions
      {
        name: 'manage-users',
        description: 'Manage all users',
        resource: 'user',
        action: 'manage'
      },
      {
        name: 'manage-courses',
        description: 'Manage all courses',
        resource: 'course',
        action: 'manage'
      },
      {
        name: 'manage-faculty',
        description: 'Manage faculty members',
        resource: 'faculty',
        action: 'manage'
      },
      {
        name: 'manage-students',
        description: 'Manage students',
        resource: 'student',
        action: 'manage'
      },
      {
        name: 'manage-payments',
        description: 'Manage payments',
        resource: 'payment',
        action: 'manage'
      },
      {
        name: 'manage-events',
        description: 'Manage events',
        resource: 'event',
        action: 'manage'
      },
      {
        name: 'view-attendance-reports',
        description: 'View attendance reports',
        resource: 'attendance',
        action: 'read'
      },
      {
        name: 'view-grade-reports',
        description: 'View grade reports',
        resource: 'grade',
        action: 'read'
      }
    ];

    // Create permissions if they don't exist
    for (const permission of permissionsToCreate) {
      await Permission.findOneAndUpdate(
        { name: permission.name },
        permission,
        { upsert: true, new: true }
      );
    }

    // Fetch all permissions
    const allPermissions = await Permission.find();
    
    // Create permission maps by name for easy lookup
    const permissionMap = {};
    allPermissions.forEach(p => {
      permissionMap[p.name] = p._id;
    });

    // Define roles with their permissions
    const rolesToCreate = [
      {
        name: 'student',
        description: 'Student role with limited access',
        permissions: [
          permissionMap['view-own-profile'],
          permissionMap['edit-own-profile'],
          permissionMap['view-own-attendance'],
          permissionMap['view-own-grades'],
          permissionMap['submit-assignment'],
          permissionMap['register-event']
        ]
      },
      {
        name: 'faculty',
        description: 'Faculty role with teaching access',
        permissions: [
          permissionMap['view-faculty-profile'],
          permissionMap['edit-faculty-profile'],
          permissionMap['mark-attendance'],
          permissionMap['update-attendance'],
          permissionMap['assign-grades'],
          permissionMap['update-grades'],
          permissionMap['create-assignment'],
          permissionMap['view-course-students'],
          permissionMap['view-own-profile'],
          permissionMap['edit-own-profile']
        ]
      },
      {
        name: 'admin',
        description: 'Administrator role with full access except grades and attendance',
        permissions: [
          permissionMap['manage-users'],
          permissionMap['manage-courses'],
          permissionMap['manage-faculty'],
          permissionMap['manage-students'],
          permissionMap['manage-payments'],
          permissionMap['manage-events'],
          permissionMap['view-attendance-reports'],
          permissionMap['view-grade-reports'],
          permissionMap['view-own-profile'],
          permissionMap['edit-own-profile']
        ]
      }
    ];

    // Create roles if they don't exist
    for (const role of rolesToCreate) {
      await Role.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    }

    console.log('Roles and permissions initialized successfully');
  } catch (error) {
    console.error('Error initializing roles and permissions:', error);
  }
};

module.exports = { initializeRolesAndPermissions };
