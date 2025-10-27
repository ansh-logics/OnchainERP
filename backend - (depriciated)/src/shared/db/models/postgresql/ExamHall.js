const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const ExamHall = sequelize.define('ExamHall', {
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
  hallName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  hallCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING(200)
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  facilities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'exam_halls',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['hallCode'], unique: true },
    { fields: ['capacity'] }
  ]
});

module.exports = ExamHall;
