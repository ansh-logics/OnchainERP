const { sequelize } = require('../database');

// Import all models directly from postgresql folder to avoid circular dependencies
const User = require('./postgresql/User');
const College = require('./postgresql/College');
const Student = require('./postgresql/Student');
const Faculty = require('./postgresql/Faculty');
const Course = require('./postgresql/Course');
const Section = require('./postgresql/Section');
const Department = require('./postgresql/Department');
const Transaction = require('./postgresql/Transaction');
const Lab = require('./postgresql/Lab');

// Additional models
const Hostel = require('./postgresql/Hostel');
const HostelRoom = require('./postgresql/HostelRoom');
const HostelAllocation = require('./postgresql/HostelAllocation');
const Attendance = require('./postgresql/Attendance');
const Assignment = require('./postgresql/Assignment');
const AssignmentSubmission = require('./postgresql/AssignmentSubmission');
const Exam = require('./postgresql/Exam');
const ExamHall = require('./postgresql/ExamHall');
const ExamResult = require('./postgresql/ExamResult');
const LibraryBook = require('./postgresql/LibraryBook');
const LibraryIssue = require('./postgresql/LibraryIssue');
const Classroom = require('./postgresql/Classroom');
const Timetable = require('./postgresql/Timetable');

// MongoDB models (still centralized for now)
const mongoModels = require('./mongodb');

// Cross-module associations that need to be defined at the global level
// These are associations between models from different modules

// User cross-module associations
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
User.hasOne(Faculty, { foreignKey: 'userId', as: 'facultyProfile' });

// College cross-module associations
College.hasMany(Department, { foreignKey: 'collegeId', as: 'departments' });
College.hasMany(Student, { foreignKey: 'collegeId', as: 'students' });
College.hasMany(Faculty, { foreignKey: 'collegeId', as: 'faculty' });
College.hasMany(Course, { foreignKey: 'collegeId', as: 'courses' });
College.hasMany(Section, { foreignKey: 'collegeId', as: 'sections' });
College.hasMany(Transaction, { foreignKey: 'collegeId', as: 'transactions' });
College.hasMany(Lab, { foreignKey: 'collegeId', as: 'labs' });
College.hasMany(Hostel, { foreignKey: 'collegeId', as: 'hostels' });
College.hasMany(LibraryBook, { foreignKey: 'collegeId', as: 'libraryBooks' });
College.hasMany(ExamHall, { foreignKey: 'collegeId', as: 'examHalls' });
College.hasMany(Classroom, { foreignKey: 'collegeId', as: 'classrooms' });

// Student cross-module associations
Student.hasMany(Transaction, { foreignKey: 'studentId', as: 'transactions' });
Student.hasMany(HostelAllocation, { foreignKey: 'studentId', as: 'hostelAllocations' });
Student.hasMany(LibraryIssue, { foreignKey: 'studentId', as: 'libraryIssues' });
Student.hasMany(AssignmentSubmission, { foreignKey: 'studentId', as: 'assignmentSubmissions' });
Student.hasMany(ExamResult, { foreignKey: 'studentId', as: 'examResults' });

// Faculty cross-module associations
Faculty.hasMany(Section, { foreignKey: 'classTeacherId', as: 'sections' });
Department.hasMany(Faculty, { foreignKey: 'departmentId', as: 'faculty' });

// Course cross-module associations
Course.hasMany(Attendance, { foreignKey: 'courseId', as: 'attendance' });
Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments' });
Course.hasMany(Exam, { foreignKey: 'courseId', as: 'exams' });
Course.belongsToMany(Student, { through: 'StudentCourses', as: 'students' });
Student.belongsToMany(Course, { through: 'StudentCourses', as: 'courses' });

module.exports = {
  sequelize,
  // Core shared models
  User,
  College,
  
  // Module models (for cross-module access)
  Student,
  Faculty,
  Course,
  Section,
  Department,
  Transaction,
  Lab,
  
  // Academic models
  Timetable,
  Classroom,
  
  // Student models
  Attendance,
  
  // Faculty models
  Assignment,
  AssignmentSubmission,
  
  // Examination models
  Exam,
  ExamHall,
  ExamResult,
  
  // Library models
  LibraryBook,
  LibraryIssue,
  
  // Hostel models
  Hostel,
  HostelRoom,
  HostelAllocation,
  
  // MongoDB models
  ...mongoModels
};