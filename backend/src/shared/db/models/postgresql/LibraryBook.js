const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database');

const LibraryBook = sequelize.define('LibraryBook', {
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
  isbn: {
    type: DataTypes.STRING(20),
    unique: true
  },
  accessionNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING(200)
  },
  edition: {
    type: DataTypes.STRING(50)
  },
  publicationYear: {
    type: DataTypes.INTEGER
  },
  category: {
    type: DataTypes.STRING(100)
  },
  subject: {
    type: DataTypes.STRING(100)
  },
  language: {
    type: DataTypes.STRING(50),
    defaultValue: 'English'
  },
  totalCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  availableCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  location: {
    type: DataTypes.STRING(100)
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    defaultValue: 'good'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'library_books',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['collegeId'] },
    { fields: ['isbn'] },
    { fields: ['accessionNumber'], unique: true },
    { fields: ['title'] },
    { fields: ['author'] },
    { fields: ['category'] },
    { fields: ['subject'] }
  ]
});


module.exports = LibraryBook;
