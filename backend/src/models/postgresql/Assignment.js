const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  facultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  instructions: {
    type: DataTypes.TEXT
  },
  assignmentType: {
    type: DataTypes.ENUM('individual', 'group', 'lab', 'project', 'quiz', 'presentation'),
    allowNull: false
  },
  maxMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assignedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  submissionStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  submissionEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  allowLateSubmission: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lateSubmissionPenalty: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  allowedFileTypes: {
    type: DataTypes.JSON,
    defaultValue: ['pdf', 'doc', 'docx']
  },
  maxFileSize: {
    type: DataTypes.INTEGER,
    defaultValue: 10485760 // 10MB in bytes
  },
  maxFiles: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'assignments',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['courseId'] },
    { fields: ['facultyId'] },
    { fields: ['assignmentType'] },
    { fields: ['dueDate'] },
    { fields: ['status'] }
  ]
});

module.exports = Assignment;
