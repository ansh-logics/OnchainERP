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
  Lab
};
