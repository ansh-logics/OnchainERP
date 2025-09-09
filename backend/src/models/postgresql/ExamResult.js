const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ExamResult = sequelize.define('ExamResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'exams',
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
  marksObtained: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING(5)
  },
  gradePoints: {
    type: DataTypes.DECIMAL(3, 2)
  },
  status: {
    type: DataTypes.ENUM('published', 'withheld', 'cancelled', 'under_review'),
    defaultValue: 'published'
  },
  evaluatedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  evaluatedAt: {
    type: DataTypes.DATE
  },
  remarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'exam_results',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['examId'] },
    { fields: ['studentId'] },
    { fields: ['examId', 'studentId'], unique: true },
    { fields: ['status'] }
  ]
});

module.exports = ExamResult;
