const mongoose = require('mongoose');

// Import all MongoDB models
const User = require('./User');
const College = require('./College');
const Student = require('./Student');
const Faculty = require('./Faculty');
const Course = require('./Course');
const Section = require('./Section');
const Department = require('./Department');
const Transaction = require('./Transaction');
const Fee = require('./Fee');
const Lab = require('./Lab');

// Additional models
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
const CourseEnrollment = require('./CourseEnrollment');
const FacultySubstitution = require('./FacultySubstitution');

// Permission and User Management models
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const PasswordResetRequest = require('./PasswordResetRequest');

// Legacy MongoDB models (keep for backward compatibility)
const FileUpload = require('./FileUpload');
const SystemLog = require('./SystemLog');
const Analytics = require('./Analytics');
const Notification = require('./Notification');
const Configuration = require('./Configuration');
const AcademicCalendar = require('./AcademicCalendar');
const Announcement = require('./Announcement');

// Export all models
module.exports = {
  // Core models (Primary MongoDB models)
  User,
  College,
  Student,
  Faculty,
  Course,
  Section,
  Department,
  Transaction,
  Fee,
  Lab,
  
  // Additional models
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
  Timetable,
  CourseEnrollment,
  FacultySubstitution,
  
  // Permission models
  Permission,
  RolePermission,
  PasswordResetRequest,
  
  // Legacy models (backward compatibility)
  FileUpload,
  SystemLog,
  Analytics,
  Notification,
  Configuration,
  AcademicCalendar,
  Announcement,
  
  // Connection
  mongoose
};

// Log successful model registration
if (process.env.NODE_ENV === 'development') {
  console.log('🗃️ MongoDB models registered successfully');
}
