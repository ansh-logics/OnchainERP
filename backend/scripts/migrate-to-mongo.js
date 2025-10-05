#!/usr/bin/env node

/**
 * Production MongoDB Migration Script
 * Migrates all data from PostgreSQL to MongoDB
 */

const { connectDatabases } = require('../src/shared/db/database');
const { dbSync } = require('../src/shared/db/dbSync');

async function migrateToMongo() {
  console.log('🚀 Starting Production Migration to MongoDB...\n');
  
  const startTime = Date.now();
  const results = {};
  
  try {
    // Connect to both databases
    console.log('📡 Connecting to databases...');
    await connectDatabases();
    console.log('✅ Connected successfully\n');
    
    // Enable sync logging
    process.env.DB_SYNC_LOG_LEVEL = 'info';
    
    // Migration order (to handle foreign key dependencies)
    const migrationOrder = [
      'User',      // Base users first
      'College',   // Colleges next
      'Department', // Departments
      'Faculty',   // Faculty profiles
      'Student',   // Student profiles
      'Section',   // Sections
      'Course',    // Courses
      'Assignment', // Assignments
      'Attendance', // Attendance records
      'Fee',       // Fee records
      'Transaction' // Transactions
    ];
    
    console.log('📋 Migration Plan:');
    migrationOrder.forEach((model, index) => {
      console.log(`${index + 1}. ${model}`);
    });
    console.log('');
    
    // Perform migration for each model
    for (const modelName of migrationOrder) {
      console.log(`🔄 Migrating ${modelName}...`);
      
      try {
        const migrated = await dbSync.migrateToMongo(modelName, 500); // 500 records per batch
        results[modelName] = { 
          success: true, 
          count: migrated,
          status: 'completed'
        };
        console.log(`✅ ${modelName}: ${migrated} records migrated\n`);
      } catch (error) {
        console.error(`❌ ${modelName} migration failed:`, error.message);
        results[modelName] = { 
          success: false, 
          error: error.message,
          status: 'failed'
        };
        
        // Continue with other models unless it's a critical dependency
        if (['User', 'College'].includes(modelName)) {
          console.error('💥 Critical model migration failed. Stopping migration.');
          throw error;
        }
      }
    }
    
    console.log('🔍 Verifying data consistency...\n');
    
    // Verify consistency for all migrated models
    const consistencyResults = {};
    for (const modelName of migrationOrder) {
      if (results[modelName]?.success) {
        try {
          const consistency = await dbSync.verifyConsistency(modelName);
          consistencyResults[modelName] = consistency;
          
          if (consistency.consistent) {
            console.log(`✅ ${modelName}: ${consistency.mongodb}/${consistency.postgresql} records consistent`);
          } else {
            console.log(`⚠️ ${modelName}: ${consistency.mongodb}/${consistency.postgresql} records (${consistency.difference > 0 ? '+' : ''}${consistency.difference} difference)`);
          }
        } catch (error) {
          console.log(`❌ ${modelName}: Consistency check failed - ${error.message}`);
          consistencyResults[modelName] = { error: error.message };
        }
      }
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 Migration Completed!\n');
    
    // Summary
    console.log('📊 Migration Summary:');
    console.log('├── Duration:', `${duration} seconds`);
    console.log('├── Models processed:', migrationOrder.length);
    
    const successful = Object.values(results).filter(r => r.success).length;
    const failed = Object.values(results).filter(r => !r.success).length;
    
    console.log('├── Successful:', successful);
    console.log('├── Failed:', failed);
    
    const totalRecords = Object.values(results)
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.count || 0), 0);
    
    console.log('└── Total records migrated:', totalRecords);
    console.log('');
    
    // Detailed results
    console.log('📋 Detailed Results:');
    for (const [model, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`✅ ${model}: ${result.count} records`);
      } else {
        console.log(`❌ ${model}: ${result.error}`);
      }
    }
    console.log('');
    
    // Consistency summary
    console.log('🔍 Consistency Summary:');
    const consistent = Object.values(consistencyResults).filter(r => r.consistent).length;
    const inconsistent = Object.values(consistencyResults).filter(r => !r.consistent && !r.error).length;
    const checkErrors = Object.values(consistencyResults).filter(r => r.error).length;
    
    console.log(`├── Consistent: ${consistent}`);
    console.log(`├── Inconsistent: ${inconsistent}`);
    console.log(`└── Check errors: ${checkErrors}`);
    console.log('');
    
    // Post-migration instructions
    console.log('🔧 Post-Migration Steps:');
    console.log('1. Set USE_MONGODB=true in your environment variables');
    console.log('2. Update application configuration to use MongoDB');
    console.log('3. Test all API endpoints thoroughly');
    console.log('4. Monitor application performance');
    console.log('5. Keep PostgreSQL running as backup during transition');
    console.log('6. Set DB_SYNC_ENABLED=true for dual-write mode');
    console.log('');
    
    // Environment variables suggestion
    console.log('🌍 Recommended Environment Variables:');
    console.log('USE_MONGODB=true');
    console.log('DB_SYNC_ENABLED=true');
    console.log('DB_SYNC_DIRECTION=mongo-primary'); 
    console.log('DB_SYNC_FAIL_SILENTLY=true');
    console.log('MONGODB_URI=mongodb://localhost:27017/onchain-erp');
    console.log('');
    
    if (failed === 0 && inconsistent === 0) {
      console.log('🎊 Perfect Migration! All models migrated successfully with consistent data.');
    } else if (failed > 0) {
      console.log('⚠️ Partial Migration. Some models failed to migrate. Review errors above.');
    } else {
      console.log('✅ Migration completed with minor inconsistencies. Review consistency report above.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure MongoDB is running: brew services start mongodb-community');
    console.log('2. Ensure PostgreSQL is running: brew services start postgresql');
    console.log('3. Check database connections and credentials');
    console.log('4. Verify sufficient disk space and memory');
    console.log('5. Check database permissions');
    
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the migration
if (require.main === module) {
  console.log('⚠️ This will migrate ALL data from PostgreSQL to MongoDB.');
  console.log('⚠️ Ensure you have backups before proceeding.\n');
  
  // Simple confirmation prompt
  if (process.argv.includes('--confirm') || process.env.CONFIRM_MIGRATION === 'true') {
    migrateToMongo();
  } else {
    console.log('To run the migration, use:');
    console.log('node scripts/migrate-to-mongo.js --confirm');
    console.log('or set CONFIRM_MIGRATION=true');
    process.exit(0);
  }
}

module.exports = migrateToMongo;
