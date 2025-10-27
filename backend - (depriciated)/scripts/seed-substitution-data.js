const { 
  FacultySubstitution, 
  Faculty, 
  User, 
  Course, 
  Section,
  Timetable,
  Department,
  College
} = require('../src/shared/db/models');

async function seedSubstitutionData() {
  try {
    console.log('🌱 Seeding Faculty Substitution test data...');

    // Get sample data from existing records
    const faculty = await Faculty.findAll({
      limit: 4,
      include: [
        { model: User, as: 'user' },
        { model: Department, as: 'department' }
      ]
    });

    const courses = await Course.findAll({ limit: 3 });
    const sections = await Section.findAll({ limit: 2 });
    
    const timetables = await Timetable.findAll({ 
      limit: 5,
      where: { isActive: true }
    });

    if (faculty.length < 2 || courses.length < 1 || sections.length < 1 || timetables.length < 1) {
      console.log('⚠️ Insufficient data. Please ensure you have at least:');
      console.log('- 2 faculty members');
      console.log('- 1 course');
      console.log('- 1 section');
      console.log('- 1 active timetable entry');
      return;
    }

    // Create sample substitution requests
    const substitutionData = [
      {
        absentFacultyId: faculty[0].id,
        courseId: courses[0].id,
        substituteFacultyId: faculty[1].id,
        sectionId: sections[0].id,
        timetableId: timetables[0].id,
        date: new Date('2024-12-15'),
        status: 'pending',
        reason: 'Personal leave - family function'
      },
      {
        absentFacultyId: faculty[0].id,
        courseId: courses[1] ? courses[1].id : courses[0].id,
        substituteFacultyId: faculty[2] ? faculty[2].id : faculty[1].id,
        sectionId: sections[1] ? sections[1].id : sections[0].id,
        timetableId: timetables[1] ? timetables[1].id : timetables[0].id,
        date: new Date('2024-12-16'),
        status: 'confirmed',
        reason: 'Medical appointment',
        confirmedBy: faculty[2] ? faculty[2].userId : faculty[1].userId,
        confirmedAt: new Date()
      },
      {
        absentFacultyId: faculty[1].id,
        courseId: courses[0].id,
        substituteFacultyId: faculty[3] ? faculty[3].id : faculty[0].id,
        sectionId: sections[0].id,
        timetableId: timetables[2] ? timetables[2].id : timetables[0].id,
        date: new Date('2024-12-17'),
        status: 'approved',
        reason: 'Conference attendance'
      }
    ];

    // Create substitution records
    const createdSubstitutions = [];
    
    for (const data of substitutionData) {
      try {
        const substitution = await FacultySubstitution.create(data);
        createdSubstitutions.push(substitution);
        console.log(`✅ Created substitution: ${faculty.find(f => f.id === data.absentFacultyId).user.name} → ${faculty.find(f => f.id === data.substituteFacultyId).user.name}`);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(`⚠️ Substitution already exists for this timetable and date`);
        } else {
          throw error;
        }
      }
    }

    console.log(`\n✅ Successfully created ${createdSubstitutions.length} substitution records!`);

    // Display summary
    console.log('\n📊 Substitution Summary:');
    console.log('Status Distribution:');
    const statusCounts = createdSubstitutions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {});
    console.table(statusCounts);

    console.log('\nFaculty Involvement:');
    const facultyStats = {};
    createdSubstitutions.forEach(sub => {
      const absentFaculty = faculty.find(f => f.id === sub.absentFacultyId);
      const substituteFaculty = faculty.find(f => f.id === sub.substituteFacultyId);
      
      if (!facultyStats[absentFaculty.user.name]) {
        facultyStats[absentFaculty.user.name] = { asAbsent: 0, asSubstitute: 0 };
      }
      if (!facultyStats[substituteFaculty.user.name]) {
        facultyStats[substituteFaculty.user.name] = { asAbsent: 0, asSubstitute: 0 };
      }
      
      facultyStats[absentFaculty.user.name].asAbsent++;
      facultyStats[substituteFaculty.user.name].asSubstitute++;
    });
    console.table(facultyStats);

    return createdSubstitutions;

  } catch (error) {
    console.error('❌ Error seeding substitution data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSubstitutionData()
    .then(() => {
      console.log('\n🎉 Substitution seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSubstitutionData };
