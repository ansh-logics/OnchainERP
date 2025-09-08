const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const College = sequelize.define('College', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  shortName: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 20]
    }
  },
  establishedYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1800,
      max: new Date().getFullYear()
    }
  },
  affiliatedUniversity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  collegeType: {
    type: DataTypes.ENUM('Government', 'Private', 'Autonomous', 'Deemed'),
    allowNull: false
  },
  registrationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  
  // Address fields
  addressStreet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressCity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressState: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressPincode: {
    type: DataTypes.STRING(6),
    allowNull: false,
    validate: {
      is: /^\d{6}$/
    }
  },
  addressCountry: {
    type: DataTypes.STRING,
    defaultValue: 'India'
  },
  
  // Contact fields
  phone: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      is: /^\d{10}$/
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  website: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  fax: {
    type: DataTypes.STRING
  },
  
  // Infrastructure
  campusArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Campus area in acres'
  },
  totalBuildings: {
    type: DataTypes.INTEGER
  },
  totalClassrooms: {
    type: DataTypes.INTEGER
  },
  totalLaboratories: {
    type: DataTypes.INTEGER
  },
  
  // Library details
  libraryTotalBooks: {
    type: DataTypes.INTEGER
  },
  libraryDigitalResources: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  libraryArea: {
    type: DataTypes.INTEGER,
    comment: 'Library area in sq ft'
  },
  
  // Admin reference
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Accreditation
  naacGrade: {
    type: DataTypes.ENUM('A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Accredited')
  },
  naacValidUntil: {
    type: DataTypes.DATE
  },
  nbaAccredited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  nbaValidUntil: {
    type: DataTypes.DATE
  },
  
  // Academic year settings
  academicStartMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
    validate: {
      min: 1,
      max: 12
    }
  },
  academicEndMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 6,
    validate: {
      min: 1,
      max: 12
    }
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'colleges',
  timestamps: true,
  indexes: [
    { fields: ['shortName'] },
    { fields: ['addressCity', 'addressState'] },
    { fields: ['collegeType'] },
    { fields: ['adminId'] }
  ]
});

module.exports = College;
