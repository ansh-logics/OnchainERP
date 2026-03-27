const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Op } = require('sequelize');

dotenv.config();

const { connectDatabases } = require('../config/database');
const {
  sequelize,
  User,
  College,
  Department,
  Faculty,
  Student,
  Course,
  Section,
  Lab,
  Transaction
} = require('../models/postgresql');

const { SystemLog, FileUpload } = require('../models/mongodb');

const SEED = {
  superAdmin: {
    email: 'superadmin@seed.local',
    password: 'SuperAdmin@123',
    name: 'Seed Super Admin',
    role: 'super_admin',
    phone: '+919999999999'
  },
  college: {
    name: 'Seed College',
    shortName: 'SEEDC',
    establishedYear: 2015,
    affiliatedUniversity: 'Seed University',
    collegeType: 'Private',
    registrationNumber: 'SEED-REG-0001',
    addressStreet: 'Seed Street',
    addressCity: 'Seed City',
    addressState: 'Seed State',
    addressPincode: '380015',
    addressCountry: 'India',
    phone: '9876543210',
    email: 'info@seedc.local',
    website: 'https://seedc.local',
    campusArea: 10.5,
    totalBuildings: 3,
    totalClassrooms: 25,
    totalLaboratories: 8,
    libraryTotalBooks: 10000,
    libraryDigitalResources: true,
    libraryArea: 2000,
    naacGrade: 'A',
    nbaAccredited: true,
    academicStartMonth: 7,
    academicEndMonth: 6
  },
  admin: {
    email: 'admin@seedc.local',
    password: 'Admin@123',
    name: 'Seed College Admin',
    role: 'admin',
    phone: '+919888888888'
  },
  department: {
    name: 'Computer Engineering',
    shortName: 'CE',
    code: 'SEED-CE-001',
    description: 'Seed Department',
    studentsPerSection: 60,
    totalSections: 1,
    totalIntake: 60
  },
  faculty: {
    email: 'faculty@seedc.local',
    password: 'Faculty@123',
    name: 'Seed Faculty',
    role: 'faculty',
    phone: '+917777777777',
    employeeId: 'SEED-EMP-1001',
    designation: 'Assistant Professor',
    qualification: 'M.Tech',
    experience: 5,
    joiningDate: '2022-06-01',
    employmentType: 'Permanent',
    dateOfBirth: '1988-05-11',
    gender: 'Male'
  },
  student: {
    email: 'student@seedc.local',
    password: 'Student@123',
    name: 'Seed Student',
    role: 'student',
    phone: '+916666666666',
    enrollmentNumber: 'SEED24CE001',
    batch: '2024-2028',
    program: 'B.Tech',
    admissionCategory: 'General',
    dateOfBirth: '2005-01-20',
    gender: 'Male',
    guardianName: 'Seed Guardian',
    guardianRelation: 'Father',
    guardianPhone: '9876533333',
    guardianEmail: 'guardian@seed.local'
  },
  course: {
    code: 'SEED-CE-101',
    name: 'Programming Fundamentals',
    shortName: 'PF',
    description: 'Seed Course',
    credits: 4,
    semester: 1,
    courseType: 'Core',
    theoryHours: 3,
    labHours: 2,
    tutorialHours: 0
  },
  section: {
    name: 'A',
    code: 'SEED-CE-A',
    batch: '2024-2028',
    semester: 1,
    maxCapacity: 60
  },
  lab: {
    name: 'Computer Lab 1',
    labCode: 'SEED-LAB-001',
    description: 'Seed lab',
    location: 'Block A',
    capacity: 60
  }
};

function usageAndExit(code = 1) {
  console.log('Usage: node src/scripts/seed-temp.js --import | --delete');
  process.exit(code);
}

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

