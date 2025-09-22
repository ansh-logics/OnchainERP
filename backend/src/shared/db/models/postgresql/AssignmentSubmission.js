const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  assignmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'assignments',
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  submissionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isLateSubmission: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  submissionText: {
    type: DataTypes.TEXT
  },
  marksObtained: {
    type: DataTypes.INTEGER
  },
  feedback: {
    type: DataTypes.TEXT
  },
  gradedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  gradedAt: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('submitted', 'graded', 'returned', 'resubmission_required'),
    defaultValue: 'submitted'
  }
}, {
  tableName: 'assignment_submissions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['assignmentId'] },
    { fields: ['studentId'] },
    { fields: ['assignmentId', 'studentId'], unique: true },
    { fields: ['submissionDate'] },
    { fields: ['status'] }
  ]
});

module.exports = AssignmentSubmission;
