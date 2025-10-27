const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const PasswordResetRequest = sequelize.define('PasswordResetRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 500]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewNote: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  oldPasswordHash: {
    type: DataTypes.STRING,
    allowNull: true // Store hash of old password for audit
  },
  newPasswordHash: {
    type: DataTypes.STRING,
    allowNull: true // Store hash of new password
  },
  tempPassword: {
    type: DataTypes.STRING,
    allowNull: true // Temporary password shown to admin
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  }
}, {
  tableName: 'password_reset_requests',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['requestedAt'] },
    { fields: ['reviewedBy'] },
    { fields: ['expiresAt'] }
  ]
});

module.exports = PasswordResetRequest;