async function seedImport() {
  await connectDatabases();

  // Ensure PG schema exists (connectPostgreSQL syncs in development).
  if (process.env.NODE_ENV !== 'development') {
    await sequelize.sync();
  }

  const result = await sequelize.transaction(async (t) => {
    const superAdminPassword = await hashPassword(SEED.superAdmin.password);
    const [superAdmin] = await User.findOrCreate({
      where: { email: SEED.superAdmin.email },
      defaults: {
        name: SEED.superAdmin.name,
        email: SEED.superAdmin.email,
        password: superAdminPassword,
        role: SEED.superAdmin.role,
        phone: SEED.superAdmin.phone,
        isActive: true,
        isEmailVerified: true
      },
      transaction: t
    });

    const adminPassword = await hashPassword(SEED.admin.password);
    const [adminUser] = await User.findOrCreate({
      where: { email: SEED.admin.email },
      defaults: {
        name: SEED.admin.name,
        email: SEED.admin.email,
        password: adminPassword,
        role: SEED.admin.role,
        phone: SEED.admin.phone,
        isActive: true,
        isEmailVerified: true
      },
      transaction: t
    });

    const [college] = await College.findOrCreate({
      where: { shortName: SEED.college.shortName },
      defaults: {
        ...SEED.college,
        adminId: adminUser.id,
        isActive: true
      },
      transaction: t
    });

    if (college.adminId !== adminUser.id) {
      await college.update({ adminId: adminUser.id }, { transaction: t });
    }

    const [department] = await Department.findOrCreate({
      where: { code: SEED.department.code },
      defaults: {
        collegeId: college.id,
        name: SEED.department.name,
        shortName: SEED.department.shortName,
        code: SEED.department.code,
        description: SEED.department.description,
        hodId: null,
        studentsPerSection: SEED.department.studentsPerSection,
        totalSections: SEED.department.totalSections,
        totalIntake: SEED.department.totalIntake,
        isActive: true
      },
      transaction: t
    });

    const facultyPassword = await hashPassword(SEED.faculty.password);
    const [facultyUser] = await User.findOrCreate({
      where: { email: SEED.faculty.email },
      defaults: {
        name: SEED.faculty.name,
        email: SEED.faculty.email,
        password: facultyPassword,
        role: SEED.faculty.role,
        phone: SEED.faculty.phone,
        isActive: true,
        isEmailVerified: true,
        facultyId: SEED.faculty.employeeId
      },
      transaction: t
    });

    const [facultyProfile] = await Faculty.findOrCreate({
      where: { employeeId: SEED.faculty.employeeId },
      defaults: {
        userId: facultyUser.id,
        collegeId: college.id,
        departmentId: department.id,
        employeeId: SEED.faculty.employeeId,
        designation: SEED.faculty.designation,
        qualification: SEED.faculty.qualification,
        experience: SEED.faculty.experience,
        joiningDate: SEED.faculty.joiningDate,
        employmentType: SEED.faculty.employmentType,
        dateOfBirth: SEED.faculty.dateOfBirth,
        gender: SEED.faculty.gender,
        isActive: true
      },
      transaction: t
    });

    const studentPassword = await hashPassword(SEED.student.password);
    const [studentUser] = await User.findOrCreate({
      where: { email: SEED.student.email },
      defaults: {
        name: SEED.student.name,
        email: SEED.student.email,
        password: studentPassword,
        role: SEED.student.role,
        phone: SEED.student.phone,
        isActive: true,
        isEmailVerified: true,
        studentId: SEED.student.enrollmentNumber
      },
      transaction: t
    });

    const [studentProfile] = await Student.findOrCreate({
      where: { enrollmentNumber: SEED.student.enrollmentNumber },
      defaults: {
        userId: studentUser.id,
        collegeId: college.id,
        departmentId: department.id,
        enrollmentNumber: SEED.student.enrollmentNumber,
        batch: SEED.student.batch,
        program: SEED.student.program,
        admissionYear: new Date().getFullYear(),
        currentSemester: 1,
        dateOfBirth: SEED.student.dateOfBirth,
        gender: SEED.student.gender,
        category: SEED.student.admissionCategory,
        guardianName: SEED.student.guardianName,
        guardianRelation: SEED.student.guardianRelation,
        guardianPhone: SEED.student.guardianPhone,
        guardianEmail: SEED.student.guardianEmail,
        admissionStatus: 'enrolled',
        isActive: true
      },
      transaction: t
    });

    const [course] = await Course.findOrCreate({
      where: { code: SEED.course.code },
      defaults: {
        collegeId: college.id,
        departmentId: department.id,
        ...SEED.course,
        isActive: true
      },
      transaction: t
    });

    const [section] = await Section.findOrCreate({
      where: { code: SEED.section.code },
      defaults: {
        collegeId: college.id,
        departmentId: department.id,
        name: SEED.section.name,
        code: SEED.section.code,
        batch: SEED.section.batch,
        semester: SEED.section.semester,
        maxCapacity: SEED.section.maxCapacity,
        currentStrength: 1,
        classTeacherId: facultyProfile.id,
        isActive: true
      },
      transaction: t
    });

    if (studentProfile.sectionId !== section.id) {
      await studentProfile.update({ sectionId: section.id }, { transaction: t });
    }

    const [lab] = await Lab.findOrCreate({
      where: { labCode: SEED.lab.labCode },
      defaults: {
        ...SEED.lab,
        collegeId: college.id,
        departmentId: department.id,
        labInchargeId: facultyUser.id,
        isActive: true
      },
      transaction: t
    });

    const referenceNumber = `SEED-TXN-${new Date().getFullYear()}-0001`;
    const [transaction] = await Transaction.findOrCreate({
      where: { referenceNumber },
      defaults: {
        collegeId: college.id,
        type: 'income',
        category: 'tuition_fee',
        amount: 5000000,
        description: 'Seed tuition fee payment',
        studentId: studentProfile.id,
        paymentMethod: 'upi',
        status: 'paid',
        paidDate: new Date(),
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        semester: 1,
        processedById: adminUser.id
      },
      transaction: t
    });

    return {
      superAdmin,
      adminUser,
      college,
      department,
      facultyUser,
      facultyProfile,
      studentUser,
      studentProfile,
      course,
      section,
      lab,
      transaction
    };
  });

  // Mongo seed (logs + unstructured docs)
  try {
    await SystemLog.create({
      level: 'info',
      event: 'seed',
      action: 'seed_completed',
      userId: result.adminUser.id,
      userRole: 'admin',
      collegeId: result.college.id,
      data: {
        note: 'Temporary seed data created',
        postgres: {
          collegeId: result.college.id,
          departmentId: result.department.id
        }
      },
      status: 'success'
    });

    await FileUpload.create({
      entityType: 'student',
      entityId: result.studentProfile.id,
      originalName: 'seed-profile.png',
      fileName: `seed_${Date.now()}_profile.png`,
      filePath: './uploads/profile/seed-profile.png',
      fileSize: 0,
      mimeType: 'image/png',
      fileType: 'image',
      category: 'profile_photo',
      description: 'Seed file metadata (no actual file on disk)',
      tags: ['seed'],
      uploadedBy: result.adminUser.id,
      isPublic: false,
      allowedRoles: ['admin'],
      isActive: true,
      version: 1
    });
  } catch (e) {
    console.warn('Mongo seed skipped/failed:', e.message);
  }

  console.log('\nSeed completed. Use these accounts to login:\n');
  console.log(`- super_admin: ${SEED.superAdmin.email} / ${SEED.superAdmin.password}`);
  console.log(`- admin:       ${SEED.admin.email} / ${SEED.admin.password}`);
  console.log(`- faculty:     ${SEED.faculty.email} / ${SEED.faculty.password}`);
  console.log(`- student:     ${SEED.student.email} / ${SEED.student.password}\n`);
  console.log('Created/ensured (PostgreSQL IDs):');
  console.log({
    collegeId: result.college.id,
    departmentId: result.department.id,
    facultyId: result.facultyProfile.id,
    studentId: result.studentProfile.id,
    courseId: result.course.id,
    sectionId: result.section.id,
    labId: result.lab.id,
    transactionId: result.transaction.id
  });

  await sequelize.close();
  await mongoose.disconnect().catch(() => {});
  process.exit(0);
}

