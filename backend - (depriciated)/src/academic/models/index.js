const { sequelize } = require('../../shared/db/database');

// Import academic models directly from shared postgresql folder
const Course = require('../../shared/db/models/postgresql/Course');
const Section = require('../../shared/db/models/postgresql/Section');
const Timetable = require('../../shared/db/models/postgresql/Timetable');
const Classroom = require('../../shared/db/models/postgresql/Classroom');
const Department = require('../../shared/db/models/postgresql/Department');

module.exports = {
  sequelize,
  Course,
  Section,
  Timetable,
  Classroom,
  Department
};