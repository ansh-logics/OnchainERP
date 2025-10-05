/**
 * Connection Pool Monitor for PostgreSQL
 * Monitors connection pool health and prevents exhaustion
 */

class ConnectionPoolMonitor {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.isMonitoring = false;
    this.monitorInterval = null;
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      poolExhaustedEvents: 0,
      lastPoolExhaustion: null,
      healthStatus: 'healthy'
    };
    
    // Thresholds for pool health
    this.thresholds = {
      warningUtilization: 0.7,  // 70% utilization warning
      criticalUtilization: 0.9, // 90% utilization critical
      maxWaitingRequests: 5,     // Maximum queued requests before alarm
      exhaustionRecoveryTime: 30000 // 30s recovery time after exhaustion
    };
  }

  /**
   * Start monitoring the connection pool
   */
  startMonitoring(intervalMs = 5000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('[Pool Monitor] Starting connection pool monitoring...');
    
    this.monitorInterval = setInterval(async () => {
      await this.checkPoolHealth();
    }, intervalMs);
    
    // Listen for pool events
    this.attachPoolEventListeners();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    console.log('[Pool Monitor] Stopped connection pool monitoring');
  }

  /**
   * Check current pool health
   */
  async checkPoolHealth() {
    try {
      const pool = this.sequelize.connectionManager.pool;
      if (!pool) {
        this.stats.healthStatus = 'no_pool';
        return;
      }

      // Update statistics
      this.stats.totalConnections = pool.max || 0;
      this.stats.activeConnections = pool.size || 0;
      this.stats.idleConnections = pool.available || 0;
      this.stats.waitingRequests = pool.pending || 0;

      // Calculate utilization
      const utilization = this.stats.totalConnections > 0 ? 
        this.stats.activeConnections / this.stats.totalConnections : 0;

      // Determine health status
      if (utilization >= this.thresholds.criticalUtilization || 
          this.stats.waitingRequests > this.thresholds.maxWaitingRequests) {
        this.stats.healthStatus = 'critical';
        this.handleCriticalState();
      } else if (utilization >= this.thresholds.warningUtilization) {
        this.stats.healthStatus = 'warning';
        this.handleWarningState();
      } else {
        this.stats.healthStatus = 'healthy';
      }

      // Log stats in development
      if (process.env.NODE_ENV === 'development') {
        this.logPoolStats(utilization);
      }

    } catch (error) {
      console.error('[Pool Monitor] Error checking pool health:', error.message);
      this.stats.healthStatus = 'error';
    }
  }

  /**
   * Handle critical pool state
   */
  handleCriticalState() {
    console.warn('🚨 [Pool Monitor] CRITICAL: Connection pool nearly exhausted!');
    console.warn(`   Active: ${this.stats.activeConnections}/${this.stats.totalConnections}`);
    console.warn(`   Waiting: ${this.stats.waitingRequests} requests`);
    
    // Could implement emergency measures here:
    // - Kill long-running queries
    // - Reduce connection timeout
    // - Send alerts
  }

  /**
   * Handle warning pool state
   */
  handleWarningState() {
    console.warn('⚠️  [Pool Monitor] WARNING: High connection pool utilization');
    console.warn(`   Active: ${this.stats.activeConnections}/${this.stats.totalConnections}`);
  }

  /**
   * Log pool statistics
   */
  logPoolStats(utilization) {
    console.log(`[Pool Monitor] Health: ${this.stats.healthStatus.toUpperCase()} | ` +
                `Active: ${this.stats.activeConnections}/${this.stats.totalConnections} ` +
                `(${Math.round(utilization * 100)}%) | ` +
                `Idle: ${this.stats.idleConnections} | ` +
                `Waiting: ${this.stats.waitingRequests}`);
  }

  /**
   * Attach event listeners to pool
   */
  attachPoolEventListeners() {
    const pool = this.sequelize.connectionManager.pool;
    if (!pool) return;

    // These events may not be available in all versions
    try {
      // Connection acquired
      pool.on?.('acquire', (connection) => {
        console.log('[Pool Monitor] Connection acquired');
      });

      // Connection released
      pool.on?.('release', (connection) => {
        console.log('[Pool Monitor] Connection released');
      });

      // Pool exhausted
      pool.on?.('exhausted', () => {
        this.stats.poolExhaustedEvents++;
        this.stats.lastPoolExhaustion = new Date();
        console.error('🚨 [Pool Monitor] POOL EXHAUSTED! All connections in use.');
      });

    } catch (error) {
      console.log('[Pool Monitor] Pool events not available in this version');
    }
  }

  /**
   * Get current pool statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Get pool health status
   */
  getHealthStatus() {
    return {
      status: this.stats.healthStatus,
      utilization: this.stats.totalConnections > 0 ? 
        this.stats.activeConnections / this.stats.totalConnections : 0,
      connections: {
        total: this.stats.totalConnections,
        active: this.stats.activeConnections,
        idle: this.stats.idleConnections,
        waiting: this.stats.waitingRequests
      },
      events: {
        exhaustionCount: this.stats.poolExhaustedEvents,
        lastExhaustion: this.stats.lastPoolExhaustion
      }
    };
  }

  /**
   * Force release idle connections
   */
  async forceCleanup() {
    try {
      console.log('[Pool Monitor] Forcing cleanup of idle connections...');
      
      // This might not be available in all Sequelize versions
      const pool = this.sequelize.connectionManager.pool;
      if (pool && typeof pool.destroyAllNow === 'function') {
        await pool.destroyAllNow();
        console.log('[Pool Monitor] Forced cleanup completed');
      } else {
        console.log('[Pool Monitor] Forced cleanup not available');
      }
      
    } catch (error) {
      console.error('[Pool Monitor] Error during forced cleanup:', error.message);
    }
  }
}

module.exports = ConnectionPoolMonitor;
