/**
 * Migration script to add profilePicture column to users table
 * Run this if you need to manually add the column
 */

const { sequelize } = require('../src/shared/db/database');

async function addProfilePictureColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='profilePicture';
    `);

    if (results.length > 0) {
      console.log('✓ profilePicture column already exists');
      process.exit(0);
    }

    // Add the column
    console.log('Adding profilePicture column to users table...');
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN "profilePicture" VARCHAR;
    `);

    console.log('✓ Successfully added profilePicture column to users table');
    process.exit(0);
  } catch (error) {
    console.error('Error adding profilePicture column:', error);
    process.exit(1);
  }
}

// Run the migration
addProfilePictureColumn();


