const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const HostelAllocation = sequelize.define('HostelAllocation', {
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
  hostelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hostels',
      key: 'id'
    }
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hostel_rooms',
      key: 'id'
    }
  },
  allocationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  checkInDate: {
    type: DataTypes.DATEONLY
  },
  checkOutDate: {
    type: DataTypes.DATEONLY
  },
  academicYear: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('allocated', 'checked_in', 'checked_out', 'cancelled', 'transferred'),
    defaultValue: 'allocated'
  },
  monthlyFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'hostel_allocations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['studentId'] },
    { fields: ['hostelId'] },
    { fields: ['roomId'] },
    { fields: ['academicYear'] },
    { fields: ['status'] },
    { fields: ['studentId', 'academicYear'], unique: true }
  ]
});

module.exports = HostelAllocation;
