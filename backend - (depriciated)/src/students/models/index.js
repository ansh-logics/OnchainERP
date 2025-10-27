const { sequelize } = require('../../shared/db/database');

// Import student models directly from shared postgresql folder
const Student = require('../../shared/db/models/postgresql/Student');
const Attendance = require('../../shared/db/models/postgresql/Attendance');

module.exports = {
  sequelize,
  Student,
  Attendance
};