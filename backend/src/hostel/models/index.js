const { sequelize } = require('../../shared/db/database');

// Import hostel models directly from shared postgresql folder
const Hostel = require('../../shared/db/models/postgresql/Hostel');
const HostelRoom = require('../../shared/db/models/postgresql/HostelRoom');
const HostelAllocation = require('../../shared/db/models/postgresql/HostelAllocation');

module.exports = {
  sequelize,
  Hostel,
  HostelRoom,
  HostelAllocation
};