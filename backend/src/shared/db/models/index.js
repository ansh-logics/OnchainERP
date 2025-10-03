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

// Permission and User Management models
const Permission = require('./postgresql/Permission');
const RolePermission = require('./postgresql/RolePermission');
const PasswordResetRequest = require('./postgresql/PasswordResetRequest');

// MongoDB models (still centralized for now)
const mongoModels = require('./mongodb');

// Cross-module associations that need to be defined at the global level
// These are associations between models from different modules

// User cross-module associations
User.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
User.hasOne(Faculty, { foreignKey: 'userId', as: 'facultyProfile' });

// College cross-module associations
College.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
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
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Student.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Student.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Student.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
Student.hasMany(Transaction, { foreignKey: 'studentId', as: 'transactions' });
Student.hasMany(HostelAllocation, { foreignKey: 'studentId', as: 'hostelAllocations' });
Student.hasMany(LibraryIssue, { foreignKey: 'studentId', as: 'libraryIssues' });
Student.hasMany(AssignmentSubmission, { foreignKey: 'studentId', as: 'assignmentSubmissions' });
Student.hasMany(ExamResult, { foreignKey: 'studentId', as: 'examResults' });

// Faculty cross-module associations
Faculty.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Faculty.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Faculty.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Faculty.hasMany(Section, { foreignKey: 'classTeacherId', as: 'sections' });
Faculty.hasMany(Course, { foreignKey: 'facultyId', as: 'courses' });
Faculty.hasMany(Exam, { foreignKey: 'invigilatorId', as: 'invigilatedExams' });

// Department cross-module associations
Department.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Department.hasMany(Student, { foreignKey: 'departmentId', as: 'students' });
Department.hasMany(Faculty, { foreignKey: 'departmentId', as: 'faculty' });
Department.hasMany(Course, { foreignKey: 'departmentId', as: 'courses' });

// Course cross-module associations
Course.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Course.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Course.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Course.hasMany(Attendance, { foreignKey: 'courseId', as: 'attendance' });
Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments' });
Course.hasMany(Exam, { foreignKey: 'courseId', as: 'exams' });
Course.belongsToMany(Student, { through: 'StudentCourses', as: 'students' });
Student.belongsToMany(Course, { through: 'StudentCourses', as: 'courses' });

// Hostel cross-module associations
Hostel.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Hostel.belongsTo(Faculty, { foreignKey: 'wardenId', as: 'warden' });
Hostel.hasMany(HostelRoom, { foreignKey: 'hostelId', as: 'rooms' });
Hostel.hasMany(HostelAllocation, { foreignKey: 'hostelId', as: 'allocations' });
HostelRoom.belongsTo(Hostel, { foreignKey: 'hostelId', as: 'hostel' });
HostelRoom.hasMany(HostelAllocation, { foreignKey: 'roomId', as: 'allocations' });
HostelAllocation.belongsTo(Hostel, { foreignKey: 'hostelId', as: 'hostel' });
HostelAllocation.belongsTo(HostelRoom, { foreignKey: 'roomId', as: 'room' });
HostelAllocation.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Exam cross-module associations
Exam.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Exam.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Exam.belongsTo(ExamHall, { foreignKey: 'examHallId', as: 'examHall' });
Exam.belongsTo(Faculty, { foreignKey: 'invigilatorId', as: 'invigilator' });
Exam.hasMany(ExamResult, { foreignKey: 'examId', as: 'results' });

// ExamHall cross-module associations
ExamHall.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
ExamHall.hasMany(Exam, { foreignKey: 'examHallId', as: 'exams' });

// ExamResult cross-module associations
ExamResult.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });
ExamResult.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Library cross-module associations
LibraryBook.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
LibraryBook.hasMany(LibraryIssue, { foreignKey: 'bookId', as: 'issues' });
LibraryIssue.belongsTo(LibraryBook, { foreignKey: 'bookId', as: 'book' });
LibraryIssue.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Lab cross-module associations
Lab.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Lab.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

// Section cross-module associations
Section.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Section.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Section.belongsTo(Faculty, { foreignKey: 'classTeacherId', as: 'classTeacher' });
Section.hasMany(Student, { foreignKey: 'sectionId', as: 'students' });

// Attendance cross-module associations
Attendance.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(Faculty, { foreignKey: 'markedBy', as: 'markedByFaculty' });
Attendance.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendance' });
Faculty.hasMany(Attendance, { foreignKey: 'facultyId', as: 'attendanceRecords' });

// Assignment cross-module associations
Assignment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Assignment.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignmentId', as: 'submissions' });

// AssignmentSubmission cross-module associations
AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
AssignmentSubmission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Timetable cross-module associations
Timetable.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Timetable.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Timetable.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Timetable.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Timetable.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
Timetable.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'classroom' });

// Classroom cross-module associations
Classroom.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Classroom.hasMany(Timetable, { foreignKey: 'classroomId', as: 'timetableEntries' });

// Transaction cross-module associations
Transaction.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
Transaction.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Permission system associations
RolePermission.belongsTo(Permission, { foreignKey: 'permissionId', as: 'permission' });
RolePermission.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });
RolePermission.belongsTo(User, { foreignKey: 'grantedBy', as: 'grantedByUser' });
Permission.hasMany(RolePermission, { foreignKey: 'permissionId', as: 'rolePermissions' });

// Password reset request associations
PasswordResetRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PasswordResetRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });
User.hasMany(PasswordResetRequest, { foreignKey: 'userId', as: 'passwordResetRequests' });
User.hasMany(PasswordResetRequest, { foreignKey: 'reviewedBy', as: 'reviewedPasswordResets' });

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
  
  // Permission and User Management models
  Permission,
  RolePermission,
  PasswordResetRequest,
  
  // MongoDB models
  ...mongoModels
};