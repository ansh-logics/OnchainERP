// Main Models Index - Hybrid Database Architecture
// PostgreSQL models for structured data
// MongoDB models for unstructured data

// PostgreSQL Models (Structured Data)
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
  sequelize
} = PostgreSQLModels;

// MongoDB Models (Unstructured Data)
const MongoDBModels = require('./mongodb');
const {
  FileUpload,
  SystemLog,
  Analytics,
  Notification,
  Configuration
} = MongoDBModels;

// Export all models with clear naming
module.exports = {
  // PostgreSQL Models
  User,
  College,
  Department,
  Student,
  Faculty,
  Course,
  Section,
  Transaction,
  sequelize,
  
  // MongoDB Models
  FileUpload,
  SystemLog,
  Analytics,
  Notification,
  Configuration,
  
  // Grouped exports for convenience
  PostgreSQL: PostgreSQLModels,
  MongoDB: MongoDBModels
};
