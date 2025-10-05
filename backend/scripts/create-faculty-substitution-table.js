const { FacultySubstitution } = require('../src/shared/db/models');

async function createFacultySubstitutionTable() {
  try {
    console.log('Creating faculty_substitutions table...');
    
    // Force sync the model to create the table
    await FacultySubstitution.sync({ force: false });
    
    console.log('✅ faculty_substitutions table created successfully!');
    
    // Log the table structure
    const tableInfo = await FacultySubstitution.describe();
    console.log('\nTable structure:');
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ Error creating faculty_substitutions table:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createFacultySubstitutionTable()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createFacultySubstitutionTable };
