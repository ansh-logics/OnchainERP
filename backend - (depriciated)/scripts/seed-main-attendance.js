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

// Student name generator for realistic names
const firstNames = {
  male: ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Aadhya', 'Reyansh', 'Muhammad', 'Siddharth', 'Samar', 'Krish', 'Tanish', 'Aarush', 'Kabir', 'Ritvik', 'Rudra', 'Advait', 'Yash', 'Dhruv', 'Vedant', 'Raghav', 'Rohan', 'Kian', 'Aryan', 'Abhinav', 'Aayan', 'Viaan', 'Anvit', 'Om', 'Shivansh', 'Aaryan', 'Veer', 'Parth', 'Ansh', 'Kabir', 'Mihir'],
  female: ['Saanvi', 'Aadhya', 'Kiara', 'Diya', 'Pihu', 'Prisha', 'Ananya', 'Fatima', 'Anika', 'Riya', 'Ira', 'Navya', 'Shanaya', 'Myra', 'Aanya', 'Sara', 'Pari', 'Avni', 'Kavya', 'Khushi', 'Aaradhya', 'Ishika', 'Aditi', 'Zara', 'Siya', 'Ishita', 'Ayesha', 'Shreya', 'Nitya', 'Tara', 'Aarohi', 'Aradhya', 'Anvi', 'Disha', 'Vanya', 'Nisha', 'Divya', 'Mira', 'Sana', 'Pooja', 'Neha', 'Priya', 'Anjali', 'Swara', 'Nidhi']
};

const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Verma', 'Joshi', 'Nair', 'Mehta', 'Gupta', 'Desai', 'Iyer', 'Malhotra', 'Rao', 'Agarwal', 'Shah', 'Chopra', 'Khan', 'Kapoor', 'Mishra', 'Bansal', 'Sinha', 'Pandey', 'Jain', 'Bhatt', 'Gandhi', 'Saxena', 'Pillai', 'Bhat', 'Menon', 'Kulkarni', 'Choudhary', 'Das', 'Dubey', 'Jha', 'Arora', 'Chauhan', 'Ghosh', 'Roy', 'Rathore', 'Tiwari', 'Yadav', 'Rajput', 'Thakur', 'Venkatesh'];

function generateStudentName(index, gender = null) {
  if (!gender) {
    gender = index % 2 === 0 ? 'male' : 'female';
  }
  const firstName = firstNames[gender][index % firstNames[gender].length];
  const lastName = lastNames[index % lastNames.length];
  return { name: `${firstName} ${lastName}`, gender: gender === 'male' ? 'Male' : 'Female' };
}

