const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const ConnectionPoolMonitor = require('../utils/connectionPoolMonitor');

// Initialize connection pool monitor
let poolMonitor = null;

// PostgreSQL Connection with simplified configuration
const sequelize = new Sequelize({
  database: process.env.POSTGRES_DB || 'onchain_erp',
  username: process.env.POSTGRES_USER || 'anshbhatt',
  password: process.env.POSTGRES_PASSWORD || '9013',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Enhanced pool configuration with aggressive connection management
  pool: {
    max: 6,                     // Reduced max connections to prevent exhaustion
    min: 1,                     // Minimum number of connections to maintain
    acquire: 60000,             // Maximum time (ms) to try getting connection before throwing error
    idle: 10000,                // Reduced idle time - close connections faster
    evict: 1000,                // Time interval (ms) to run eviction to check for idle connections
    handleDisconnects: true,    // Automatically handle connection disconnects
    
    // Additional connection management
    acquireTimeoutMillis: 60000, // Total time to wait for connection
    createTimeoutMillis: 30000,  // Time to wait for new connection creation
    destroyTimeoutMillis: 5000,  // Time to wait for connection destruction
    reapIntervalMillis: 1000     // How often to check for expired connections
  },
  
  // Disable SSL for local development
  dialectOptions: {
    ssl: false,
    statement_timeout: 30000, // 30 second timeout for queries
    idle_in_transaction_session_timeout: 30000 // 30 second timeout for idle transactions
  }
});

// MongoDB Connection (Silent Mode for Migration)
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/onchain-erp", 
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    }
    
    // Import MongoDB models to register schemas
    require('./models/mongodb');
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit in production - fall back to Sequelize
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Falling back to PostgreSQL only');
      return null;
    }
    process.exit(1);
  }
};

// PostgreSQL Connection Test with sync completely disabled
const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');

    // Test connection with simple query
    try {
      const [results] = await sequelize.query('SELECT COUNT(*) as user_count FROM users');
      console.log(`📊 Database contains ${results[0].user_count} users`);
    } catch (queryError) {
      console.log('📊 Database connected but users table not found (this is normal for fresh installations)');
    }

    // COMPLETELY DISABLE SYNC - Database already exists with proper structure
    console.log('✅ Using existing database structure (sync disabled)');
    
    // Only log this warning if you absolutely need sync
    if (process.env.DB_SYNC === 'true') {
      console.warn('⚠️  DB_SYNC is enabled - this may cause shared memory issues');
      console.log('🔄 Starting safe model synchronization...');
      
      await sequelize.sync({ 
        force: false,
        alter: false,
        logging: false // Disable logging to reduce memory usage
      });
      
      console.log('✅ Models synchronized safely');
    } else {
      console.log('🚫 Database sync skipped - using existing structure');
    }

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    
    // Provide specific guidance for shared memory errors
    if (error.original?.code === '53200' || error.message.includes('out of shared memory')) {
      console.error('💡 PostgreSQL shared memory exhausted. Solutions:');
      console.error('   1. Restart PostgreSQL: brew services restart postgresql');
      console.error('   2. Skip model synchronization (recommended)');
      console.error('   3. Increase shared_buffers in postgresql.conf');
    }
    
    return false;
  }
};

// Test connection function for diagnostics
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');
    
    // Test a simple query to verify table access
    try {
      const [results] = await sequelize.query('SELECT COUNT(*) as user_count FROM users');
      console.log(`📊 Database contains ${results[0].user_count} users`);
    } catch (queryError) {
      console.log('📊 Database connected but users table not found (this is normal for fresh installations)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    
    // Provide specific guidance based on error
    if (error.original?.code === '28P01') {
      console.error('💡 Password authentication failed. Check your password in the database configuration.');
    } else if (error.message.includes('validate is not a function')) {
      console.error('💡 Sequelize version issue. Try: npm install sequelize@^6.35.0');
    } else if (error.original?.code === 'ECONNREFUSED') {
      console.error('💡 Connection refused. Make sure PostgreSQL is running: brew services start postgresql');
    } else if (error.original?.code === '3D000') {
      console.error('💡 Database "onchain_erp" does not exist. Create it with: createdb onchain_erp');
    }
    
    return false;
  }
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query('SELECT version();');
    console.log('[DB] PostgreSQL health check passed:', results[0].version);
    return { postgres: true };
  } catch (error) {
    console.error('[DB] PostgreSQL health check failed:', error.message);
    return { postgres: false, error: error.message };
  }
};

