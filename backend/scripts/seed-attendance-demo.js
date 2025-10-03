const { sequelize } = require('../src/shared/db/database');
const User = require('../src/shared/db/models/postgresql/User');
const College = require('../src/shared/db/models/postgresql/College');
const Department = require('../src/shared/db/models/postgresql/Department');
const Faculty = require('../src/shared/db/models/postgresql/Faculty');
const Student = require('../src/shared/db/models/postgresql/Student');
const Section = require('../src/shared/db/models/postgresql/Section');
const Course = require('../src/shared/db/models/postgresql/Course');
const Timetable = require('../src/shared/db/models/postgresql/Timetable');
const Classroom = require('../src/shared/db/models/postgresql/Classroom');
const bcrypt = require('bcryptjs');

async function seedAttendanceDemo() {
  try {
    console.log('🌱 Starting attendance demo data seeding...');

    // Get or create college
    let college = await College.findOne();
    if (!college) {
      college = await College.create({
        name: 'Demo Institute of Technology',
        shortName: 'DIT',
        establishedYear: 2020,
        collegeType: 'Engineering',
        registrationNumber: 'DIT2020',
        addressStreet: '123 Demo Street',
        addressCity: 'Demo City',
        addressState: 'Demo State',
        addressPincode: '123456',
        addressCountry: 'India',
        phone: '1234567890',
        email: 'info@demo.edu',
        website: 'https://demo.edu',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        accentColor: '#60a5fa',
        backgroundColor: '#ffffff',
        profileCompleted: true,
        setupStep: 5,
        isActive: true
      });
      console.log('✅ College created');
    }

    // Get or create department
    let department = await Department.findOne({
      where: { collegeId: college.id }
    });
    
    if (!department) {
      department = await Department.create({
        collegeId: college.id,
        name: 'Computer Science Engineering',
        code: 'CSE',
        shortName: 'CSE',
        hodName: 'Dr. John Doe',
        hodEmail: 'hod.cse@demo.edu',
        hodPhone: '9876543210',
        description: 'Department of Computer Science and Engineering',
        establishedYear: 2020,
        isActive: true
      });
      console.log('✅ Department created');
    }

    // Create or get faculty user
    const hashedPassword = await bcrypt.hash('password123', 10);
    let facultyUser = await User.findOne({
      where: { email: 'faculty@demo.edu' }
    });

    if (!facultyUser) {
      facultyUser = await User.create({
        collegeId: college.id,
        name: 'Dr. Sarah Johnson',
        email: 'faculty@demo.edu',
        password: hashedPassword,
        role: 'faculty',
        phone: '9876543211',
        isActive: true,
        profileCompleted: true
      });
      console.log('✅ Faculty user created - Email: faculty@demo.edu, Password: password123');
    }

    // Create or get faculty profile
    let faculty = await Faculty.findOne({
      where: { userId: facultyUser.id }
    });

    if (!faculty) {
      faculty = await Faculty.create({
        userId: facultyUser.id,
        collegeId: college.id,
        departmentId: department.id,
        employeeId: 'FAC001',
        designation: 'Assistant Professor',
        qualification: 'Ph.D. in Computer Science',
        specialization: 'Data Structures and Algorithms',
        experience: 5,
        joiningDate: '2020-01-01',
        employmentType: 'Permanent',
        dateOfBirth: '1985-05-15',
        gender: 'Female',
        salary: 75000,
        bloodGroup: 'O+',
        isActive: true
      });
      console.log('✅ Faculty profile created');
    }

    // Create courses
    const coursesData = [
      {
        code: 'CSE101',
        name: 'Data Structures and Algorithms',
        shortName: 'DSA',
        description: 'Introduction to fundamental data structures and algorithms',
        credits: 4,
        semester: 3,
        courseType: 'Core',
        theoryHours: 3,
        labHours: 2,
        tutorialHours: 0
      },
      {
        code: 'CSE102',
        name: 'Database Management Systems',
        shortName: 'DBMS',
        description: 'Relational database design and SQL',
        credits: 4,
        semester: 3,
        courseType: 'Core',
        theoryHours: 3,
        labHours: 2,
        tutorialHours: 0
      },
      {
        code: 'CSE103',
        name: 'Operating Systems',
        shortName: 'OS',
        description: 'Process management, memory management, and file systems',
        credits: 3,
        semester: 3,
        courseType: 'Core',
        theoryHours: 3,
        labHours: 0,
        tutorialHours: 1
      }
    ];

    const courses = [];
    for (const courseData of coursesData) {
      let course = await Course.findOne({
        where: { code: courseData.code, collegeId: college.id }
      });

      if (!course) {
        course = await Course.create({
          ...courseData,
          collegeId: college.id,
          departmentId: department.id,
          isActive: true
        });
      }
      courses.push(course);
    }
    console.log(`✅ ${courses.length} courses created/updated`);

    // Create sections
    const sectionsData = [
      { name: 'Section A', code: 'CSE-3A-2024', batch: '2024', semester: 3, maxCapacity: 60 },
      { name: 'Section B', code: 'CSE-3B-2024', batch: '2024', semester: 3, maxCapacity: 60 }
    ];

    const sections = [];
    for (const sectionData of sectionsData) {
      let section = await Section.findOne({
        where: { code: sectionData.code, collegeId: college.id }
      });

      if (!section) {
        section = await Section.create({
          ...sectionData,
          collegeId: college.id,
          departmentId: department.id,
          classTeacherId: faculty.id,
          currentStrength: 0,
          isActive: true
        });
      }
      sections.push(section);
    }
    console.log(`✅ ${sections.length} sections created`);

    // Create students for Section A
    const studentNames = [
      { name: 'Rahul Kumar', email: 'rahul.kumar@demo.edu', rollNumber: 'CSE2024001' },
      { name: 'Priya Sharma', email: 'priya.sharma@demo.edu', rollNumber: 'CSE2024002' },
      { name: 'Amit Patel', email: 'amit.patel@demo.edu', rollNumber: 'CSE2024003' },
      { name: 'Sneha Reddy', email: 'sneha.reddy@demo.edu', rollNumber: 'CSE2024004' },
      { name: 'Vikram Singh', email: 'vikram.singh@demo.edu', rollNumber: 'CSE2024005' },
      { name: 'Anjali Verma', email: 'anjali.verma@demo.edu', rollNumber: 'CSE2024006' },
      { name: 'Karthik Raj', email: 'karthik.raj@demo.edu', rollNumber: 'CSE2024007' },
      { name: 'Divya Nair', email: 'divya.nair@demo.edu', rollNumber: 'CSE2024008' },
      { name: 'Arjun Mehta', email: 'arjun.mehta@demo.edu', rollNumber: 'CSE2024009' },
      { name: 'Pooja Gupta', email: 'pooja.gupta@demo.edu', rollNumber: 'CSE2024010' },
      { name: 'Rohan Desai', email: 'rohan.desai@demo.edu', rollNumber: 'CSE2024011' },
      { name: 'Neha Joshi', email: 'neha.joshi@demo.edu', rollNumber: 'CSE2024012' },
      { name: 'Sanjay Kumar', email: 'sanjay.kumar@demo.edu', rollNumber: 'CSE2024013' },
      { name: 'Kavya Iyer', email: 'kavya.iyer@demo.edu', rollNumber: 'CSE2024014' },
      { name: 'Aditya Malhotra', email: 'aditya.malhotra@demo.edu', rollNumber: 'CSE2024015' }
    ];

    let studentCount = 0;
    for (const studentData of studentNames) {
      let studentUser = await User.findOne({
        where: { email: studentData.email }
      });

      if (!studentUser) {
        studentUser = await User.create({
          collegeId: college.id,
          name: studentData.name,
          email: studentData.email,
          password: hashedPassword,
          role: 'student',
          phone: `98765432${10 + studentCount}`,
          isActive: true,
          profileCompleted: true
        });

        await Student.create({
          userId: studentUser.id,
          collegeId: college.id,
          departmentId: department.id,
          sectionId: sections[0].id, // Section A
          rollNumber: studentData.rollNumber,
          enrollmentNumber: `E${studentData.rollNumber}`,
          studentId: studentData.rollNumber,
          batch: '2024',
          program: 'B.Tech',
          admissionYear: 2024,
          currentSemester: 3,
          dateOfBirth: '2003-01-15',
          gender: studentCount % 2 === 0 ? 'Male' : 'Female',
          category: 'General',
          nationality: 'Indian',
          guardianName: `${studentData.name.split(' ')[1]} (Parent)`,
          guardianRelation: 'Father',
          guardianPhone: `987654${3210 + studentCount}`,
          guardianEmail: `parent.${studentData.email}`,
          isActive: true
        });
        studentCount++;
      }
    }
    
    // Update section strength
    await sections[0].update({ currentStrength: studentCount });
    console.log(`✅ ${studentCount} students created for Section A`);

    // Create classrooms
    const classroomData = [
      { roomNumber: 'A-101', building: 'Academic Block A', floor: 1, capacity: 60, roomType: 'lecture_hall' },
      { roomNumber: 'A-102', building: 'Academic Block A', floor: 1, capacity: 60, roomType: 'lecture_hall' },
      { roomNumber: 'B-201', building: 'Academic Block B', floor: 2, capacity: 30, roomType: 'laboratory' }
    ];

    const classrooms = [];
    for (const classroomInfo of classroomData) {
      let classroom = await Classroom.findOne({
        where: { 
          collegeId: college.id,
          roomNumber: classroomInfo.roomNumber 
        }
      });

      if (!classroom) {
        classroom = await Classroom.create({
          ...classroomInfo,
          collegeId: college.id,
          hasProjector: true,
          hasAC: true,
          hasSmartBoard: true,
          isActive: true
        });
      }
      classrooms.push(classroom);
    }
    console.log(`✅ ${classrooms.length} classrooms created`);

    // Create timetable entries for today and this week
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday=0 to 7

    const timetableEntries = [
      // Monday (1)
      {
        dayOfWeek: 1,
        period: 1,
        startTime: '09:00:00',
        endTime: '10:00:00',
        courseId: courses[0].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'theory'
      },
      {
        dayOfWeek: 1,
        period: 2,
        startTime: '10:00:00',
        endTime: '11:00:00',
        courseId: courses[1].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'theory'
      },
      // Tuesday (2)
      {
        dayOfWeek: 2,
        period: 1,
        startTime: '09:00:00',
        endTime: '10:00:00',
        courseId: courses[2].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'theory'
      },
      {
        dayOfWeek: 2,
        period: 2,
        startTime: '10:00:00',
        endTime: '11:00:00',
        courseId: courses[0].id,
        sectionId: sections[0].id,
        classroomId: classrooms[2].id,
        classType: 'practical'
      },
      // Wednesday (3)
      {
        dayOfWeek: 3,
        period: 1,
        startTime: '09:00:00',
        endTime: '10:00:00',
        courseId: courses[1].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'theory'
      },
      {
        dayOfWeek: 3,
        period: 2,
        startTime: '10:00:00',
        endTime: '11:00:00',
        courseId: courses[2].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'tutorial'
      },
      // Thursday (4)
      {
        dayOfWeek: 4,
        period: 1,
        startTime: '09:00:00',
        endTime: '10:00:00',
        courseId: courses[0].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'theory'
      },
      {
        dayOfWeek: 4,
        period: 2,
        startTime: '10:00:00',
        endTime: '11:00:00',
        courseId: courses[1].id,
        sectionId: sections[0].id,
        classroomId: classrooms[2].id,
        classType: 'practical'
      },
      // Friday (5)
      {
        dayOfWeek: 5,
        period: 1,
        startTime: '09:00:00',
        endTime: '10:00:00',
        courseId: courses[2].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'theory'
      },
      {
        dayOfWeek: 5,
        period: 2,
        startTime: '10:00:00',
        endTime: '11:00:00',
        courseId: courses[0].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'theory'
      },
      {
        dayOfWeek: 5,
        period: 3,
        startTime: '11:15:00',
        endTime: '12:15:00',
        courseId: courses[1].id,
        sectionId: sections[0].id,
        classroomId: classrooms[0].id,
        classType: 'theory'
      }
    ];

    let timetableCount = 0;
    const currentAcademicYear = `${today.getFullYear()}-${today.getFullYear() + 1}`;
    const effectiveFrom = new Date(today.getFullYear(), 0, 1); // Jan 1 of current year

    for (const entry of timetableEntries) {
      const existing = await Timetable.findOne({
        where: {
          collegeId: college.id,
          sectionId: entry.sectionId,
          courseId: entry.courseId,
          dayOfWeek: entry.dayOfWeek,
          period: entry.period
        }
      });

      if (!existing) {
        await Timetable.create({
          ...entry,
          collegeId: college.id,
          departmentId: department.id,
          facultyId: faculty.id,
          academicYear: currentAcademicYear,
          semester: 3,
          effectiveFrom: effectiveFrom,
          isActive: true
        });
        timetableCount++;
      }
    }
    console.log(`✅ ${timetableCount} timetable entries created`);

    console.log('\n✅ Attendance demo data seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Faculty: faculty@demo.edu / password123');
    console.log('   Student: rahul.kumar@demo.edu / password123');
    console.log('\n📅 Timetable:');
    console.log(`   Today is ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]}`);
    console.log(`   Classes scheduled for weekdays (Monday-Friday)`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Login as faculty@demo.edu');
    console.log('   2. Navigate to Attendance Management');
    console.log('   3. Select today\'s date or any weekday');
    console.log('   4. You should see classes for Section A');

  } catch (error) {
    console.error('❌ Error seeding attendance demo data:', error);
    throw error;
  }
}

// Run the seeding
seedAttendanceDemo()
  .then(() => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

