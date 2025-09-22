const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const Classroom = sequelize.define('Classroom', {
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
  roomNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  building: {
    type: DataTypes.STRING(100)
  },
  floor: {
    type: DataTypes.INTEGER
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roomType: {
    type: DataTypes.ENUM('lecture_hall', 'laboratory', 'seminar_room', 'auditorium', 'conference_room'),
    allowNull: false
  },
  facilities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  hasProjector: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasAC: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasSmartBoard: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'classrooms',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['collegeId', 'roomNumber'], unique: true },
    { fields: ['roomType'] },
    { fields: ['capacity'] }
  ]
});

module.exports = Classroom;
