const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const Faculty = sequelize.define('Faculty', {
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
  
  // Faculty identification
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  facultyId: {
    type: DataTypes.STRING,
    unique: true
  },
  
  // Professional details
  designation: {
    type: DataTypes.ENUM(
      'Professor', 'Associate Professor', 'Assistant Professor',
      'Lecturer', 'Senior Lecturer', 'Guest Faculty', 'Visiting Faculty'
    ),
    allowNull: false
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: false
  },
  specialization: {
    type: DataTypes.STRING
  },
  experience: {
    type: DataTypes.INTEGER,
    comment: 'Experience in years'
  },
  
  // Employment details
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  employmentType: {
    type: DataTypes.ENUM('Permanent', 'Contract', 'Part-time', 'Guest'),
    allowNull: false
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2)
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
  maritalStatus: {
    type: DataTypes.ENUM('Single', 'Married', 'Divorced', 'Widowed')
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
  emergencyContact: {
    type: DataTypes.STRING
  },
  
  // Address
  addressStreet: {
    type: DataTypes.STRING
  },
  addressCity: {
    type: DataTypes.STRING
  },
  addressState: {
    type: DataTypes.STRING
  },
  addressPincode: {
    type: DataTypes.STRING(6)
  },
  addressCountry: {
    type: DataTypes.STRING,
    defaultValue: 'India'
  },
  
  // Administrative roles
  isHOD: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'faculty',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['collegeId'] },
    { fields: ['departmentId'] },
    { fields: ['employeeId'] },
    { fields: ['facultyId'] },
    { fields: ['designation'] }
  ]
});

module.exports = Faculty;
