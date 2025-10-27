const { sequelize } = require('../db/database');

/**
 * Middleware to handle database connection issues gracefully
 */
const databaseErrorHandler = (err, req, res, next) => {
  // Handle PostgreSQL specific errors
  if (err.name === 'SequelizeDatabaseError') {
    console.error('[DB] Database error:', err.message);
    
    // Handle specific error types
    if (err.message.includes('out of shared memory')) {
      console.error('[DB] PostgreSQL shared memory exhausted - connection pool may need adjustment');
      return res.status(503).json({
        success: false,
        error: 'Database temporarily unavailable',
        message: 'The system is experiencing high load. Please try again in a moment.',
        code: 'DB_MEMORY_ERROR'
      });
    }
    
    if (err.message.includes('connection terminated') || 
        err.message.includes('Connection lost') ||
        err.message.includes('ECONNRESET')) {
      console.error('[DB] Database connection lost - attempting to reconnect');
      return res.status(503).json({
        success: false,
        error: 'Database connection lost',
        message: 'Connection to database was lost. Please try again.',
        code: 'DB_CONNECTION_ERROR'
      });
    }
    
    if (err.message.includes('timeout')) {
      console.error('[DB] Database query timeout');
      return res.status(504).json({
        success: false,
        error: 'Database query timeout',
        message: 'The request took too long to process. Please try again.',
        code: 'DB_TIMEOUT_ERROR'
      });
    }
    
    // Generic database error
    return res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'An error occurred while processing your request.',
      code: 'DB_GENERIC_ERROR'
    });
  }
  
  // Handle Sequelize connection errors
  if (err.name === 'SequelizeConnectionError' || 
      err.name === 'SequelizeConnectionRefusedError' ||
      err.name === 'SequelizeHostNotFoundError' ||
      err.name === 'SequelizeHostNotReachableError' ||
      err.name === 'SequelizeInvalidConnectionError' ||
      err.name === 'SequelizeConnectionTimedOutError') {
    
    console.error('[DB] Connection error:', err.name, err.message);
    return res.status(503).json({
      success: false,
      error: 'Database connection error',
      message: 'Unable to connect to the database. Please try again later.',
      code: 'DB_CONNECTION_FAILED'
    });
  }
  
  // Pass to next error handler if not a database error
  next(err);
};

/**
 * Middleware to check database connection before processing requests
 */
const checkDatabaseConnection = async (req, res, next) => {
  try {
    // Skip database check for health endpoints
    if (req.path === '/health' || req.path === '/api/health') {
      return next();
    }
    
    // Quick connection check
    await sequelize.authenticate();
    next();
  } catch (error) {
    console.error('[DB] Database connection check failed:', error.message);
    
    // Handle the error using the database error handler
    databaseErrorHandler(error, req, res, next);
  }
};

module.exports = {
  databaseErrorHandler,
  checkDatabaseConnection
};
