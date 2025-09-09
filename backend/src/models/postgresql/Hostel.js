const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Hostel = sequelize.define('Hostel', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  hostelCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  hostelType: {
    type: DataTypes.ENUM('boys', 'girls', 'co_ed'),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200)
  },
  totalFloors: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalRooms: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentOccupancy: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  facilities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  wardenId: {
    type: DataTypes.UUID,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  monthlyFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'hostels',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['hostelCode'], unique: true },
    { fields: ['hostelType'] },
    { fields: ['gender'] },
    { fields: ['wardenId'] }
  ]
});

module.exports = Hostel;
