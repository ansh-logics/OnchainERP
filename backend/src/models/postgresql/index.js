const { sequelize } = require('../../config/database');

// Import all models
const User = require('./User');
const College = require('./College');
const Department = require('./Department');
const Student = require('./Student');
const Faculty = require('./Faculty');
const Course = require('./Course');
const Section = require('./Section');
const Transaction = require('./Transaction');
const Lab = require('./Lab');

// New models for complete ERP functionality
const Hostel = require('./Hostel');
const HostelRoom = require('./HostelRoom');
const HostelAllocation = require('./HostelAllocation');
const Attendance = require('./Attendance');
const Assignment = require('./Assignment');
const AssignmentSubmission = require('./AssignmentSubmission');
const Exam = require('./Exam');
const ExamHall = require('./ExamHall');
const ExamResult = require('./ExamResult');
const LibraryBook = require('./LibraryBook');
const LibraryIssue = require('./LibraryIssue');
const Classroom = require('./Classroom');
const Timetable = require('./Timetable');

// Define associations

// User associations
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
User.hasOne(Faculty, { foreignKey: 'userId', as: 'facultyProfile' });
User.hasMany(Lab, { foreignKey: 'labInchargeId', as: 'labsIncharge' });

// College associations
College.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
College.hasMany(Department, { foreignKey: 'collegeId', as: 'departments' });
College.hasMany(Student, { foreignKey: 'collegeId', as: 'students' });
College.hasMany(Faculty, { foreignKey: 'collegeId', as: 'faculty' });
College.hasMany(Course, { foreignKey: 'collegeId', as: 'courses' });
College.hasMany(Section, { foreignKey: 'collegeId', as: 'sections' });
College.hasMany(Transaction, { foreignKey: 'collegeId', as: 'transactions' });

// Department associations
Department.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Department.belongsTo(Faculty, { foreignKey: 'hodId', as: 'hod' });
Department.hasMany(Student, { foreignKey: 'departmentId', as: 'students' });
Department.hasMany(Faculty, { foreignKey: 'departmentId', as: 'faculty' });
Department.hasMany(Course, { foreignKey: 'departmentId', as: 'courses' });
Department.hasMany(Section, { foreignKey: 'departmentId', as: 'sections' });
Department.hasMany(Lab, { foreignKey: 'departmentId', as: 'labs' });

// Student associations
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Student.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Student.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Student.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
Student.hasMany(Transaction, { foreignKey: 'studentId', as: 'transactions' });

// Faculty associations
Faculty.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Faculty.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Faculty.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Faculty.hasMany(Section, { foreignKey: 'classTeacherId', as: 'sections' });

// Course associations
Course.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Course.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

// Many-to-many associations
Student.belongsToMany(Course, { through: 'StudentCourses', as: 'courses' });
Course.belongsToMany(Student, { through: 'StudentCourses', as: 'students' });

// Section associations
Section.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Section.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Section.belongsTo(Faculty, { foreignKey: 'classTeacherId', as: 'classTeacher' });
Section.hasMany(Student, { foreignKey: 'sectionId', as: 'students' });

// Transaction associations
Transaction.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Transaction.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Transaction.belongsTo(User, { foreignKey: 'processedById', as: 'processedBy' });

// Lab associations
Lab.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Lab.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Lab.belongsTo(User, { foreignKey: 'labInchargeId', as: 'labIncharge' });

// Add Labs to College associations
College.hasMany(Lab, { foreignKey: 'collegeId', as: 'labs' });

// Hostel Management Associations
College.hasMany(Hostel, { foreignKey: 'collegeId', as: 'hostels' });
Hostel.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Hostel.belongsTo(Faculty, { foreignKey: 'wardenId', as: 'warden' });
Hostel.hasMany(HostelRoom, { foreignKey: 'hostelId', as: 'rooms' });
Hostel.hasMany(HostelAllocation, { foreignKey: 'hostelId', as: 'allocations' });

HostelRoom.belongsTo(Hostel, { foreignKey: 'hostelId', as: 'hostel' });
HostelRoom.hasMany(HostelAllocation, { foreignKey: 'roomId', as: 'allocations' });

HostelAllocation.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
HostelAllocation.belongsTo(Hostel, { foreignKey: 'hostelId', as: 'hostel' });
HostelAllocation.belongsTo(HostelRoom, { foreignKey: 'roomId', as: 'room' });
Student.hasMany(HostelAllocation, { foreignKey: 'studentId', as: 'hostelAllocations' });

// Attendance Associations
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Attendance.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Attendance.belongsTo(Faculty, { foreignKey: 'markedBy', as: 'marker' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendance' });
Course.hasMany(Attendance, { foreignKey: 'courseId', as: 'attendance' });

// Assignment Associations
Assignment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Assignment.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignmentId', as: 'submissions' });
Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments' });

AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
AssignmentSubmission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
AssignmentSubmission.belongsTo(Faculty, { foreignKey: 'gradedBy', as: 'grader' });
Student.hasMany(AssignmentSubmission, { foreignKey: 'studentId', as: 'assignmentSubmissions' });

// Exam Management Associations
ExamHall.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
College.hasMany(ExamHall, { foreignKey: 'collegeId', as: 'examHalls' });

Exam.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Exam.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Exam.belongsTo(ExamHall, { foreignKey: 'examHallId', as: 'examHall' });
Exam.belongsTo(Faculty, { foreignKey: 'invigilatorId', as: 'invigilator' });
Exam.hasMany(ExamResult, { foreignKey: 'examId', as: 'results' });
Course.hasMany(Exam, { foreignKey: 'courseId', as: 'exams' });

ExamResult.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });
ExamResult.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
ExamResult.belongsTo(Faculty, { foreignKey: 'evaluatedBy', as: 'evaluator' });
Student.hasMany(ExamResult, { foreignKey: 'studentId', as: 'examResults' });

// Library Management Associations
LibraryBook.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
LibraryBook.hasMany(LibraryIssue, { foreignKey: 'bookId', as: 'issues' });
College.hasMany(LibraryBook, { foreignKey: 'collegeId', as: 'libraryBooks' });

LibraryIssue.belongsTo(LibraryBook, { foreignKey: 'bookId', as: 'book' });
LibraryIssue.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
LibraryIssue.belongsTo(User, { foreignKey: 'issuedBy', as: 'issuer' });
LibraryIssue.belongsTo(User, { foreignKey: 'returnedTo', as: 'returner' });
Student.hasMany(LibraryIssue, { foreignKey: 'studentId', as: 'libraryIssues' });

// Classroom and Timetable Associations
Classroom.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
College.hasMany(Classroom, { foreignKey: 'collegeId', as: 'classrooms' });

Timetable.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Timetable.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
Timetable.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Timetable.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Timetable.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'classroom' });
Section.hasMany(Timetable, { foreignKey: 'sectionId', as: 'timetable' });

module.exports = {
  sequelize,
  User,
  College,
  Department,
  Student,
  Faculty,
  Course,
  Section,
  Transaction,
  Lab,
  // New models
  Hostel,
  HostelRoom,
  HostelAllocation,
  Attendance,
  Assignment,
  AssignmentSubmission,
  Exam,
  ExamHall,
  ExamResult,
  LibraryBook,
  LibraryIssue,
  Classroom,
  Timetable
};
