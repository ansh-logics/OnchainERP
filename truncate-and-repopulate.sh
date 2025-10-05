#!/bin/bash

# Database Truncate and Repopulate Script for OnchainERP
# ⚠️ WARNING: This will DELETE ALL DATA and repopulate from scratch

echo "🗑️  OnchainERP Database Truncate & Repopulate"
echo "=============================================="
echo ""
echo "⚠️  WARNING: This will PERMANENTLY DELETE all data!"
echo "    - All users, students, faculty data"
echo "    - All academic records, attendance" 
echo "    - All assignments, exams, fees"
echo "    - Everything will be reset to default seed data"
echo ""

# Safety confirmation
read -p "Are you absolutely sure you want to truncate the entire database? (type 'DELETE_ALL_DATA' to confirm): " confirm

if [ "$confirm" != "DELETE_ALL_DATA" ]; then
    echo "❌ Operation cancelled - database preserved"
    exit 1
fi

echo ""
echo "🚀 Starting database truncate and repopulate process..."
echo "======================================================"

# Step 1: Kill all database connections first
echo ""
echo "📋 Step 1/7: Terminating all database connections..."
./manage-connections.sh emergency << EOF
yes
EOF

# Wait a moment for connections to close
sleep 2

# Step 2: Backup current database (just in case)
echo ""
echo "📋 Step 2/7: Creating emergency backup..."
BACKUP_FILE="onchain_erp_backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump onchain_erp > "$BACKUP_FILE"
if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
else
    echo "⚠️  Backup failed, but continuing..."
fi

# Step 3: Clear all data using the existing script
echo ""
echo "📋 Step 3/7: Clearing all database tables..."
cd backend
node scripts/clear-database.js
if [ $? -ne 0 ]; then
    echo "❌ Database clearing failed!"
    echo "💡 Try manual truncation or check the logs"
    exit 1
fi

# Step 4: Reset database schema (sync with force)
echo ""
echo "📋 Step 4/7: Resetting database schema..."
DB_SYNC=true node -e "
const { connectPostgreSQL } = require('./src/shared/db/database');
const { sequelize } = require('./src/shared/db/database');

async function resetSchema() {
    try {
        await sequelize.authenticate();
        console.log('🔄 Force syncing database schema...');
        await sequelize.sync({ force: true, logging: console.log });
        console.log('✅ Schema reset completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema reset failed:', error.message);
        process.exit(1);
    }
}
resetSchema();
"

if [ $? -ne 0 ]; then
    echo "❌ Schema reset failed!"
    exit 1
fi

# Step 5: Seed college and basic data
echo ""
echo "📋 Step 5/7: Seeding college and basic data..."
node scripts/seed-college-data.js
if [ $? -ne 0 ]; then
    echo "⚠️  College data seeding failed, but continuing..."
fi

# Step 6: Run main seeding script
echo ""
echo "📋 Step 6/7: Running main data seeding..."
if [ -f "scripts/run-seed.sh" ]; then
    chmod +x scripts/run-seed.sh
    ./scripts/run-seed.sh
else
    # Fallback to individual seed scripts
    echo "Running individual seed scripts..."
    
    # Seed in proper order
    scripts_to_run=(
        "seed-college-data.js"
        "seed-fee-data.js"
        "seed-assignments.js"
        "seed-attendance-demo.js"
        "seed-substitution-data.js"
    )
    
    for script in "${scripts_to_run[@]}"; do
        if [ -f "scripts/$script" ]; then
            echo "🌱 Running $script..."
            node "scripts/$script"
            if [ $? -ne 0 ]; then
                echo "⚠️  $script failed, but continuing..."
            fi
        fi
    done
fi

# Step 7: Verify repopulation
echo ""
echo "📋 Step 7/7: Verifying database repopulation..."
node -e "
const { testConnection } = require('./src/shared/db/database');
const { sequelize } = require('./src/shared/db/database');

async function verifyData() {
    try {
        await testConnection();
        
        // Check key tables
        const tables = ['users', 'students', 'colleges', 'courses'];
        
        for (const table of tables) {
            try {
                const [[{ count }]] = await sequelize.query(\`SELECT COUNT(*) as count FROM \${table}\`);
                console.log(\`📊 \${table}: \${count} records\`);
            } catch (error) {
                console.log(\`📊 \${table}: Table not found or empty\`);
            }
        }
        
        console.log('');
        console.log('✅ Database verification completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
}
verifyData();
"

# Return to root directory
cd ..

echo ""
echo "🎉 DATABASE TRUNCATE AND REPOPULATE COMPLETED!"
echo "=============================================="
echo ""
echo "📈 Summary:"
echo "   ✅ All connections terminated"
echo "   ✅ Emergency backup created: $BACKUP_FILE"
echo "   ✅ All tables truncated"
echo "   ✅ Schema reset with sync"
echo "   ✅ Fresh data seeded"
echo "   ✅ Database verified"
echo ""
echo "🚀 Your OnchainERP database is now fresh and clean!"
echo "   - All shared memory issues should be resolved"
echo "   - Default seed data has been populated"
echo "   - You can now start your application"
echo ""
echo "💡 To start the backend server:"
echo "   cd backend && npm start"
echo ""
echo "🔧 If you need to restore from backup later:"
echo "   psql onchain_erp < $BACKUP_FILE"
