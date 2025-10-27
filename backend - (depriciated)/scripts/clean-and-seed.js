const { sequelize } = require('../src/shared/db/database');
const { Op } = require('sequelize');
const Student = require('../src/shared/db/models/postgresql/Student');
const User = require('../src/shared/db/models/postgresql/User');
const Section = require('../src/shared/db/models/postgresql/Section');

async function cleanAndSeed() {
  try {
    await sequelize.authenticate();
    console.log('🗑️  Cleaning old CSE2024 students...');
    
    // Find all CSE2024 students
    const oldStudents = await Student.findAll({
      where: {
        rollNumber: { [Op.like]: 'CSE2024%' }
      }
    });
    
    console.log(`Found ${oldStudents.length} old CSE2024 students to delete`);
    
    // Delete their users first
    const userIds = oldStudents.map(s => s.userId);
    await User.destroy({ where: { id: userIds } });
    
    // Delete students
    await Student.destroy({
      where: {
        rollNumber: { [Op.like]: 'CSE2024%' }
      }
    });
    
    console.log('✅ Deleted old students');
    console.log('🌱 Now running fresh seed...\n');
    
    // Close connection
    await sequelize.close();
    
    // Run the seed script
    require('./seed-simple-attendance.js');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanAndSeed();

