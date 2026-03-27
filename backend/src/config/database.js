const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');

// Default matches docker-compose (postgres service) and .env.example
const DEFAULT_POSTGRES = {
  database: 'onchain_erp',
  user: 'postgres',
  password: 'postgres123',
  host: 'localhost',
  port: 5432
};

// Default matches docker-compose (mongodb MONGO_INITDB_DATABASE) and .env.example
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/onchain_erp';

// PostgreSQL — structured domain data (Sequelize)
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || DEFAULT_POSTGRES.database,
  process.env.POSTGRES_USER || DEFAULT_POSTGRES.user,
  process.env.POSTGRES_PASSWORD || DEFAULT_POSTGRES.password,
  {
    host: process.env.POSTGRES_HOST || DEFAULT_POSTGRES.host,
    port: Number(process.env.POSTGRES_PORT || DEFAULT_POSTGRES.port),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// MongoDB — system logs and unstructured documents (Mongoose)
const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('PostgreSQL models synchronized.');
    }
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error);
    process.exit(1);
  }
};

const connectDatabases = async () => {
  await connectPostgreSQL();
  await connectMongoDB();
};

module.exports = {
  sequelize,
  connectDatabases,
  connectMongoDB,
  connectPostgreSQL
};
