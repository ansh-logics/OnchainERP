const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const LibraryIssue = sequelize.define('LibraryIssue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'library_books',
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATEONLY
  },
  issuedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  returnedTo: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('issued', 'returned', 'overdue', 'lost', 'renewed'),
    defaultValue: 'issued'
  },
  fineAmount: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0
  },
  finePaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fineWaivedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  issueRemarks: {
    type: DataTypes.TEXT
  },
  returnRemarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'library_issues',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['bookId'] },
    { fields: ['studentId'] },
    { fields: ['issueDate'] },
    { fields: ['dueDate'] },
    { fields: ['status'] },
    { fields: ['returnDate'] }
  ]
});

module.exports = LibraryIssue;
