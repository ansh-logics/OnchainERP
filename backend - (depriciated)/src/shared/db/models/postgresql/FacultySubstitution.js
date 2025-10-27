const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const FacultySubstitution = sequelize.define('FacultySubstitution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  absentFacultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  substituteFacultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  sectionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sections',
      key: 'id'
    }
  },
  timetableId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'timetable',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'confirmed', 'rejected', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  reason: {
    type: DataTypes.TEXT,
    comment: 'Reason for substitution (e.g., holiday, sick leave, personal work)'
  },
  remarks: {
    type: DataTypes.TEXT,
    comment: 'Additional remarks from substitute faculty or admin'
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE
  },
  confirmedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  confirmedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'faculty_substitutions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['absentFacultyId'] },
    { fields: ['substituteFacultyId'] },
    { fields: ['courseId'] },
    { fields: ['date'] },
    { fields: ['status'] },
    { fields: ['timetableId'] },
    {
      fields: ['date', 'timetableId'],
      unique: true,
      name: 'unique_substitution_per_timetable_date'
    }
  ]
});

module.exports = FacultySubstitution;