async function seedDelete() {
  await connectDatabases();

  if (process.env.NODE_ENV !== 'development') {
    await sequelize.sync();
  }

  const referenceNumber = `SEED-TXN-${new Date().getFullYear()}-0001`;

  await sequelize.transaction(async (t) => {
    await Transaction.destroy({ where: { referenceNumber }, transaction: t });
    await Lab.destroy({ where: { labCode: SEED.lab.labCode }, force: true, transaction: t });
    await Section.destroy({ where: { code: SEED.section.code }, transaction: t });
    await Course.destroy({ where: { code: SEED.course.code }, transaction: t });
    await Student.destroy({ where: { enrollmentNumber: SEED.student.enrollmentNumber }, transaction: t });
    await Faculty.destroy({ where: { employeeId: SEED.faculty.employeeId }, transaction: t });
    await Department.destroy({ where: { code: SEED.department.code }, transaction: t });
    await College.destroy({ where: { shortName: SEED.college.shortName }, transaction: t });
    await User.destroy({
      where: {
        email: {
          [Op.in]: [
            SEED.student.email,
            SEED.faculty.email,
            SEED.admin.email,
            SEED.superAdmin.email
          ]
        }
      },
      transaction: t
    });
  });

  try {
    await SystemLog.deleteMany({ event: 'seed' });
    await FileUpload.deleteMany({ tags: 'seed' });
  } catch (e) {
    console.warn('Mongo cleanup skipped/failed:', e.message);
  }

  console.log('Seed delete completed.');
  await sequelize.close();
  await mongoose.disconnect().catch(() => {});
  process.exit(0);
}

async function main() {
  const arg = process.argv[2];
  if (arg === '--import') return seedImport();
  if (arg === '--delete') return seedDelete();
  return usageAndExit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

