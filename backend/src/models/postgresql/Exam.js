const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  collegeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'colleges',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  examName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  examType: {
    type: DataTypes.ENUM('internal', 'semester', 'supplementary', 'final', 'practical'),
    allowNull: false
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  examHallId: {
    type: DataTypes.UUID,
    references: {
      model: 'exam_halls',
      key: 'id'
    }
  },
  invigilatorId: {
    type: DataTypes.UUID,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  instructions: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'),
    defaultValue: 'scheduled'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'exams',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['courseId'] },
    { fields: ['examType'] },
    { fields: ['examDate'] },
    { fields: ['status'] },
    { fields: ['examHallId'] }
  ]
});

module.exports = Exam;
