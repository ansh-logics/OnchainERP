const { sequelize } = require('../../shared/db/database');

// Import fees models directly from shared postgresql folder
const Transaction = require('../../shared/db/models/postgresql/Transaction');

module.exports = {
  sequelize,
  Transaction
};