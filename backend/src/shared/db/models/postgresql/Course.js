const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const Course = sequelize.define('Course', {
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
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shortName: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  // Academic details
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  courseType: {
    type: DataTypes.ENUM('Core', 'Elective', 'Laboratory', 'Project', 'Internship'),
    allowNull: false
  },
  
  // Course structure
  theoryHours: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  labHours: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tutorialHours: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Prerequisites
  prerequisites: {
    type: DataTypes.TEXT,
    comment: 'JSON array of prerequisite course IDs'
  },
  
  // Assessment
  hasInternalAssessment: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hasFinalExam: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  internalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 40
  },
  finalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 40
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'courses',
  timestamps: true,
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['departmentId'] },
    { fields: ['code'] },
    { fields: ['semester'] },
    { fields: ['courseType'] }
  ]
});

module.exports = Course;
