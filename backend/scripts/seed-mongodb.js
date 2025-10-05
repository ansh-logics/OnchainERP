#!/usr/bin/env node

/**
 * MongoDB Seeding Script
 * Seeds MongoDB with initial data for the ERP system
 */

const { connectDatabases } = require('../src/shared/db/database');
const mongoModels = require('../src/shared/db/models/mongodb');
const { dbSync } = require('../src/shared/db/dbSync');
const bcrypt = require('bcryptjs');

class MongoSeeder {
  constructor() {
    this.seededData = {
      users: [],
      colleges: [],
      departments: [],
      faculty: [],
      students: [],
      sections: []
    };
  }

  async seedMongoDB() {
    console.log('🌱 Starting MongoDB Seeding Process...\n');
    
    try {
      // Connect to databases
      await connectDatabases();
      console.log('✅ Connected to databases\n');

      // Clear existing data (optional)
      if (process.argv.includes('--clear')) {
        await this.clearExistingData();
      }

      // Seed in order (to maintain referential integrity)
      await this.seedUsers();
      await this.seedColleges();
      await this.seedDepartments();
      await this.seedFaculty();
      await this.seedSections();
      await this.seedStudents();
      await this.seedAssignments();
      await this.seedAttendance();

      console.log('\n🎉 MongoDB seeding completed successfully!');
      console.log('\n📊 Seeded Data Summary:');
      Object.entries(this.seededData).forEach(([key, value]) => {
        console.log(`├── ${key}: ${Array.isArray(value) ? value.length : 0} records`);
      });

      console.log('\n🔧 Next Steps:');
      console.log('1. Set USE_MONGODB=true in your environment');
      console.log('2. Start the backend server');
      console.log('3. Test the frontend functionality');
      console.log('4. Monitor MongoDB connection and performance\n');

    } catch (error) {
      console.error('❌ MongoDB seeding failed:', error);
      throw error;
    }
  }

