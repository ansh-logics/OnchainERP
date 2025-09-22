const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const HostelRoom = sequelize.define('HostelRoom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hostelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hostels',
      key: 'id'
    }
  },
  roomNumber: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roomType: {
    type: DataTypes.ENUM('single', 'double', 'triple', 'dormitory'),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentOccupancy: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  amenities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'maintenance_required'),
    defaultValue: 'good'
  },
  lastMaintenanceDate: {
    type: DataTypes.DATEONLY
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'hostel_rooms',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['hostelId'] },
    { fields: ['hostelId', 'roomNumber'], unique: true },
    { fields: ['roomType'] },
    { fields: ['condition'] }
  ]
});

module.exports = HostelRoom;
