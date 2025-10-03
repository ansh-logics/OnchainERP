const { sequelize } = require('../src/shared/db/database');
const Faculty = require('../src/shared/db/models/postgresql/Faculty');
const Section = require('../src/shared/db/models/postgresql/Section');
const Course = require('../src/shared/db/models/postgresql/Course');
const Timetable = require('../src/shared/db/models/postgresql/Timetable');
const Classroom = require('../src/shared/db/models/postgresql/Classroom');
const College = require('../src/shared/db/models/postgresql/College');

async function addTimetableData() {
  try {
    console.log('🕐 Adding timetable data for attendance demo...');

    // Get first college
    const college = await College.findOne();
    if (!college) {
      console.log('❌ No college found. Please run the main seed script first.');
      return;
    }

    // Get first faculty
    const faculty = await Faculty.findOne({ 
      where: { isActive: true },
      limit: 1 
    });
    
    if (!faculty) {
      console.log('❌ No faculty found. Please create a faculty member first.');
      return;
    }
    console.log(`✅ Found faculty: ${faculty.id}`);

    // Get first section
    const section = await Section.findOne({ 
      where: { isActive: true },
      limit: 1 
    });
    
    if (!section) {
      console.log('❌ No section found. Please create a section first.');
      return;
    }
    console.log(`✅ Found section: ${section.name}`);

    // Get or create courses
    const courses = await Course.findAll({ 
      where: { 
        collegeId: college.id,
        isActive: true 
      },
      limit: 3 
    });
    
    if (courses.length === 0) {
      console.log('⚠️ No courses found. Creating demo courses...');
      
      const newCourses = [];
      const coursesData = [
        {
          code: 'CS101',
          name: 'Data Structures',
          shortName: 'DS',
          description: 'Introduction to Data Structures',
          credits: 4,
          semester: section.semester,
          courseType: 'Core',
          theoryHours: 3,
          labHours: 2
        },
        {
          code: 'CS102',
          name: 'Database Systems',
          shortName: 'DBMS',
          description: 'Database Management Systems',
          credits: 3,
          semester: section.semester,
          courseType: 'Core',
          theoryHours: 3,
          labHours: 0
        }
      ];

      for (const cd of coursesData) {
        const course = await Course.create({
          ...cd,
          collegeId: college.id,
          departmentId: section.departmentId,
          isActive: true
        });
        newCourses.push(course);
      }
      
      courses.push(...newCourses);
      console.log(`✅ Created ${newCourses.length} courses`);
    }

    // Get or create classroom
    let classroom = await Classroom.findOne({
      where: { collegeId: college.id }
    });

    if (!classroom) {
      classroom = await Classroom.create({
        collegeId: college.id,
        roomNumber: 'A-101',
        building: 'Academic Block',
        floor: 1,
        capacity: 60,
        roomType: 'lecture_hall',
        hasProjector: true,
        hasAC: true,
        isActive: true
      });
      console.log('✅ Classroom created');
    }

    // Delete existing timetable entries for this section
    await Timetable.destroy({
      where: { sectionId: section.id }
    });

    // Create timetable entries for the current week
    const today = new Date();
    const currentYear = today.getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    const effectiveFrom = new Date(currentYear, 0, 1);

    const timetableEntries = [];
    
    // Monday to Friday, 2 periods each day
    for (let day = 1; day <= 5; day++) {
      for (let period = 1; period <= 2; period++) {
        const course = courses[period % courses.length];
        const entry = {
          collegeId: college.id,
          departmentId: section.departmentId,
          sectionId: section.id,
          courseId: course.id,
          facultyId: faculty.id,
          classroomId: classroom.id,
          dayOfWeek: day,
          period: period,
          startTime: period === 1 ? '09:00:00' : '10:00:00',
          endTime: period === 1 ? '10:00:00' : '11:00:00',
          classType: 'theory',
          academicYear: academicYear,
          semester: section.semester,
          effectiveFrom: effectiveFrom,
          isActive: true
        };

        const created = await Timetable.create(entry);
        timetableEntries.push(created);
      }
    }

    console.log(`✅ Created ${timetableEntries.length} timetable entries`);
    console.log('\n📅 Timetable Summary:');
    console.log(`   Faculty: ${faculty.employeeId || faculty.id}`);
    console.log(`   Section: ${section.name}`);
    console.log(`   Courses: ${courses.map(c => c.code).join(', ')}`);
    console.log(`   Days: Monday to Friday`);
    console.log(`   Periods: 1-2 (09:00-11:00)`);
    console.log('\n✅ Timetable data added successfully!');
    console.log('\n🎯 Now refresh the attendance page and select today\'s date (or a weekday)');

  } catch (error) {
    console.error('❌ Error adding timetable data:', error);
    throw error;
  }
}

// Run the script
addTimetableData()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

