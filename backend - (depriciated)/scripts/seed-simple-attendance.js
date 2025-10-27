const { sequelize } = require('../src/shared/db/database');
const User = require('../src/shared/db/models/postgresql/User');
const College = require('../src/shared/db/models/postgresql/College');
const Department = require('../src/shared/db/models/postgresql/Department');
const Faculty = require('../src/shared/db/models/postgresql/Faculty');
const Student = require('../src/shared/db/models/postgresql/Student');
const Section = require('../src/shared/db/models/postgresql/Section');
const bcrypt = require('bcryptjs');

async function seedSimpleAttendance() {
  try {
    console.log('🌱 Creating SIMPLE attendance demo data...');
    console.log('   - 1 College');
    console.log('   - 1 Department (CSE)');
    console.log('   - 2 Sections (60 students each)');
    console.log('   - 120 Total Students');
    console.log('   - 1 Faculty member\n');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Step 1: Get or create college
    let college = await College.findOne();
    if (!college) {
      college = await College.create({
        name: 'Demo College',
        shortName: 'DC',
        establishedYear: 2020,
        collegeType: 'Engineering',
        registrationNumber: 'DC2020',
        addressStreet: '123 Demo Street',
        addressCity: 'Bangalore',
        addressState: 'Karnataka',
        addressPincode: '560001',
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
    } else {
      console.log('✅ Using existing college');
    }

    // Step 2: Create CSE Department
    let department = await Department.findOne({
      where: { code: 'CSE', collegeId: college.id }
    });

    if (!department) {
      department = await Department.create({
        collegeId: college.id,
        name: 'Computer Science Engineering',
        code: 'CSE',
        shortName: 'CSE',
        totalIntake: 120,
        establishedYear: 2020,
        isActive: true
      });
      console.log('✅ CSE Department created');
    } else {
      console.log('✅ Using existing CSE department');
    }

    // Step 3: Create Faculty
    let facultyUser = await User.findOne({ where: { email: 'faculty@demo.edu' } });
    let faculty;

    if (!facultyUser) {
      facultyUser = await User.create({
        collegeId: college.id,
        name: 'Dr. John Doe',
        email: 'faculty@demo.edu',
        password: hashedPassword,
        role: 'faculty',
        phone: '9876543210',
        isActive: true,
        profileCompleted: true
      });

      faculty = await Faculty.create({
        userId: facultyUser.id,
        collegeId: college.id,
        departmentId: department.id,
        employeeId: 'FAC001',
        designation: 'Professor',
        qualification: 'Ph.D.',
        specialization: 'Computer Science',
        experience: 10,
        joiningDate: new Date('2020-01-01'),
        isActive: true
      });
      console.log('✅ Faculty created: faculty@demo.edu');
    } else {
      faculty = await Faculty.findOne({ where: { userId: facultyUser.id } });
      console.log('✅ Using existing faculty');
    }

    // Step 4: Create 2 Sections
    const sections = [];
    const sectionNames = ['Section A', 'Section B'];
    
    for (let i = 0; i < 2; i++) {
      let section = await Section.findOne({
        where: { code: `CSE-A${i + 1}-2024`, collegeId: college.id }
      });

      if (!section) {
        section = await Section.create({
          collegeId: college.id,
          departmentId: department.id,
          name: sectionNames[i],
          code: `CSE-A${i + 1}-2024`,
          batch: '2024',
          semester: 3,
          maxCapacity: 60,
          currentStrength: 0,
          isActive: true
        });
      }
      sections.push(section);
    }
    console.log('✅ 2 Sections created');

    // Step 5: Create 120 students (60 per section)
    const firstNames = [
      'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
      'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advait', 'Vedant', 'Ansh', 'Aryan', 'Reyansh', 'Dhruv',
      'Aadhya', 'Ananya', 'Diya', 'Ira', 'Myra', 'Sara', 'Aanya', 'Pari', 'Navya', 'Riya',
      'Kiara', 'Aaradhya', 'Saanvi', 'Kavya', 'Shanaya', 'Krisha', 'Anika', 'Tara', 'Pihu', 'Vanya',
      'Rahul', 'Rohan', 'Amit', 'Karan', 'Vikram', 'Nikhil', 'Akash', 'Varun', 'Harsh', 'Siddharth',
      'Priya', 'Neha', 'Pooja', 'Sneha', 'Anjali', 'Divya', 'Kavita', 'Sakshi', 'Simran', 'Tanvi'
    ];

    const lastNames = [
      'Kumar', 'Sharma', 'Patel', 'Singh', 'Verma', 'Reddy', 'Nair', 'Gupta', 'Joshi', 'Mehta',
      'Desai', 'Raj', 'Rao', 'Iyer', 'Krishnan', 'Pillai', 'Das', 'Bhat', 'Malhotra', 'Kapoor'
    ];

    let totalStudents = 0;

    for (let sectionIndex = 0; sectionIndex < 2; sectionIndex++) {
      console.log(`\n📝 Creating students for ${sectionNames[sectionIndex]}...`);
      
      for (let i = 1; i <= 60; i++) {
        const studentNumber = (sectionIndex * 60) + i;
        const rollNumber = `CSE2024${String(studentNumber).padStart(3, '0')}`;
        const firstName = firstNames[studentNumber % firstNames.length];
        const lastName = lastNames[Math.floor(studentNumber / firstNames.length) % lastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentNumber}@demo.edu`;

        // Check if student already exists
        const existingStudent = await Student.findOne({
          where: { rollNumber: rollNumber }
        });

        if (!existingStudent) {
          // Create user
          const studentUser = await User.create({
            collegeId: college.id,
            name: fullName,
            email: email,
            password: hashedPassword,
            role: 'student',
            phone: `98765${String(43210 + studentNumber).slice(-5)}`,
            isActive: true,
            profileCompleted: true
          });

          // Create student
          await Student.create({
            userId: studentUser.id,
            collegeId: college.id,
            departmentId: department.id,
            sectionId: sections[sectionIndex].id,
            rollNumber: rollNumber,
            enrollmentNumber: `E${rollNumber}`,
            studentId: rollNumber,
            batch: '2024',
            program: 'B.Tech',
            admissionYear: 2024,
            currentSemester: 3,
            dateOfBirth: '2003-01-15',
            gender: studentNumber % 2 === 0 ? 'Male' : 'Female',
            category: 'General',
            nationality: 'Indian',
            guardianName: `Parent of ${fullName}`,
            guardianRelation: 'Father',
            guardianPhone: `987654${String(3210 + studentNumber).slice(-4)}`,
            guardianEmail: `parent${studentNumber}@gmail.com`,
            isActive: true,
            admissionStatus: 'enrolled'
          });

          totalStudents++;
        }
      }

      // Update section strength
      await sections[sectionIndex].update({ currentStrength: 60 });
      console.log(`   ✅ 60 students created for ${sectionNames[sectionIndex]}`);
    }

    console.log(`\n✅ TOTAL: ${totalStudents} students created successfully!`);
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('   Faculty: faculty@demo.edu / password123');
    console.log('   Student: aarav.kumar1@demo.edu / password123');
    console.log('\n🎯 DEMO READY!');
    console.log('   1. Login as faculty');
    console.log('   2. Go to /staff/attendance');
    console.log('   3. Select a section and mark attendance');
    console.log('   4. View all department attendance in the View tab\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run the seeding
seedSimpleAttendance()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

