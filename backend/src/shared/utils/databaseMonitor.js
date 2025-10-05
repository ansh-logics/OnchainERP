class DatabaseMonitor {
  constructor() {
    this.isMonitoring = false;
    this.sequelize = null; // Will be injected later
    this.connectionStats = {
      totalQueries: 0,
      failedQueries: 0,
      slowQueries: 0,
      lastError: null,
      lastErrorTime: null,
      uptime: Date.now()
    };
  }

  // Initialize with sequelize instance to avoid circular dependency
  initialize(sequelizeInstance) {
    this.sequelize = sequelizeInstance;
    console.log('[DB Monitor] Initialized with Sequelize instance');
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    if (!this.sequelize) {
      console.error('[DB Monitor] Cannot start monitoring: Sequelize instance not initialized. Call initialize() first.');
      return;
    }

    // Additional validation to ensure sequelize is properly initialized
    if (typeof this.sequelize.addHook !== 'function') {
      console.error('[DB Monitor] Invalid Sequelize instance: addHook method not available');
      return;
    }
    
    this.isMonitoring = true;
    console.log('[DB Monitor] Starting database monitoring...');

    // Monitor connection pool
    this.poolMonitor = setInterval(() => {
      try {
        const pool = this.sequelize.connectionManager.pool;
        if (pool) {
          const stats = {
            active: pool.size || 0,
            idle: pool.available || 0,
            waiting: pool.pending || 0,
            total: (pool.size || 0) + (pool.available || 0),
            timestamp: new Date().toISOString()
          };
          
          // Log stats if there are active connections or issues
          if (stats.active > 0 || stats.waiting > 0) {
            console.log(`[DB Monitor] Pool - Active: ${stats.active}, Idle: ${stats.idle}, Waiting: ${stats.waiting}`);
          }
          
          // Alert if pool is exhausted
          if (stats.waiting > 5) {
            console.warn(`[DB Monitor] WARNING: ${stats.waiting} queries waiting for connections!`);
          }
        }
      } catch (error) {
        console.error('[DB Monitor] Pool monitoring error:', error.message);
      }
    }, 10000); // Check every 10 seconds

    // Monitor query performance
    try {
      this.sequelize.addHook('beforeQuery', (options) => {
        options.startTime = Date.now();
        this.connectionStats.totalQueries++;
      });

      this.sequelize.addHook('afterQuery', (options) => {
        if (options.startTime) {
          const duration = Date.now() - options.startTime;
          if (duration > 5000) { // Queries taking more than 5 seconds
            this.connectionStats.slowQueries++;
            console.warn(`[DB Monitor] Slow query detected: ${duration}ms`);
          }
        }
      });

      // Monitor query failures
      this.sequelize.addHook('queryError', (error, options) => {
        this.connectionStats.failedQueries++;
        this.connectionStats.lastError = error.message;
        this.connectionStats.lastErrorTime = new Date().toISOString();
        
        console.error(`[DB Monitor] Query failed: ${error.message}`);
        
        // Special handling for memory errors
        if (error.message.includes('out of shared memory')) {
          console.error('[DB Monitor] CRITICAL: PostgreSQL shared memory exhausted!');
          console.error('[DB Monitor] Consider running: ./optimize-postgres.sh');
          this.handleMemoryError();
        }
      });

      console.log('[DB Monitor] Successfully attached query hooks');
    } catch (error) {
      console.error('[DB Monitor] Failed to attach query hooks:', error.message);
      this.isMonitoring = false;
      return;
    }
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.poolMonitor) {
      clearInterval(this.poolMonitor);
    }
    console.log('[DB Monitor] Database monitoring stopped');
  }

  async handleMemoryError() {
    console.log('[DB Monitor] Attempting to recover from memory error...');
    
    try {
      // Close idle connections
      const pool = this.sequelize.connectionManager.pool;
      if (pool && typeof pool.destroyAllNow === 'function') {
        await pool.destroyAllNow();
        console.log('[DB Monitor] Destroyed idle connections');
      }
      
      // Wait a bit before allowing new connections
      setTimeout(() => {
        console.log('[DB Monitor] Recovery attempt completed');
      }, 5000);
      
    } catch (error) {
      console.error('[DB Monitor] Recovery attempt failed:', error.message);
    }
  }

  getStats() {
    return {
      ...this.connectionStats,
      uptime: Date.now() - this.connectionStats.uptime,
      isMonitoring: this.isMonitoring
    };
  }

  async healthCheck() {
    if (!this.sequelize) {
      return {
        status: 'unhealthy',
        error: 'Sequelize instance not initialized',
        timestamp: new Date().toISOString()
      };
    }
    
    try {
      const startTime = Date.now();
      await this.sequelize.authenticate();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Utility method to force garbage collection if available
  forceGC() {
    if (global.gc) {
      console.log('[DB Monitor] Forcing garbage collection...');
      global.gc();
    } else {
      console.log('[DB Monitor] Garbage collection not available (start with --expose-gc)');
    }
  }
}

// Singleton instance
const dbMonitor = new DatabaseMonitor();

module.exports = dbMonitor;
