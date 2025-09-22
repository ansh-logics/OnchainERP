const { sequelize } = require('../../shared/db/database');

// Import the Student model directly from the shared postgresql folder
const Student = require('../../shared/db/models/postgresql/Student');

module.exports = {
  sequelize,
  Student
};