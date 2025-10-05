const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const Fee = sequelize.define('Fee', {
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
  collegeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'colleges',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalFees: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  paidAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  remainingAmount: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.totalFees - this.paidAmount;
    }
  },
  feeStatus: {
    type: DataTypes.ENUM('Paid', 'Partial', 'Unpaid'),
    defaultValue: 'Unpaid'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'fees',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['collegeId'] },
    { fields: ['academicYear'] },
    { fields: ['semester'] },
    { fields: ['feeStatus'] }
  ],
  hooks: {
    beforeSave: async (fee, options) => {
      // Automatically calculate fee status based on paid amount
      const totalFees = parseFloat(fee.totalFees);
      const paidAmount = parseFloat(fee.paidAmount);
      
      if (paidAmount >= totalFees) {
        fee.feeStatus = 'Paid';
      } else if (paidAmount > 0) {
        fee.feeStatus = 'Partial';
      } else {
        fee.feeStatus = 'Unpaid';
      }
    }
  }
});

module.exports = Fee;