async function seedMainAttendance() {
  try {
    console.log('🌱 Starting main attendance system seeding...');
    console.log('📊 Target: 360 students across CSE (180) and AIML (180) with 2 sections each');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Step 1: Get or create admin user first
    let adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@itm.edu.in',
        password: hashedPassword,
        role: 'admin',
        phone: '9999999999',
        isActive: true,
        profileCompleted: true
      });
      console.log('✅ Admin user created: admin@itm.edu.in');
    }

    // Step 2: Get or create college
    let college = await College.findOne();
    if (!college) {
      college = await College.create({
        name: 'Institute of Technology and Management',
        shortName: 'ITM',
        establishedYear: 2015,
        collegeType: 'Private',
        registrationNumber: 'ITM2015REG',
        addressStreet: 'Tech Park Road',
        addressCity: 'Bangalore',
        addressState: 'Karnataka',
        addressPincode: '560001',
        addressCountry: 'India',
        phone: '8012345678',
        email: 'info@itm.edu.in',
        website: 'https://itm.edu.in',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        accentColor: '#60a5fa',
        backgroundColor: '#ffffff',
        adminId: adminUser.id,
        profileCompleted: true,
        setupStep: 5,
        isActive: true
      });
      console.log('✅ College created:', college.name);
      
      // Update admin user with collegeId
      await adminUser.update({ collegeId: college.id });
    } else {
      console.log('✅ Using existing college:', college.name);
    }

    // Step 2: Create departments (CSE and AIML)
    const departmentsData = [
      {
        name: 'Computer Science and Engineering',
        code: 'CSE',
        shortName: 'CSE',
        hodName: 'Dr. Rajesh Kumar',
        hodEmail: 'hod.cse@itm.edu.in',
        hodPhone: '9876543210',
        description: 'Department of Computer Science and Engineering',
        establishedYear: 2015,
        studentsPerSection: 90,
        totalSections: 2,
        totalIntake: 180
      },
      {
        name: 'Artificial Intelligence and Machine Learning',
        code: 'AIML',
        shortName: 'AI & ML',
        hodName: 'Dr. Priya Sharma',
        hodEmail: 'hod.aiml@itm.edu.in',
        hodPhone: '9876543211',
        description: 'Department of Artificial Intelligence and Machine Learning',
        establishedYear: 2020,
        studentsPerSection: 90,
        totalSections: 2,
        totalIntake: 180
      }
    ];

    const departments = [];
    for (const deptData of departmentsData) {
      let dept = await Department.findOne({
        where: { code: deptData.code, collegeId: college.id }
      });
      
      if (!dept) {
        dept = await Department.create({
          ...deptData,
          collegeId: college.id,
          isActive: true
        });
      }
      departments.push(dept);
      console.log(`✅ Department created: ${dept.name}`);
    }

    // Step 3: Create faculty for both departments
    const facultyData = [
      {
        name: 'Dr. Amit Singh',
        email: 'amit.singh@itm.edu.in',
        employeeId: 'FAC001',
        departmentIndex: 0, // CSE
        designation: 'Professor',
        qualification: 'Ph.D. in Computer Science',
        specialization: 'Data Structures and Algorithms'
      },
      {
        name: 'Dr. Sneha Reddy',
        email: 'sneha.reddy@itm.edu.in',
        employeeId: 'FAC002',
        departmentIndex: 0, // CSE
        designation: 'Associate Professor',
        qualification: 'Ph.D. in Software Engineering',
        specialization: 'Database Management Systems'
      },
      {
        name: 'Dr. Karthik Iyer',
        email: 'karthik.iyer@itm.edu.in',
        employeeId: 'FAC003',
        departmentIndex: 1, // AIML
        designation: 'Professor',
        qualification: 'Ph.D. in Artificial Intelligence',
        specialization: 'Machine Learning'
      },
      {
        name: 'Dr. Divya Nair',
        email: 'divya.nair@itm.edu.in',
        employeeId: 'FAC004',
        departmentIndex: 1, // AIML
        designation: 'Assistant Professor',
        qualification: 'Ph.D. in Deep Learning',
        specialization: 'Neural Networks'
      }
    ];

    const faculties = [];
    for (const facData of facultyData) {
      let facultyUser = await User.findOne({ where: { email: facData.email } });
      
      if (!facultyUser) {
        facultyUser = await User.create({
          collegeId: college.id,
          name: facData.name,
          email: facData.email,
          password: hashedPassword,
          role: 'faculty',
          phone: `98765432${10 + faculties.length}`,
          isActive: true,
          profileCompleted: true
        });

        const faculty = await Faculty.create({
          userId: facultyUser.id,
          collegeId: college.id,
          departmentId: departments[facData.departmentIndex].id,
          employeeId: facData.employeeId,
          designation: facData.designation,
          qualification: facData.qualification,
          specialization: facData.specialization,
          experience: 5 + faculties.length,
          joiningDate: '2020-01-01',
          employmentType: 'Permanent',
          dateOfBirth: '1980-01-15',
          gender: facData.name.includes('Dr.') && (facData.name.includes('Sneha') || facData.name.includes('Divya')) ? 'Female' : 'Male',
          salary: 80000 + (faculties.length * 5000),
          bloodGroup: 'O+',
          isActive: true
        });
        faculties.push(faculty);
      } else {
        const faculty = await Faculty.findOne({ where: { userId: facultyUser.id } });
        if (faculty) faculties.push(faculty);
      }
    }
    console.log(`✅ ${faculties.length} faculty members created`);

    // Step 4: Create courses for both departments
    const coursesData = [
      // CSE Courses
      {
        code: 'CSE301',
        name: 'Data Structures and Algorithms',
        shortName: 'DSA',
        description: 'Advanced data structures and algorithm design',
        credits: 4,
        semester: 3,
        courseType: 'Core',
        departmentIndex: 0,
        theoryHours: 3,
        labHours: 2
      },
      {
        code: 'CSE302',
        name: 'Database Management Systems',
        shortName: 'DBMS',
        description: 'Relational database design, SQL, and transactions',
        credits: 4,
        semester: 3,
        courseType: 'Core',
        departmentIndex: 0,
        theoryHours: 3,
        labHours: 2
      },
      {
        code: 'CSE303',
        name: 'Operating Systems',
        shortName: 'OS',
        description: 'Process management, memory management, file systems',
        credits: 3,
        semester: 3,
        courseType: 'Core',
        departmentIndex: 0,
        theoryHours: 3,
        labHours: 0
      },
      {
        code: 'CSE304',
        name: 'Computer Networks',
        shortName: 'CN',
        description: 'Network protocols, TCP/IP, and network security',
        credits: 4,
        semester: 3,
        courseType: 'Core',
        departmentIndex: 0,
        theoryHours: 3,
        labHours: 2
      },
      // AIML Courses
      {
        code: 'AIML301',
        name: 'Machine Learning Fundamentals',
        shortName: 'ML',
        description: 'Supervised and unsupervised learning algorithms',
        credits: 4,
        semester: 3,
        courseType: 'Core',
        departmentIndex: 1,
        theoryHours: 3,
        labHours: 2
      },
      {
        code: 'AIML302',
        name: 'Deep Learning',
        shortName: 'DL',
        description: 'Neural networks, CNNs, and RNNs',
        credits: 4,
        semester: 3,
        courseType: 'Core',
        departmentIndex: 1,
        theoryHours: 3,
        labHours: 2
      },
      {
        code: 'AIML303',
        name: 'Natural Language Processing',
        shortName: 'NLP',
        description: 'Text processing, sentiment analysis, transformers',
        credits: 3,
        semester: 3,
        courseType: 'Core',
        departmentIndex: 1,
        theoryHours: 3,
        labHours: 0
      },
      {
        code: 'AIML304',
        name: 'Computer Vision',
        shortName: 'CV',
        description: 'Image processing, object detection, segmentation',
        credits: 4,
        semester: 3,
        courseType: 'Core',
        departmentIndex: 1,
        theoryHours: 3,
        labHours: 2
      }
    ];

    const courses = [];
    for (const courseData of coursesData) {
      let course = await Course.findOne({
        where: { code: courseData.code, collegeId: college.id }
      });

      if (!course) {
        course = await Course.create({
          collegeId: college.id,
          departmentId: departments[courseData.departmentIndex].id,
          code: courseData.code,
          name: courseData.name,
          shortName: courseData.shortName,
          description: courseData.description,
          credits: courseData.credits,
          semester: courseData.semester,
          courseType: courseData.courseType,
          theoryHours: courseData.theoryHours,
          labHours: courseData.labHours,
          tutorialHours: 0,
          isActive: true
        });
      }
      courses.push(course);
    }
    console.log(`✅ ${courses.length} courses created`);

    // Step 5: Create sections (2 per department = 4 total)
    const sectionsData = [
      // CSE Sections
      { name: 'Section A', code: 'CSE-3A-2024', departmentIndex: 0, batch: '2024', semester: 3, maxCapacity: 90 },
      { name: 'Section B', code: 'CSE-3B-2024', departmentIndex: 0, batch: '2024', semester: 3, maxCapacity: 90 },
      // AIML Sections
      { name: 'Section A', code: 'AIML-3A-2024', departmentIndex: 1, batch: '2024', semester: 3, maxCapacity: 90 },
      { name: 'Section B', code: 'AIML-3B-2024', departmentIndex: 1, batch: '2024', semester: 3, maxCapacity: 90 }
    ];

    const sections = [];
    for (let i = 0; i < sectionsData.length; i++) {
      const sectionData = sectionsData[i];
      let section = await Section.findOne({
        where: { code: sectionData.code, collegeId: college.id }
      });

      if (!section) {
        section = await Section.create({
          collegeId: college.id,
          departmentId: departments[sectionData.departmentIndex].id,
          name: sectionData.name,
          code: sectionData.code,
          batch: sectionData.batch,
          semester: sectionData.semester,
          maxCapacity: sectionData.maxCapacity,
          currentStrength: 0,
          classTeacherId: faculties[sectionData.departmentIndex * 2].id, // Assign faculty as class teacher
          isActive: true
        });
      }
      sections.push(section);
    }
    console.log(`✅ ${sections.length} sections created`);

    // Step 6: Create 360 students (90 per section)
    console.log('📝 Creating 360 students...');
    const studentsPerSection = 90;
    let totalStudentsCreated = 0;

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex];
      const department = departments[Math.floor(sectionIndex / 2)];
      const deptCode = department.code;
      const sectionCode = sectionIndex % 2 === 0 ? 'A' : 'B';
      
      console.log(`\n  Creating students for ${deptCode} Section ${sectionCode}...`);
      
      for (let i = 0; i < studentsPerSection; i++) {
        const studentNumber = (sectionIndex * studentsPerSection) + i + 1;
        const rollNumber = `${deptCode}2024${String(studentNumber).padStart(3, '0')}`;
        const { name, gender } = generateStudentName(studentNumber);
        const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${rollNumber.toLowerCase()}@itm.edu.in`;

        // Check if student already exists
        let studentUser = await User.findOne({ where: { email } });
        
        if (!studentUser) {
          studentUser = await User.create({
            collegeId: college.id,
            name: name,
            email: email,
            password: hashedPassword,
            role: 'student',
            phone: `98${String(studentNumber).padStart(8, '0')}`,
            isActive: true,
            profileCompleted: true
          });

          await Student.create({
            userId: studentUser.id,
            collegeId: college.id,
            departmentId: department.id,
            sectionId: section.id,
            rollNumber: rollNumber,
            enrollmentNumber: `E${rollNumber}`,
            studentId: rollNumber,
            batch: '2024',
            program: 'B.Tech',
            admissionYear: 2024,
            currentSemester: 3,
            dateOfBirth: `200${Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            gender: gender,
            category: ['General', 'OBC', 'SC', 'ST'][Math.floor(Math.random() * 4)],
            nationality: 'Indian',
            guardianName: `${name.split(' ')[1]} (Parent)`,
            guardianRelation: 'Father',
            guardianPhone: `987${String(studentNumber).padStart(7, '0')}`,
            guardianEmail: `parent.${email}`,
            isActive: true
          });

          totalStudentsCreated++;
        }
      }

      // Update section strength
      await section.update({ currentStrength: studentsPerSection });
      console.log(`  ✅ ${studentsPerSection} students created for ${deptCode} Section ${sectionCode}`);
    }

    console.log(`\n✅ Total students created: ${totalStudentsCreated}`);

    // Step 7: Create classrooms
    const classroomData = [
      // Main lecture halls
      { roomNumber: 'A-101', building: 'Academic Block A', floor: 1, capacity: 100, roomType: 'lecture_hall' },
      { roomNumber: 'A-102', building: 'Academic Block A', floor: 1, capacity: 100, roomType: 'lecture_hall' },
      { roomNumber: 'A-201', building: 'Academic Block A', floor: 2, capacity: 100, roomType: 'lecture_hall' },
      { roomNumber: 'A-202', building: 'Academic Block A', floor: 2, capacity: 100, roomType: 'lecture_hall' },
      // Labs
      { roomNumber: 'B-101', building: 'Academic Block B', floor: 1, capacity: 60, roomType: 'laboratory' },
      { roomNumber: 'B-102', building: 'Academic Block B', floor: 1, capacity: 60, roomType: 'laboratory' },
      { roomNumber: 'B-201', building: 'Academic Block B', floor: 2, capacity: 60, roomType: 'laboratory' },
      { roomNumber: 'B-202', building: 'Academic Block B', floor: 2, capacity: 60, roomType: 'laboratory' }
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

    // Step 8: Create timetable entries for demo (without specific dates)
    console.log('📅 Creating timetable entries...');
    
    const timetableEntries = [];
    const today = new Date();
    const currentAcademicYear = `${today.getFullYear()}-${today.getFullYear() + 1}`;
    const effectiveFrom = new Date(today.getFullYear(), 0, 1);

    // Create timetable for each section
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex];
      const departmentIndex = Math.floor(sectionIndex / 2);
      const sectionCourses = courses.filter(c => c.departmentId === departments[departmentIndex].id);
      const sectionFaculty = faculties.filter(f => f.departmentId === departments[departmentIndex].id);

      // Monday to Friday, 4 periods per day
      for (let day = 1; day <= 5; day++) {
        for (let period = 1; period <= 4; period++) {
          const courseIndex = ((day - 1) * 4 + period - 1) % sectionCourses.length;
          const course = sectionCourses[courseIndex];
          const facultyMember = sectionFaculty[courseIndex % sectionFaculty.length];
          const classroom = classrooms[(sectionIndex * 2 + period - 1) % classrooms.length];

          const startHour = 8 + period;
          const endHour = startHour + 1;

          timetableEntries.push({
            collegeId: college.id,
            departmentId: section.departmentId,
            sectionId: section.id,
            courseId: course.id,
            facultyId: facultyMember.id,
            classroomId: classroom.id,
            dayOfWeek: day,
            period: period,
            startTime: `${String(startHour).padStart(2, '0')}:00:00`,
            endTime: `${String(endHour).padStart(2, '0')}:00:00`,
            classType: period === 4 ? 'practical' : 'theory',
            academicYear: currentAcademicYear,
            semester: 3,
            effectiveFrom: effectiveFrom,
            isActive: true
          });
        }
      }
    }

    // Insert all timetable entries
    let timetableCount = 0;
    for (const entry of timetableEntries) {
      const existing = await Timetable.findOne({
        where: {
          collegeId: entry.collegeId,
          sectionId: entry.sectionId,
          courseId: entry.courseId,
          dayOfWeek: entry.dayOfWeek,
          period: entry.period
        }
      });

      if (!existing) {
        await Timetable.create(entry);
        timetableCount++;
      }
    }
    console.log(`✅ ${timetableCount} timetable entries created`);

    console.log('\n🎉 ================================');
    console.log('✅ MAIN ATTENDANCE SYSTEM SEEDING COMPLETED!');
    console.log('🎉 ================================\n');
    
    console.log('📊 Summary:');
    console.log(`   • College: ${college.name}`);
    console.log(`   • Departments: 2 (CSE, AIML)`);
    console.log(`   • Sections: 4 (2 per department)`);
    console.log(`   • Students: 360 (90 per section)`);
    console.log(`   • Faculty: ${faculties.length}`);
    console.log(`   • Courses: ${courses.length}`);
    console.log(`   • Classrooms: ${classrooms.length}`);
    console.log(`   • Timetable Entries: ${timetableCount}`);
    
    console.log('\n📋 Login Credentials:');
    console.log('   Faculty:');
    facultyData.forEach((fac, index) => {
      console.log(`   ${index + 1}. ${fac.email} / password123`);
    });
    console.log('\n   Students:');
    console.log('   • CSE Section A: aarav.kumar.cse2024001@itm.edu.in / password123');
    console.log('   • CSE Section B: aarav.kumar.cse2024091@itm.edu.in / password123');
    console.log('   • AIML Section A: aarav.kumar.aiml2024181@itm.edu.in / password123');
    console.log('   • AIML Section B: aarav.kumar.aiml2024271@itm.edu.in / password123');
    console.log('   (All students have password: password123)');
    
    console.log('\n🎯 Attendance System Features:');
    console.log('   ✓ Faculty can view their classes from timetable');
    console.log('   ✓ Mark attendance by section and course');
    console.log('   ✓ View attendance summary and reports');
    console.log('   ✓ Update/modify attendance records');
    console.log('   ✓ Track student attendance percentage');
    
    console.log('\n🚀 Next Steps for Hackathon Demo:');
    console.log('   1. Login as any faculty member');
    console.log('   2. Navigate to Attendance section');
    console.log('   3. View sections and their students');
    console.log('   4. Mark attendance for demo');
    console.log('   5. View attendance reports\n');

  } catch (error) {
    console.error('❌ Error seeding main attendance data:', error);
    throw error;
  }
}

// Run the seeding
seedMainAttendance()
  .then(() => {
    console.log('✅ Main attendance seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Main attendance seeding failed:', error);
    process.exit(1);
  });