// Monitor database connections
const monitorConnections = () => {
  setInterval(async () => {
    try {
      const pool = sequelize.connectionManager.pool;
      if (pool) {
        console.log(`[DB] Connection Pool Status - Active: ${pool.size}, Idle: ${pool.available}, Waiting: ${pool.pending}`);
      }
    } catch (error) {
      console.error('[DB] Connection monitoring error:', error.message);
    }
  }, 30000); // Check every 30 seconds
};

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('[DB] Initiating graceful database shutdown...');
  try {
    // Stop connection pool monitoring
    if (poolMonitor) {
      poolMonitor.stopMonitoring();
    }
    
    await sequelize.close();
    await mongoose.connection.close();
    console.log('[DB] Database connections closed successfully');
  } catch (error) {
    console.error('[DB] Error during graceful shutdown:', error.message);
  }
};

// Initialize both databases
const connectDatabases = async () => {
  await connectPostgreSQL();
  await connectMongoDB();
  
  // Initialize connection pool monitoring
  console.log('[DB] Initializing connection pool monitoring...');
  try {
    poolMonitor = new ConnectionPoolMonitor(sequelize);
    poolMonitor.startMonitoring(5000); // Check every 5 seconds
    console.log('[DB] Connection pool monitoring started successfully');
  } catch (error) {
    console.error('[DB] Failed to start connection pool monitoring:', error.message);
  }
  
  // Initialize and start enhanced database monitoring after successful connection
  console.log('[DB] Initializing database monitoring...');
  try {
    const dbMonitor = require('../utils/databaseMonitor');
    dbMonitor.initialize(sequelize); // Pass the sequelize instance
    dbMonitor.startMonitoring();
    console.log('[DB] Database monitoring started successfully');
  } catch (error) {
    console.error('[DB] Failed to start database monitoring:', error.message);
  }
  
  // Start connection monitoring in development
  if (process.env.NODE_ENV === 'development') {
    monitorConnections();
  }
  
  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    dbMonitor.stopMonitoring();
    await gracefulShutdown();
  });
  process.on('SIGINT', async () => {
    dbMonitor.stopMonitoring();
    await gracefulShutdown();
  });
};

// Get connection pool health status
const getPoolHealth = () => {
  if (!poolMonitor) {
    return { status: 'not_initialized', message: 'Pool monitor not initialized' };
  }
  return poolMonitor.getHealthStatus();
};

// Force cleanup of pool connections (emergency use only)
const forcePoolCleanup = async () => {
  if (!poolMonitor) {
    throw new Error('Pool monitor not initialized');
  }
  await poolMonitor.forceCleanup();
};

// Clean up database connections (remove idle/long-running connections)
const cleanupDatabaseConnections = async () => {
  try {
    console.log('[DB] Starting connection cleanup...');
    
    // Kill idle connections older than 10 minutes
    const [idleResults] = await sequelize.query(`
      SELECT 
        pg_terminate_backend(pid) as terminated,
        usename,
        application_name,
        state
      FROM pg_stat_activity 
      WHERE datname = current_database()
        AND state = 'idle'
        AND now() - state_change > interval '10 minutes'
        AND pid != pg_backend_pid()
    `);
    
    // Kill queries running longer than 5 minutes
    const [longResults] = await sequelize.query(`
      SELECT 
        pg_terminate_backend(pid) as terminated,
        usename,
        now() - query_start as duration
      FROM pg_stat_activity 
      WHERE datname = current_database()
        AND state != 'idle'
        AND now() - query_start > interval '5 minutes'
        AND pid != pg_backend_pid()
    `);
    
    console.log(`[DB] Cleanup completed: ${idleResults.length} idle, ${longResults.length} long-running connections terminated`);
    return { idle: idleResults.length, longRunning: longResults.length };
    
  } catch (error) {
    console.error('[DB] Connection cleanup failed:', error.message);
    return { error: error.message };
  }
};

module.exports = {
  sequelize,
  connectDatabases,
  connectMongoDB,
  connectPostgreSQL,
  testConnection,
  checkDatabaseHealth,
  getPoolHealth,
  forcePoolCleanup,
  cleanupDatabaseConnections,
  gracefulShutdown
};
