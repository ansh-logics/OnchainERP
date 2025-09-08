const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Section = sequelize.define('Section', {
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
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  batch: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  
  // Section configuration
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  currentStrength: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Class teacher
  classTeacherId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sections',
  timestamps: true,
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['departmentId'] },
    { fields: ['code'] },
    { fields: ['batch'] },
    { fields: ['semester'] },
    { fields: ['classTeacherId'] }
  ]
});

module.exports = Section;
