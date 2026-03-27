// Hybrid database layout:
// - PostgreSQL (Sequelize): structured domain entities
// - MongoDB (Mongoose): system logs + unstructured / flexible documents only

const PostgreSQLModels = require('./postgresql');
const {
  User,
  College,
  Department,
  Student,
  Faculty,
  Course,
  Section,
  Transaction,
  Lab,
  sequelize
} = PostgreSQLModels;

const MongoUnstructuredModels = require('./mongodb');
const {
  FileUpload,
  SystemLog,
  Analytics,
  Notification,
  Configuration
} = MongoUnstructuredModels;

module.exports = {
  User,
  College,
  Department,
  Student,
  Faculty,
  Course,
  Section,
  Transaction,
  Lab,
  sequelize,

  FileUpload,
  SystemLog,
  Analytics,
  Notification,
  Configuration,

  PostgreSQL: PostgreSQLModels,
  MongoUnstructured: MongoUnstructuredModels
};
