const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Timetable = sequelize.define('Timetable', {
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
  sectionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sections',
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
  facultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  classroomId: {
    type: DataTypes.UUID,
    references: {
      model: 'classrooms',
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 7
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  classType: {
    type: DataTypes.ENUM('theory', 'practical', 'tutorial'),
    defaultValue: 'theory'
  },
  effectiveFrom: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  effectiveTo: {
    type: DataTypes.DATEONLY
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'timetable',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['sectionId'] },
    { fields: ['courseId'] },
    { fields: ['facultyId'] },
    { fields: ['dayOfWeek'] },
    { fields: ['period'] },
    { fields: ['academicYear'] },
    { fields: ['semester'] }
  ]
});

module.exports = Timetable;
