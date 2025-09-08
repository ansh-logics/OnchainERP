const { connectDatabases } = require('../config/database');
const { 
  User: PgUser, 
  College: PgCollege, 
  Department: PgDepartment,
  Student: PgStudent,
  Faculty: PgFaculty,
  Course: PgCourse,
  Section: PgSection,
  Transaction: PgTransaction
} = require('../models/postgresql');

// MongoDB models (keep existing for migration)
const MongoUser = require('../models/mongodb_deprecated/User');
const MongoCollege = require('../models/mongodb_deprecated/College');
const MongoDepartment = require('../models/mongodb_deprecated/Department');
const MongoStudent = require('../models/mongodb_deprecated/Student');
const MongoFaculty = require('../models/mongodb_deprecated/Faculty');
const MongoCourse = require('../models/mongodb_deprecated/Course');
const MongoSection = require('../models/mongodb_deprecated/Section');
const MongoTransaction = require('../models/mongodb_deprecated/Transaction');

class MigrationService {
  static async migrateUsers() {
    console.log('Starting User migration...');
    const mongoUsers = await MongoUser.find({});
    const migrated = [];

    for (const mongoUser of mongoUsers) {
      try {
        const pgUser = await PgUser.create({
          id: mongoUser._id.toString(),
          name: mongoUser.name,
          email: mongoUser.email,
          password: mongoUser.password,
          role: mongoUser.role,
          studentId: mongoUser.studentId,
          facultyId: mongoUser.facultyId,
          phone: mongoUser.phone,
          isActive: mongoUser.isActive !== false,
          isEmailVerified: mongoUser.isEmailVerified || false,
          lastLogin: mongoUser.lastLogin,
          resetPasswordToken: mongoUser.resetPasswordToken,
          resetPasswordExpire: mongoUser.resetPasswordExpire,
          createdAt: mongoUser.createdAt,
          updatedAt: mongoUser.updatedAt
        });
        migrated.push(pgUser.id);
      } catch (error) {
        console.error(`Failed to migrate user ${mongoUser._id}:`, error.message);
      }
    }

    console.log(`Migrated ${migrated.length} users out of ${mongoUsers.length}`);
    return migrated;
  }

  static async migrateColleges() {
    console.log('Starting College migration...');
    const mongoColleges = await MongoCollege.find({}).populate('admin');
    const migrated = [];

    for (const mongoCollege of mongoColleges) {
      try {
        const pgCollege = await PgCollege.create({
          id: mongoCollege._id.toString(),
          name: mongoCollege.name,
          shortName: mongoCollege.shortName,
          establishedYear: mongoCollege.establishedYear,
          affiliatedUniversity: mongoCollege.affiliatedUniversity,
          collegeType: mongoCollege.collegeType,
          registrationNumber: mongoCollege.registrationNumber,
          
          // Address
          addressStreet: mongoCollege.address?.street,
          addressCity: mongoCollege.address?.city,
          addressState: mongoCollege.address?.state,
          addressPincode: mongoCollege.address?.pincode,
          addressCountry: mongoCollege.address?.country || 'India',
          
          // Contact
          phone: mongoCollege.contactDetails?.phone,
          email: mongoCollege.contactDetails?.email,
          website: mongoCollege.contactDetails?.website,
          fax: mongoCollege.contactDetails?.fax,
          
          // Infrastructure
          campusArea: mongoCollege.campusArea,
          totalBuildings: mongoCollege.totalBuildings,
          totalClassrooms: mongoCollege.totalClassrooms,
          totalLaboratories: mongoCollege.totalLaboratories,
          
          // Library
          libraryTotalBooks: mongoCollege.libraryDetails?.totalBooks,
          libraryDigitalResources: mongoCollege.libraryDetails?.digitalResources || false,
          libraryArea: mongoCollege.libraryDetails?.area,
          
          // Admin
          adminId: mongoCollege.admin?._id?.toString() || mongoCollege.admin,
          
          // Accreditation
          naacGrade: mongoCollege.accreditation?.naac?.grade,
          naacValidUntil: mongoCollege.accreditation?.naac?.validUntil,
          nbaAccredited: mongoCollege.accreditation?.nba?.accredited || false,
          nbaValidUntil: mongoCollege.accreditation?.nba?.validUntil,
          
          // Academic year
          academicStartMonth: mongoCollege.academicYear?.startMonth || 7,
          academicEndMonth: mongoCollege.academicYear?.endMonth || 6,
          
          isActive: mongoCollege.isActive !== false,
          createdAt: mongoCollege.createdAt,
          updatedAt: mongoCollege.updatedAt
        });
        migrated.push(pgCollege.id);
      } catch (error) {
        console.error(`Failed to migrate college ${mongoCollege._id}:`, error.message);
      }
    }

    console.log(`Migrated ${migrated.length} colleges out of ${mongoColleges.length}`);
    return migrated;
  }

