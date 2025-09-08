const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Transaction = sequelize.define('Transaction', {
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
  
  // Transaction type
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  
  // Category
  category: {
    type: DataTypes.ENUM(
      // Income categories
      'tuition_fee', 'lab_fee', 'library_fee', 'examination_fee',
      'admission_fee', 'hostel_fee', 'transport_fee', 'activity_fee',
      'late_fee', 'fine', 'other_income',
      
      // Expense categories
      'salary', 'utilities', 'maintenance', 'equipment', 'supplies',
      'rent', 'insurance', 'marketing', 'travel', 'professional_fees',
      'software_licenses', 'training', 'other_expense'
    ),
    allowNull: false
  },
  
  // Amount in paisa for precision
  amount: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  
  description: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  
  // Student reference for fee payments
  studentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  
  // Payment details
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'upi', 'cheque', 'dd', 'online'),
    allowNull: false
  },
  
  status: {
    type: DataTypes.ENUM('paid', 'pending', 'overdue', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  
  dueDate: {
    type: DataTypes.DATE
  },
  
  paidDate: {
    type: DataTypes.DATE
  },
  
  referenceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  
  // Academic details
  academicYear: {
    type: DataTypes.STRING
  },
  
  semester: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10
    }
  },
  
  // Processing user
  processedById: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['studentId'] },
    { fields: ['status'] },
    { fields: ['referenceNumber'] },
    { fields: ['paidDate'] },
    { fields: ['academicYear'] }
  ]
});

module.exports = Transaction;
