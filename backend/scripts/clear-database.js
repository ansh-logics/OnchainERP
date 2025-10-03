const { sequelize } = require('../src/shared/db/models');

async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...\n');

    // List of tables to truncate in the correct order (respecting foreign keys)
    const tables = [
      'timetable',
      'assignment_submissions',
      'assignments',
      'attendance',
      'exam_results',
      'exams',
      'exam_halls',
      'library_issues',
      'library_books',
      'hostel_allocations',
      'hostel_rooms',
      'hostels',
      'transactions',
      'sections',
      'courses',
      'labs',
      'classrooms',
      'students',
      'faculty',
      'departments',
      'colleges',
      'password_reset_requests',
      'role_permissions',
      'permissions',
      'users'
    ];

    console.log('Truncating tables...');
    
    for (const table of tables) {
      try {
        await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE;`);
        console.log(`  ✅ Cleared ${table}`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`  ⚠️  Table ${table} does not exist, skipping...`);
        } else {
          console.error(`  ❌ Error clearing ${table}:`, error.message);
        }
      }
    }

    console.log('\n✅ Database cleared successfully!\n');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

clearDatabase();