  async clearExistingData() {
    console.log('🧹 Clearing existing MongoDB data...');
    
    const collections = [
      'users', 'colleges', 'departments', 'faculty', 'students', 
      'sections', 'assignments', 'attendance', 'courses', 'fees'
    ];

    for (const collection of collections) {
      try {
        await mongoModels.mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`  ✅ Cleared ${collection} collection`);
      } catch (error) {
        console.log(`  ⚠️ Collection ${collection} not found or already empty`);
      }
    }
    console.log('');
  }

  async seedUsers() {
    console.log('👥 Seeding Users...');
    
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const users = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@teccollege.edu.in',
        phone: '9876543210',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isVerified: true,
        isApproved: true
      },
      {
        firstName: 'Dr. Sunita',
        lastName: 'Reddy',
        email: 'sunita.reddy.cse.0@teccollege.edu.in',
        phone: '9345678901',
        password: hashedPassword,
        role: 'faculty',
        isActive: true,
        isVerified: true,
        isApproved: true
      },
      {
        firstName: 'Dr. Mahesh',
        lastName: 'Rao',
        email: 'mahesh.rao.cse.1@teccollege.edu.in',
        phone: '9456789012',
        password: hashedPassword,
        role: 'faculty',
        isActive: true,
        isVerified: true,
        isApproved: true
      },
      {
        firstName: 'Rahul',
        lastName: 'Gupta',
        email: 'student.cse.2024.001@student.teccollege.edu.in',
        phone: '9123456789',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        isVerified: true,
        isApproved: true
      },
      {
        firstName: 'Sneha',
        lastName: 'Verma',
        email: 'student.cse.2024.002@student.teccollege.edu.in',
        phone: '9234567890',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        isVerified: true,
        isApproved: true
      }
    ];

    this.seededData.users = await mongoModels.User.insertMany(users);
    console.log(`  ✅ Created ${this.seededData.users.length} users`);
  }

  async seedColleges() {
    console.log('🏫 Seeding Colleges...');
    
    const adminUser = this.seededData.users.find(u => u.role === 'admin');
    
    const colleges = [
      {
        name: 'Technology Excellence College',
        code: 'TEC',
        shortName: 'TEC College',
        email: 'info@teccollege.edu.in',
        phone: '044-12345678',
        website: 'https://teccollege.edu.in',
        address: '123 Technology Park, Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pincode: '600040',
        adminId: adminUser._id,
        established: new Date('2010-06-15'),
        affiliation: 'Anna University',
        accreditation: 'NAAC A+',
        status: 'active'
      }
    ];

    this.seededData.colleges = await mongoModels.College.insertMany(colleges);
    
    // Update admin user with college ID
    await mongoModels.User.updateOne(
      { _id: adminUser._id },
      { collegeId: this.seededData.colleges[0]._id }
    );

    console.log(`  ✅ Created ${this.seededData.colleges.length} colleges`);
  }

  async seedDepartments() {
    console.log('🏛️ Seeding Departments...');
    
    const college = this.seededData.colleges[0];
    
    const departments = [
      {
        name: 'Computer Science and Engineering',
        code: 'CSE',
        collegeId: college._id,
        description: 'Department of Computer Science and Engineering',
        established: new Date('2010-06-15'),
        email: 'cse@teccollege.edu.in',
        phone: '044-12345679'
      },
      {
        name: 'Electronics and Communication Engineering',
        code: 'ECE',
        collegeId: college._id,
        description: 'Department of Electronics and Communication Engineering',
        established: new Date('2010-06-15'),
        email: 'ece@teccollege.edu.in',
        phone: '044-12345680'
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        collegeId: college._id,
        description: 'Department of Mechanical Engineering',
        established: new Date('2010-06-15'),
        email: 'me@teccollege.edu.in',
        phone: '044-12345681'
      }
    ];

    this.seededData.departments = await mongoModels.Department.insertMany(departments);
    console.log(`  ✅ Created ${this.seededData.departments.length} departments`);
  }

  async seedFaculty() {
    console.log('👨‍🏫 Seeding Faculty...');
    
    const college = this.seededData.colleges[0];
    const cseDept = this.seededData.departments.find(d => d.code === 'CSE');
    const facultyUsers = this.seededData.users.filter(u => u.role === 'faculty');
    
    const faculty = [
      {
        userId: facultyUsers[0]._id,
        collegeId: college._id,
        departmentId: cseDept._id,
        facultyId: 'FACCSE001',
        employeeId: 'EMP001',
        designation: 'Professor',
        qualification: 'Ph.D. in Computer Science',
        specialization: ['Machine Learning', 'Data Science'],
        experience: 15,
        joiningDate: new Date('2010-07-01'),
        employmentType: 'permanent',
        dateOfBirth: new Date('1980-05-15'),
        gender: 'Female',
        employmentStatus: 'active'
      },
      {
        userId: facultyUsers[1]._id,
        collegeId: college._id,
        departmentId: cseDept._id,
        facultyId: 'FACCSE002',
        employeeId: 'EMP002',
        designation: 'Associate Professor',
        qualification: 'Ph.D. in Computer Science',
        specialization: ['Software Engineering', 'Database Systems'],
        experience: 12,
        joiningDate: new Date('2012-08-01'),
        employmentType: 'permanent',
        dateOfBirth: new Date('1982-09-22'),
        gender: 'Male',
        employmentStatus: 'active'
      }
    ];

    this.seededData.faculty = await mongoModels.Faculty.insertMany(faculty);
    
    // Update faculty users with college ID
    for (let i = 0; i < facultyUsers.length; i++) {
      await mongoModels.User.updateOne(
        { _id: facultyUsers[i]._id },
        { collegeId: college._id }
      );
    }

    console.log(`  ✅ Created ${this.seededData.faculty.length} faculty records`);
  }

  async seedSections() {
    console.log('📚 Seeding Sections...');
    
    const college = this.seededData.colleges[0];
    const cseDept = this.seededData.departments.find(d => d.code === 'CSE');
    const classTeacher = this.seededData.faculty[0];
    
    const sections = [
      {
        name: 'CSE-A',
        code: 'CSE-A-2024',
        collegeId: college._id,
        departmentId: cseDept._id,
        batch: '2024',
        semester: 1,
        academicYear: '2024-25',
        maxStrength: 60,
        currentStrength: 2,
        classTeacherId: classTeacher._id,
        status: 'active'
      },
      {
        name: 'CSE-B',
        code: 'CSE-B-2024',
        collegeId: college._id,
        departmentId: cseDept._id,
        batch: '2024',
        semester: 1,
        academicYear: '2024-25',
        maxStrength: 60,
        currentStrength: 0,
        classTeacherId: classTeacher._id,
        status: 'active'
      }
    ];

    this.seededData.sections = await mongoModels.Section.insertMany(sections);
    console.log(`  ✅ Created ${this.seededData.sections.length} sections`);
  }

  async seedStudents() {
    console.log('👨‍🎓 Seeding Students...');
    
    const college = this.seededData.colleges[0];
    const cseDept = this.seededData.departments.find(d => d.code === 'CSE');
    const section = this.seededData.sections[0];
    const studentUsers = this.seededData.users.filter(u => u.role === 'student');
    
    const students = [
      {
        userId: studentUsers[0]._id,
        collegeId: college._id,
        departmentId: cseDept._id,
        sectionId: section._id,
        rollNumber: '24CSE001',
        enrollmentNumber: '2024CSE001',
        studentId: 'CSE2024001',
        batch: '2024',
        program: 'B.Tech Computer Science',
        admissionYear: 2024,
        currentSemester: 1,
        dateOfBirth: new Date('2005-03-10'),
        gender: 'Male',
        category: 'General',
        nationality: 'Indian',
        fatherName: 'Rajesh Gupta',
        motherName: 'Sunita Gupta',
        permanentAddress: '456 MG Road, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        admissionStatus: 'admitted',
        academicStatus: 'active'
      },
      {
        userId: studentUsers[1]._id,
        collegeId: college._id,
        departmentId: cseDept._id,
        sectionId: section._id,
        rollNumber: '24CSE002',
        enrollmentNumber: '2024CSE002',
        studentId: 'CSE2024002',
        batch: '2024',
        program: 'B.Tech Computer Science',
        admissionYear: 2024,
        currentSemester: 1,
        dateOfBirth: new Date('2005-07-18'),
        gender: 'Female',
        category: 'General',
        nationality: 'Indian',
        fatherName: 'Anil Verma',
        motherName: 'Priya Verma',
        permanentAddress: '789 Park Street, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        admissionStatus: 'admitted',
        academicStatus: 'active'
      }
    ];

    this.seededData.students = await mongoModels.Student.insertMany(students);
    
    // Update student users with college ID
    for (let i = 0; i < studentUsers.length; i++) {
      await mongoModels.User.updateOne(
        { _id: studentUsers[i]._id },
        { collegeId: college._id }
      );
    }

    console.log(`  ✅ Created ${this.seededData.students.length} student records`);
  }

  async seedAssignments() {
    console.log('📝 Seeding Assignments...');
    
    const section = this.seededData.sections[0];
    const faculty = this.seededData.faculty[0];
    
    const assignments = [
      {
        sectionId: section._id,
        facultyId: faculty._id,
        title: 'Introduction to Programming',
        description: 'Create a simple "Hello World" program in your preferred programming language.',
        instructions: 'Write a program that prints "Hello World" to the console. Submit as a .py, .java, or .cpp file.',
        assignmentType: 'individual',
        submissionFormat: 'code',
        maxMarks: 10,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        submissionStartDate: new Date(),
        submissionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        allowLateSubmission: true,
        lateSubmissionPenalty: 2,
        allowedFileTypes: ['py', 'java', 'cpp', 'c', 'js'],
        maxFileSize: 1048576, // 1MB
        maxFiles: 1,
        status: 'active'
      },
      {
        sectionId: section._id,
        facultyId: faculty._id,
        title: 'Data Structures Assignment',
        description: 'Implement basic data structures: Stack, Queue, and Linked List.',
        instructions: 'Create implementations for Stack, Queue, and Linked List with basic operations. Include test cases.',
        assignmentType: 'individual',
        submissionFormat: 'code',
        maxMarks: 25,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        submissionStartDate: new Date(),
        submissionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        allowLateSubmission: true,
        lateSubmissionPenalty: 5,
        allowedFileTypes: ['py', 'java', 'cpp', 'c'],
        maxFileSize: 5242880, // 5MB
        maxFiles: 3,
        status: 'active'
      }
    ];

    const createdAssignments = await mongoModels.Assignment.insertMany(assignments);
    console.log(`  ✅ Created ${createdAssignments.length} assignments`);
  }

  async seedAttendance() {
    console.log('📊 Seeding Attendance...');
    
    const section = this.seededData.sections[0];
    const students = this.seededData.students;
    
    // Create attendance for the last 5 days
    const attendanceRecords = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      for (const student of students) {
        attendanceRecords.push({
          studentId: student._id,
          sectionId: section._id,
          date: date,
          status: Math.random() > 0.2 ? 'present' : 'absent' // 80% attendance rate
        });
      }
    }

    const createdAttendance = await mongoModels.Attendance.insertMany(attendanceRecords);
    console.log(`  ✅ Created ${createdAttendance.length} attendance records`);
  }
}

// Run the seeder
async function runSeeder() {
  const seeder = new MongoSeeder();
  
  try {
    await seeder.seedMongoDB();
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  console.log('🌱 MongoDB ERP Seeding Script');
  console.log('===============================\n');
  
  if (process.argv.includes('--help')) {
    console.log('Usage: node scripts/seed-mongodb.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --clear    Clear existing data before seeding');
    console.log('  --help     Show this help message');
    console.log('');
    process.exit(0);
  }
  
  runSeeder();
}

module.exports = MongoSeeder;
