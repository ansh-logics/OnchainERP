const { sequelize } = require('../../shared/db/database');

// Import administration models directly from shared postgresql folder
const College = require('../../shared/db/models/postgresql/College');
const User = require('../../shared/db/models/postgresql/User');

module.exports = {
  sequelize,
  College,
  User
};