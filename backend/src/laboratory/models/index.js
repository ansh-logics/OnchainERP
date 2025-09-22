const { sequelize } = require('../../shared/db/database');

// Import laboratory models directly from shared postgresql folder
const Lab = require('../../shared/db/models/postgresql/Lab');

module.exports = {
  sequelize,
  Lab
};