const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM('student', 'faculty', 'admin', 'cashier', 'super_admin'),
    allowNull: false
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id'
    }
  },
  collegeId: {
    type: DataTypes.UUID,
    allowNull: true, // null means applies to all colleges
    references: {
      model: 'colleges',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  grantedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  grantedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'role_permissions',
  timestamps: true,
  indexes: [
    { fields: ['role'] },
    { fields: ['permissionId'] },
    { fields: ['collegeId'] },
    { unique: true, fields: ['role', 'permissionId', 'collegeId'] }
  ]
});

module.exports = RolePermission;
