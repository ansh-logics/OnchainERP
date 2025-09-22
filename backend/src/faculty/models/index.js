const { sequelize } = require('../../shared/db/database');

// Import faculty models directly from shared postgresql folder
const Faculty = require('../../shared/db/models/postgresql/Faculty');
const Assignment = require('../../shared/db/models/postgresql/Assignment');
const AssignmentSubmission = require('../../shared/db/models/postgresql/AssignmentSubmission');

module.exports = {
  sequelize,
  Faculty,
  Assignment,
  AssignmentSubmission
};