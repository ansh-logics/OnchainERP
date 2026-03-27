/**
 * Mongoose models: system logs and unstructured data only.
 * Domain entities live under ../postgresql (Sequelize).
 */
const FileUpload = require('./FileUpload');
const SystemLog = require('./SystemLog');
const Analytics = require('./Analytics');
const Notification = require('./Notification');
const Configuration = require('./Configuration');

module.exports = {
  FileUpload,
  SystemLog,
  Analytics,
  Notification,
  Configuration
};
