const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
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
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  sectionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'sections',
      key: 'id'
    }
  },
  
  // Student identification
  rollNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  enrollmentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  studentId: {
    type: DataTypes.STRING,
    unique: true
  },
  
  // Academic details
  batch: {
    type: DataTypes.STRING,
    allowNull: false
  },
  program: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admissionYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentSemester: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  
  // Personal details
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  },
  category: {
    type: DataTypes.ENUM('General', 'OBC', 'SC', 'ST', 'EWS'),
    allowNull: false
  },
  religion: {
    type: DataTypes.STRING
  },
  nationality: {
    type: DataTypes.STRING,
    defaultValue: 'Indian'
  },
  
  // Contact details
  personalEmail: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  personalPhone: {
    type: DataTypes.STRING
  },
  
  // Address
  permanentAddressStreet: {
    type: DataTypes.STRING
  },
  permanentAddressCity: {
    type: DataTypes.STRING
  },
  permanentAddressState: {
    type: DataTypes.STRING
  },
  permanentAddressPincode: {
    type: DataTypes.STRING(6)
  },
  permanentAddressCountry: {
    type: DataTypes.STRING,
    defaultValue: 'India'
  },
  
  currentAddressStreet: {
    type: DataTypes.STRING
  },
  currentAddressCity: {
    type: DataTypes.STRING
  },
  currentAddressState: {
    type: DataTypes.STRING
  },
  currentAddressPincode: {
    type: DataTypes.STRING(6)
  },
  currentAddressCountry: {
    type: DataTypes.STRING,
    defaultValue: 'India'
  },
  
  // Guardian details
  guardianName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guardianRelation: {
    type: DataTypes.ENUM('Father', 'Mother', 'Guardian', 'Other'),
    allowNull: false
  },
  guardianPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guardianEmail: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  guardianOccupation: {
    type: DataTypes.STRING
  },
  
  // Academic performance
  cgpa: {
    type: DataTypes.DECIMAL(3, 2),
    validate: {
      min: 0,
      max: 10
    }
  },
  
  // Status
  admissionStatus: {
    type: DataTypes.ENUM('applied', 'approved', 'enrolled', 'graduated', 'dropped', 'suspended'),
    defaultValue: 'applied'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'students',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['collegeId'] },
    { fields: ['departmentId'] },
    { fields: ['sectionId'] },
    { fields: ['rollNumber'] },
    { fields: ['enrollmentNumber'] },
    { fields: ['batch'] },
    { fields: ['admissionStatus'] }
  ]
});

module.exports = Student;
