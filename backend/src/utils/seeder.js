const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

// Import utilities
const { initializeRolesAndPermissions } = require('../utils/setupRoles');
const connectDB = require('../config/db');

// Connect to database
connectDB();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    department: 'Administration',
    contactNumber: '+1234567890',
    dateOfBirth: '1980-01-01',
    gender: 'male'
  },
  {
    name: 'Faculty User',
    email: 'faculty@example.com',
    password: 'password123',
    role: 'faculty',
    department: 'Computer Science',
    contactNumber: '+1234567891',
    dateOfBirth: '1985-01-01',
    gender: 'female',
    facultyId: 'FAC001'
  },
  {
    name: 'Student User',
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    contactNumber: '+1234567892',
    dateOfBirth: '2000-01-01',
    gender: 'male',
    studentId: 'STU001'
  }
];

const students = [
  {
    enrollmentNumber: 'CS2023001',
    batch: '2023-2027',
    program: 'B.Tech',
    currentSemester: 1
  }
];

const faculty = [
  {
    employeeId: 'CS2023001',
    designation: 'Assistant Professor',
    department: 'Computer Science',
    qualification: 'Ph.D in Computer Science',
    expertise: ['Programming', 'Algorithms', 'Data Structures'],
    joiningDate: '2023-01-01'
  }
];

const courses = [
  {
    code: 'CS101',
    name: 'Introduction to Programming',
    description: 'Fundamentals of programming concepts and techniques.',
    credits: 4,
    semester: 1,
    department: 'Computer Science',
    assignments: [
      {
        title: 'Hello World Program',
        description: 'Write a simple Hello World program in any language.',
        dueDate: '2023-09-15',
        totalMarks: 10
      },
      {
        title: 'Calculator Application',
        description: 'Create a simple calculator program with basic operations.',
        dueDate: '2023-10-15',
        totalMarks: 20
      }
    ],
    attendanceDates: [
      {
        date: '2023-08-01',
        topic: 'Course Introduction'
      },
      {
        date: '2023-08-08',
        topic: 'Variables and Data Types'
      }
    ]
  },
  {
    code: 'CS102',
    name: 'Data Structures',
    description: 'Study of common data structures and their applications.',
    credits: 4,
    semester: 2,
    department: 'Computer Science',
    assignments: [
      {
        title: 'Linked List Implementation',
        description: 'Implement a singly linked list with basic operations.',
        dueDate: '2023-09-20',
        totalMarks: 20
      },
      {
        title: 'Binary Search Tree',
        description: 'Implement a binary search tree with search, insert, and delete operations.',
        dueDate: '2023-10-20',
        totalMarks: 25
      }
    ],
    attendanceDates: [
      {
        date: '2023-08-05',
        topic: 'Arrays and Linked Lists'
      },
      {
        date: '2023-08-12',
        topic: 'Stacks and Queues'
      }
    ]
  }
];

// Import data function
const importData = async () => {
  try {
    // Initialize roles and permissions
    await initializeRolesAndPermissions();
    
    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Faculty.deleteMany();
    await Course.deleteMany();
    
    // Create users
    const createdUsers = await User.create(users);
    
    // Create admin user
    const adminUser = createdUsers[0];
    
    // Create faculty user
    const facultyUser = createdUsers[1];
    const facultyData = {
      ...faculty[0],
      user: facultyUser._id
    };
    const createdFaculty = await Faculty.create(facultyData);
    
    // Create student user
    const studentUser = createdUsers[2];
    const studentData = {
      ...students[0],
      user: studentUser._id
    };
    const createdStudent = await Student.create(studentData);
    
    // Create courses
    const coursesWithFaculty = courses.map(course => ({
      ...course,
      faculty: createdFaculty._id,
      students: [createdStudent._id]
    }));
    
    const createdCourses = await Course.create(coursesWithFaculty);
    
    // Add courses to faculty
    createdFaculty.courses = createdCourses.map(course => course._id);
    await createdFaculty.save();
    
    // Add courses to student
    createdStudent.courses = createdCourses.map(course => course._id);
    
    // Add assignments to student
    createdCourses.forEach(course => {
      course.assignments.forEach(assignment => {
        createdStudent.assignments.push({
          title: assignment.title,
          description: assignment.description,
          course: course._id,
          dueDate: assignment.dueDate,
          status: 'pending'
        });
      });
    });
    
    // Add attendance records for student
    createdCourses.forEach(course => {
      course.attendanceDates.forEach(date => {
        createdStudent.attendance.push({
          course: course._id,
          date: date.date,
          present: Math.random() > 0.2, // 80% chance of being present
          markedBy: facultyUser._id
        });
      });
    });
    
    await createdStudent.save();
    
    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data function
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Student.deleteMany();
    await Faculty.deleteMany();
    await Course.deleteMany();
    
    console.log('Data deleted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Determine action based on command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please specify an option: -i (import) or -d (delete)');
  process.exit();
}
