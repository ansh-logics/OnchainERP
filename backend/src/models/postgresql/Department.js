const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Department = sequelize.define('Department', {
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
    type: DataTypes.STRING,
    allowNull: false
  },
  shortName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  hodId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Section configuration
  studentsPerSection: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  totalSections: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  
  // Intake capacity
  totalIntake: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentStrength: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'departments',
  timestamps: true,
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['code'] },
    { fields: ['hodId'] }
  ]
});

module.exports = Department;
