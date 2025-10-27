const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const Attendance = sequelize.define('Attendance', {
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
  facultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  attendanceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false
  },
  classType: {
    type: DataTypes.ENUM('theory', 'practical', 'tutorial'),
    defaultValue: 'theory'
  },
  topic: {
    type: DataTypes.STRING(200)
  },
  markedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  markedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  modifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  modifiedAt: {
    type: DataTypes.DATE
  },
  modificationReason: {
    type: DataTypes.STRING(200)
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['studentId'] },
    { fields: ['courseId'] },
    { fields: ['facultyId'] },
    { fields: ['attendanceDate'] },
    { fields: ['studentId', 'courseId', 'attendanceDate', 'period'], unique: true },
    { fields: ['status'] }
  ]
});

module.exports = Attendance;