  static async migrateDepartments() {
    console.log('Starting Department migration...');
    const mongoDepartments = await MongoDepartment.find({});
    const migrated = [];

    for (const mongoDept of mongoDepartments) {
      try {
        const pgDept = await PgDepartment.create({
          id: mongoDept._id.toString(),
          collegeId: mongoDept.college?.toString(),
          name: mongoDept.name,
          shortName: mongoDept.shortName,
          code: mongoDept.code,
          description: mongoDept.description,
          hodId: mongoDept.hod?.toString(),
          
          // Section config
          studentsPerSection: mongoDept.sectionsConfig?.studentsPerSection || 60,
          totalSections: mongoDept.sectionsConfig?.totalSections || 1,
          
          // Intake
          totalIntake: mongoDept.totalIntake || 60,
          currentStrength: mongoDept.currentStrength || 0,
          
          isActive: mongoDept.isActive !== false,
          createdAt: mongoDept.createdAt,
          updatedAt: mongoDept.updatedAt
        });
        migrated.push(pgDept.id);
      } catch (error) {
        console.error(`Failed to migrate department ${mongoDept._id}:`, error.message);
      }
    }

    console.log(`Migrated ${migrated.length} departments out of ${mongoDepartments.length}`);
    return migrated;
  }

  static async migrateStudents() {
    console.log('Starting Student migration...');
    const mongoStudents = await MongoStudent.find({});
    const migrated = [];

    for (const mongoStudent of mongoStudents) {
      try {
        const pgStudent = await PgStudent.create({
          id: mongoStudent._id.toString(),
          userId: mongoStudent.user?.toString(),
          collegeId: mongoStudent.college?.toString(),
          departmentId: mongoStudent.department?.toString(),
          sectionId: mongoStudent.section?.toString(),
          
          // Student ID
          rollNumber: mongoStudent.rollNumber,
          enrollmentNumber: mongoStudent.enrollmentNumber,
          studentId: mongoStudent.studentId,
          
          // Academic
          batch: mongoStudent.batch,
          program: mongoStudent.program,
          admissionYear: mongoStudent.admissionYear,
          currentSemester: mongoStudent.currentSemester || 1,
          
          // Personal
          dateOfBirth: mongoStudent.personalDetails?.dateOfBirth,
          gender: mongoStudent.personalDetails?.gender,
          bloodGroup: mongoStudent.personalDetails?.bloodGroup,
          category: mongoStudent.personalDetails?.category,
          religion: mongoStudent.personalDetails?.religion,
          nationality: mongoStudent.personalDetails?.nationality || 'Indian',
          
          // Contact
          personalEmail: mongoStudent.contactDetails?.personalEmail,
          personalPhone: mongoStudent.contactDetails?.personalPhone,
          
          // Address
          permanentAddressStreet: mongoStudent.address?.permanent?.street,
          permanentAddressCity: mongoStudent.address?.permanent?.city,
          permanentAddressState: mongoStudent.address?.permanent?.state,
          permanentAddressPincode: mongoStudent.address?.permanent?.pincode,
          permanentAddressCountry: mongoStudent.address?.permanent?.country || 'India',
          
          currentAddressStreet: mongoStudent.address?.current?.street,
          currentAddressCity: mongoStudent.address?.current?.city,
          currentAddressState: mongoStudent.address?.current?.state,
          currentAddressPincode: mongoStudent.address?.current?.pincode,
          currentAddressCountry: mongoStudent.address?.current?.country || 'India',
          
          // Guardian
          guardianName: mongoStudent.guardianDetails?.name,
          guardianRelation: mongoStudent.guardianDetails?.relation,
          guardianPhone: mongoStudent.guardianDetails?.phone,
          guardianEmail: mongoStudent.guardianDetails?.email,
          guardianOccupation: mongoStudent.guardianDetails?.occupation,
          
          // Academic performance
          cgpa: mongoStudent.academicDetails?.cgpa,
          
          // Status
          admissionStatus: mongoStudent.admissionStatus || 'enrolled',
          isActive: mongoStudent.isActive !== false,
          createdAt: mongoStudent.createdAt,
          updatedAt: mongoStudent.updatedAt
        });
        migrated.push(pgStudent.id);
      } catch (error) {
        console.error(`Failed to migrate student ${mongoStudent._id}:`, error.message);
      }
    }

    console.log(`Migrated ${migrated.length} students out of ${mongoStudents.length}`);
    return migrated;
  }

  static async runFullMigration() {
    try {
      console.log('Starting full migration from MongoDB to PostgreSQL...');
      
      await connectDatabases();
      
      // Migrate in order of dependencies
      await this.migrateUsers();
      await this.migrateColleges();
      await this.migrateDepartments();
      await this.migrateStudents();
      // Add other migrations as needed
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  MigrationService.runFullMigration().then(() => {
    console.log('Migration process finished');
    process.exit(0);
  });
}

module.exports = MigrationService;
