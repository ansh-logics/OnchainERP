const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const CourseEnrollment = sequelize.define('CourseEnrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
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
  sectionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'sections',
      key: 'id'
    }
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped', 'failed'),
    defaultValue: 'active'
  },
  enrollmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  gradePoints: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  }
}, {
  tableName: 'StudentCourses',  // Use existing junction table name
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['courseId'] },
    { fields: ['status'] },
    { fields: ['semester'] },
    { fields: ['academicYear'] },
    { unique: true, fields: ['studentId', 'courseId', 'semester', 'academicYear'] }
  ]
});

module.exports = CourseEnrollment;


