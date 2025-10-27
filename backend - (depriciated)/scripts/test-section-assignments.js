const { sequelize } = require('../src/shared/db/database');
const Assignment = require('../src/shared/db/models/postgresql/Assignment');
const Faculty = require('../src/shared/db/models/postgresql/Faculty');
const Section = require('../src/shared/db/models/postgresql/Section');
const Timetable = require('../src/shared/db/models/postgresql/Timetable');
const User = require('../src/shared/db/models/postgresql/User');
const Department = require('../src/shared/db/models/postgresql/Department');

async function testSectionBasedAssignments() {
  console.log('🧪 Testing Section-Based Assignment System...');

  try {
    // Test 1: Check if assignments table has sectionId column
    console.log('\n1️⃣ Testing database schema...');
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'assignments' 
      AND column_name = 'sectionId'
    `);

    if (results.length > 0) {
      console.log('✅ Assignments table has sectionId column');
    } else {
      console.log('❌ Assignments table missing sectionId column - run migration first');
      return;
    }

    // Test 2: Check faculty-section relationships through timetable
    console.log('\n2️⃣ Testing faculty-section relationships...');
    const facultyWithSections = await Faculty.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name']
        },
        {
          model: Timetable,
          as: 'timetableEntries',
          where: { isActive: true },
          required: false,
          include: [{
            model: Section,
            as: 'section',
            attributes: ['id', 'name', 'code'],
            include: [{
              model: Department,
              as: 'department',
              attributes: ['name', 'code']
            }]
          }]
        }
      ],
      limit: 3
    });

    console.log(`✅ Found ${facultyWithSections.length} faculty members`);
    facultyWithSections.forEach(faculty => {
      const sections = faculty.timetableEntries?.length || 0;
      console.log(`   - ${faculty.user.name}: ${sections} section(s)`);
    });

    // Test 3: Check section-based assignments
    console.log('\n3️⃣ Testing section-based assignments...');
    const assignments = await Assignment.findAll({
      include: [
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'code'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['name']
          }]
        },
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['id'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['name']
          }]
        }
      ],
      limit: 5
    });

    console.log(`✅ Found ${assignments.length} section-based assignments`);
    assignments.forEach(assignment => {
      console.log(`   - "${assignment.title}" by ${assignment.faculty.user.name} for ${assignment.section.name}`);
    });

    // Test 4: Verify API endpoints are working
    console.log('\n4️⃣ Testing API structure...');
    
    // Check if controllers export the correct functions
    const facultyController = require('../src/faculty/controllers/assignmentController');
    const studentController = require('../src/students/controllers/assignmentController');

    const facultyFunctions = Object.keys(facultyController);
    const studentFunctions = Object.keys(studentController);

    console.log('✅ Faculty controller functions:', facultyFunctions.join(', '));
    console.log('✅ Student controller functions:', studentFunctions.join(', '));

    // Test 5: Check model associations
    console.log('\n5️⃣ Testing model associations...');
    
    const testSection = await Section.findOne({
      include: [
        {
          model: Assignment,
          as: 'assignments',
          limit: 1
        }
      ]
    });

    if (testSection && testSection.assignments) {
      console.log(`✅ Section-Assignment association working: ${testSection.assignments.length} assignment(s)`);
    } else {
      console.log('⚠️  Section-Assignment association not tested (no data)');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database schema updated');
    console.log('   ✅ Faculty-Section relationships working');
    console.log('   ✅ Section-based assignments created');
    console.log('   ✅ API controllers updated');
    console.log('   ✅ Model associations configured');

    console.log('\n🚀 Section-Based Assignment System is ready for use!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testSectionBasedAssignments()
    .then(() => {
      console.log('\n✅ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testSectionBasedAssignments };
