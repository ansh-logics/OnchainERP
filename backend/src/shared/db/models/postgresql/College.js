const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

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
    allowNull: true  // Optional - some colleges are autonomous
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
    allowNull: true,  // Optional
    validate: {
      isUrl: true
    }
  },
  fax: {
    type: DataTypes.STRING,
    allowNull: true  // Optional
  },
  
  // Branding & Visual Identity
  logo: {
    type: DataTypes.STRING,  // URL or file path
    allowNull: true
  },
  letterhead: {
    type: DataTypes.STRING,  // URL or file path
    allowNull: true
  },
  primaryColor: {
    type: DataTypes.STRING(7),  // Hex color code
    defaultValue: '#2563eb',
    validate: {
      is: /^#[0-9A-Fa-f]{6}$/
    }
  },
  secondaryColor: {
    type: DataTypes.STRING(7),  // Hex color code
    defaultValue: '#4b5563',
    validate: {
      is: /^#[0-9A-Fa-f]{6}$/
    }
  },
  accentColor: {
    type: DataTypes.STRING(7),  // Hex color code
    defaultValue: '#059669',
    validate: {
      is: /^#[0-9A-Fa-f]{6}$/
    }
  },
  backgroundColor: {
    type: DataTypes.STRING(7),  // Hex color code
    defaultValue: '#f9fafb',
    validate: {
      is: /^#[0-9A-Fa-f]{6}$/
    }
  },
  motto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vision: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mission: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Infrastructure (Optional - not required for basic operations)
  campusArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Campus area in acres'
  },
  totalBuildings: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalClassrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalLaboratories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // Library details (Optional)
  libraryTotalBooks: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  libraryDigitalResources: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  libraryArea: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Library area in sq ft'
  },
  
  // Admin reference
  adminId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Accreditation (Optional - can be added later)
  naacGrade: {
    type: DataTypes.ENUM('A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Accredited'),
    allowNull: true
  },
  naacValidUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nbaAccredited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true
  },
  nbaValidUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Profile completion tracking
  profileCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indicates if college profile setup is complete'
  },
  setupStep: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Current setup step (1-5): 1=Basic Info, 2=Branding, 3=Infrastructure, 4=Accreditation, 5=Complete'
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
    { fields: ['adminId'] },
    { fields: ['profileCompleted'] },
    { fields: ['setupStep'] }
  ]
});

// Instance methods
College.prototype.isSetupComplete = function() {
  return this.profileCompleted && this.setupStep >= 5;
};

College.prototype.getRequiredFields = function() {
  return [
    'name', 'shortName', 'establishedYear', 'collegeType', 'registrationNumber',
    'addressStreet', 'addressCity', 'addressState', 'addressPincode', 'addressCountry',
    'phone', 'email', 'adminId'
  ];
};

College.prototype.validateRequiredFields = function() {
  const required = this.getRequiredFields();
  const missing = [];
  
  required.forEach(field => {
    if (!this[field] || this[field] === '') {
      missing.push(field);
    }
  });
  
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};

module.exports = College;
