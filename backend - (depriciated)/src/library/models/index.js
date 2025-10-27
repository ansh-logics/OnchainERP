const { sequelize } = require('../../shared/db/database');

// Import library models directly from shared postgresql folder
const LibraryBook = require('../../shared/db/models/postgresql/LibraryBook');
const LibraryIssue = require('../../shared/db/models/postgresql/LibraryIssue');

module.exports = {
  sequelize,
  LibraryBook,
  LibraryIssue
};