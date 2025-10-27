const { sequelize } = require('../../shared/db/database');

// Import examination models directly from shared postgresql folder
const Exam = require('../../shared/db/models/postgresql/Exam');
const ExamHall = require('../../shared/db/models/postgresql/ExamHall');
const ExamResult = require('../../shared/db/models/postgresql/ExamResult');

module.exports = {
  sequelize,
  Exam,
  ExamHall,
  ExamResult
};