const bcrypt = require('bcryptjs');
const { 
  sequelize,
  User,
  College,
  Department,
  Faculty,
  Student,
  Course,
  Section,
  Classroom,
  Lab,
  ExamHall,
  Exam,
  ExamResult,
  LibraryBook,
  LibraryIssue,
  Timetable,
  Assignment,
  AssignmentSubmission,
  Attendance,
  Transaction
} = require('../src/shared/db/models');

// Helper function to generate random data
const generateRandomString = (length) => {
  return Math.random().toString(36).substring(2, length + 2).toUpperCase();
};

const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Main seeding function
async function seedData() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Check if college already exists - if so, delete existing data first
    const existingCollege = await College.findOne({ where: { shortName: 'TIES' } });
    if (existingCollege) {
      console.log('⚠️  College "TIES" already exists. Cleaning existing data...');
      
      // Delete in correct order to respect foreign keys
      await sequelize.query('DELETE FROM assignment_submissions');
      await sequelize.query('DELETE FROM assignments');
      await sequelize.query('DELETE FROM attendance');
      await sequelize.query('DELETE FROM exam_results');
      await sequelize.query('DELETE FROM exams');
      await sequelize.query('DELETE FROM library_issues');
      await sequelize.query('DELETE FROM timetable');
      await sequelize.query('DELETE FROM sections');
      await sequelize.query('DELETE FROM courses');
      await sequelize.query('DELETE FROM students');
      await sequelize.query('DELETE FROM faculty');
      await sequelize.query('DELETE FROM departments');
      await sequelize.query('DELETE FROM users WHERE role != \'superadmin\'');
      await sequelize.query('DELETE FROM colleges');
      
      console.log('✅ Existing data cleaned');
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // ============================================
      // 1. CREATE ADMIN USER AND COLLEGE
      // ============================================
      console.log('📊 Creating admin user and college...');
      
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      const adminUser = await User.create({
        name: 'Dr. Rajesh Kumar',
        email: 'admin@teccollege.edu.in',
        password: hashedPassword,
        role: 'admin',
        phone: '9876543210',
        isActive: true,
        isEmailVerified: true
      }, { transaction });

      const college = await College.create({
        name: 'Technological Institute of Engineering and Sciences',
        shortName: 'TIES',
        establishedYear: 2005,
        affiliatedUniversity: 'Dr. APJ Abdul Kalam Technical University',
        collegeType: 'Autonomous',
        registrationNumber: 'AICTE/REG/2005/12345',
        
        // Address
        addressStreet: '123 Knowledge Park',
        addressCity: 'Bangalore',
        addressState: 'Karnataka',
        addressPincode: '560001',
        addressCountry: 'India',
        
        // Contact
        phone: '8012345678',
        email: 'info@teccollege.edu.in',
        website: 'https://www.teccollege.edu.in',
        
        // Infrastructure
        campusArea: 45.5,
        totalBuildings: 12,
        totalClassrooms: 85,
        totalLaboratories: 32,
        
        // Library
        libraryTotalBooks: 25000,
        libraryDigitalResources: true,
        libraryArea: 5000,
        
        // Admin
        adminId: adminUser.id,
        
        // Accreditation
        naacGrade: 'A+',
        naacValidUntil: new Date('2027-12-31'),
        nbaAccredited: true,
        nbaValidUntil: new Date('2026-06-30'),
        
        // Academic year
        academicStartMonth: 7,
        academicEndMonth: 6,
        currentAcademicYear: '2024-25',
        
        isActive: true
      }, { transaction });

      // Update admin user with college
      await adminUser.update({ collegeId: college.id }, { transaction });

      console.log('✅ Admin and College created\n');

      // ============================================
      // 2. CREATE DEPARTMENTS
      // ============================================
      console.log('📚 Creating departments...');
      
      const departmentsData = [
        {
          name: 'Computer Science and Engineering',
          shortName: 'CSE',
          code: 'CSE',
          description: 'Department of Computer Science and Engineering offering B.Tech and M.Tech programs',
          studentsPerSection: 24,
          totalSections: 4,
          totalIntake: 96, // 24 students per batch * 4 batches = 96 total
          totalFaculty: 18,
          totalLabs: 6
        },
        {
          name: 'Electronics and Communication Engineering',
          shortName: 'ECE',
          code: 'ECE',
          description: 'Department of Electronics and Communication Engineering',
          studentsPerSection: 18,
          totalSections: 4,
          totalIntake: 72, // 18 students per batch * 4 batches = 72 total
          totalFaculty: 15,
          totalLabs: 5
        },
        {
          name: 'Mechanical Engineering',
          shortName: 'MECH',
          code: 'MECH',
          description: 'Department of Mechanical Engineering',
          studentsPerSection: 18,
          totalSections: 4,
          totalIntake: 72, // 18 students per batch * 4 batches = 72 total
          totalFaculty: 14,
          totalLabs: 4
        },
        {
          name: 'Civil Engineering',
          shortName: 'CIVIL',
          code: 'CIVIL',
          description: 'Department of Civil Engineering',
          studentsPerSection: 15,
          totalSections: 4,
          totalIntake: 60, // 15 students per batch * 4 batches = 60 total
          totalFaculty: 10,
          totalLabs: 3
        },
        {
          name: 'Electrical and Electronics Engineering',
          shortName: 'EEE',
          code: 'EEE',
          description: 'Department of Electrical and Electronics Engineering',
          studentsPerSection: 15,
          totalSections: 4,
          totalIntake: 60, // 15 students per batch * 4 batches = 60 total
          totalFaculty: 12,
          totalLabs: 4
        }
      ];

      const departments = [];
      const departmentConfig = []; // Store full config including totalFaculty and totalLabs
      
      for (const deptData of departmentsData) {
        // Extract only the fields that exist in the Department model
        const { totalFaculty, totalLabs, ...deptFields } = deptData;
        
        const dept = await Department.create({
          ...deptFields,
          collegeId: college.id
        }, { transaction });
        
        departments.push(dept);
        departmentConfig.push({
          ...dept.dataValues,
          totalFaculty,
          totalLabs
        });
      }

      console.log(`✅ Created ${departments.length} departments\n`);

      // ============================================
      // 3. CREATE FACULTY MEMBERS
      // ============================================
      console.log('👨‍🏫 Creating faculty members...');
      
      const faculties = [];
      const facultyDesignations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
      const genders = ['Male', 'Female'];
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

      for (let deptIndex = 0; deptIndex < departmentConfig.length; deptIndex++) {
        const deptConf = departmentConfig[deptIndex];
        const dept = departments[deptIndex];
        const numFaculty = deptConf.totalFaculty;

        for (let i = 0; i < numFaculty; i++) {
          const isHOD = i === 0;
          const designation = i === 0 ? 'Professor' : facultyDesignations[generateRandomNumber(1, 3)];
          const gender = genders[generateRandomNumber(0, 1)];
          const firstName = gender === 'Male' 
            ? ['Rajesh', 'Suresh', 'Amit', 'Vijay', 'Prakash', 'Anil', 'Ramesh', 'Mahesh'][generateRandomNumber(0, 7)]
            : ['Priya', 'Kavita', 'Sunita', 'Anjali', 'Deepa', 'Meera', 'Asha', 'Lakshmi'][generateRandomNumber(0, 7)];
          const lastName = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Rao'][generateRandomNumber(0, 7)];
          
          const facultyIdValue = `FAC${dept.code}${String(i + 1).padStart(3, '0')}`;
          
          const facultyUser = await User.create({
            name: `Dr. ${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${dept.code.toLowerCase()}.${i}@teccollege.edu.in`,
            password: hashedPassword,
            role: 'faculty',
            facultyId: facultyIdValue, // Set facultyId in User table
            phone: `9${generateRandomNumber(100000000, 999999999)}`,
            collegeId: college.id,
            isActive: true,
            isEmailVerified: true
          }, { transaction });

          const faculty = await Faculty.create({
            userId: facultyUser.id,
            collegeId: college.id,
            departmentId: dept.id,
            employeeId: `EMP${dept.code}${String(i + 1).padStart(3, '0')}`,
            facultyId: facultyIdValue,
            designation: designation,
            qualification: designation === 'Professor' ? 'Ph.D.' : 'M.Tech',
            specialization: `${dept.name} Specialization`,
            experience: generateRandomNumber(2, 20),
            joiningDate: generateRandomDate(new Date('2015-01-01'), new Date('2023-12-31')),
            employmentType: 'Permanent',
            salary: designation === 'Professor' ? 120000 : designation === 'Associate Professor' ? 90000 : 70000,
            dateOfBirth: generateRandomDate(new Date('1970-01-01'), new Date('1990-12-31')),
            gender: gender,
            bloodGroup: bloodGroups[generateRandomNumber(0, 7)],
            maritalStatus: generateRandomNumber(0, 1) === 0 ? 'Single' : 'Married',
            personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
            personalPhone: `9${generateRandomNumber(100000000, 999999999)}`,
            emergencyContact: `9${generateRandomNumber(100000000, 999999999)}`,
            addressStreet: `${generateRandomNumber(1, 100)} Main Road`,
            addressCity: 'Bangalore',
            addressState: 'Karnataka',
            addressPincode: '560001',
            isHOD: isHOD,
            isActive: true
          }, { transaction });

          faculties.push(faculty);

          // Update department HOD
          if (isHOD) {
            await dept.update({ hodId: facultyUser.id }, { transaction });
          }
        }
      }

      console.log(`✅ Created ${faculties.length} faculty members\n`);

      // ============================================
      // 4. CREATE STUDENTS
      // ============================================
      console.log('👨‍🎓 Creating students...');
      
      const students = [];
      const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
      const guardianRelations = ['Father', 'Mother', 'Guardian'];
      const admissionYears = [2021, 2022, 2023, 2024];
      const batches = ['2021', '2022', '2023', '2024'];

      let totalStudentsCreated = 0;
      let deptStudentCounts = {};

      for (const dept of departments) {
        deptStudentCounts[dept.code] = 0;
        // Create students for different batches
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          const admissionYear = admissionYears[batchIndex];
          const currentSemester = (2024 - admissionYear) * 2 + 2; // Calculate semester based on year
          
          // Calculate students per batch to reach exactly 360 total students
          // Total target: 360 students across 5 departments and 4 batches
          // Distribution: CSE=96, ECE=72, MECH=72, CIVIL=60, EEE=60 (total=360)
          let studentsInBatch;
          switch(dept.code) {
            case 'CSE': studentsInBatch = 24; break;  // 24 * 4 batches = 96
            case 'ECE': studentsInBatch = 18; break;  // 18 * 4 batches = 72
            case 'MECH': studentsInBatch = 18; break; // 18 * 4 batches = 72
            case 'CIVIL': studentsInBatch = 15; break;// 15 * 4 batches = 60
            case 'EEE': studentsInBatch = 15; break;  // 15 * 4 batches = 60
            default: studentsInBatch = 15;
          }

          for (let i = 0; i < studentsInBatch; i++) {
            const gender = genders[generateRandomNumber(0, 1)];
            const maleNames = ['Rahul', 'Arjun', 'Karthik', 'Rohan', 'Aditya', 'Varun', 'Nikhil', 'Abhishek', 'Vikram', 'Sanjay', 
                              'Ravi', 'Amit', 'Suresh', 'Ajay', 'Anand', 'Deepak', 'Manoj', 'Prashant', 'Sachin', 'Yogesh',
                              'Ashish', 'Gaurav', 'Harsh', 'Ishan', 'Jatin', 'Kunal', 'Lalit', 'Mayank', 'Neeraj', 'Omkar',
                              'Pankaj', 'Qasim', 'Ritesh', 'Sumit', 'Tarun', 'Ujjwal', 'Vikas', 'Wasim', 'Yash', 'Zaid'];
            const femaleNames = ['Sneha', 'Pooja', 'Divya', 'Shruti', 'Nisha', 'Riya', 'Tanvi', 'Isha', 'Kavya', 'Lata',
                                'Meera', 'Naina', 'Ojaswini', 'Priya', 'Queenie', 'Rashmi', 'Swati', 'Tanya', 'Uma', 'Vidya',
                                'Wanda', 'Xara', 'Yamini', 'Zara', 'Ananya', 'Bhavana', 'Chandni', 'Deepika', 'Esha', 'Falguni',
                                'Gauri', 'Harini', 'Indira', 'Jyoti', 'Kiran', 'Lavanya', 'Madhuri', 'Neha', 'Orvita', 'Pallavi'];
            const lastNames = ['Gupta', 'Verma', 'Joshi', 'Pillai', 'Menon', 'Shah', 'Desai', 'Kulkarni', 'Agarwal', 'Bansal',
                              'Chandra', 'Dutta', 'Eyer', 'Fernandes', 'Ghosh', 'Hegde', 'Iyer', 'Jain', 'Kapoor', 'Lal',
                              'Mishra', 'Nair', 'Oak', 'Patel', 'Qureshi', 'Rao', 'Sharma', 'Trivedi', 'Upadhyay', 'Varma',
                              'Wadhwa', 'Xavier', 'Yadav', 'Zaveri', 'Arora', 'Bajaj', 'Chopra', 'Das', 'Ehsan', 'Garg'];
            
            const firstName = gender === 'Male' 
              ? maleNames[generateRandomNumber(0, maleNames.length - 1)]
              : femaleNames[generateRandomNumber(0, femaleNames.length - 1)];
            const lastName = lastNames[generateRandomNumber(0, lastNames.length - 1)];

            const rollNumber = `${dept.code}${batch}${String(i + 1).padStart(3, '0')}`;
            const enrollmentNumber = `TIES${batch}${dept.code}${String(i + 1).padStart(4, '0')}`;
            
            const studentUser = await User.create({
              name: `${firstName} ${lastName}`,
              email: `student.${dept.code.toLowerCase()}.${batch}.${String(i + 1).padStart(3, '0')}@student.teccollege.edu.in`,
              password: hashedPassword,
              role: 'student',
              studentId: rollNumber, // Set studentId in User table
              phone: `9${generateRandomNumber(100000000, 999999999)}`,
              collegeId: college.id,
              isActive: true,
              isEmailVerified: true
            }, { transaction });

            const student = await Student.create({
              userId: studentUser.id,
              collegeId: college.id,
              departmentId: dept.id,
              rollNumber: rollNumber,
              enrollmentNumber: enrollmentNumber,
              studentId: rollNumber,
              batch: batch,
              program: 'B.Tech',
              admissionYear: admissionYear,
              currentSemester: currentSemester > 8 ? 8 : currentSemester,
              dateOfBirth: generateRandomDate(new Date('2000-01-01'), new Date('2006-12-31')),
              gender: gender,
              bloodGroup: bloodGroups[generateRandomNumber(0, 7)],
              category: categories[generateRandomNumber(0, 4)],
              religion: 'Hindu',
              nationality: 'Indian',
              personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
              personalPhone: `9${generateRandomNumber(100000000, 999999999)}`,
              permanentAddressStreet: `${generateRandomNumber(1, 100)} Park Street`,
              permanentAddressCity: ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bangalore'][generateRandomNumber(0, 4)],
              permanentAddressState: 'Karnataka',
              permanentAddressPincode: '560001',
              currentAddressStreet: `${generateRandomNumber(1, 100)} College Road`,
              currentAddressCity: 'Bangalore',
              currentAddressState: 'Karnataka',
              currentAddressPincode: '560002',
              guardianName: `${firstName} ${lastName} Sr.`,
              guardianRelation: guardianRelations[generateRandomNumber(0, 2)],
              guardianPhone: `9${generateRandomNumber(100000000, 999999999)}`,
              guardianEmail: `guardian${i}@gmail.com`,
              guardianOccupation: ['Business', 'Service', 'Professional', 'Farmer'][generateRandomNumber(0, 3)],
              cgpa: (7.0 + Math.random() * 2.5).toFixed(2),
              totalCredits: (currentSemester - 1) * 20,
              admissionStatus: 'enrolled',
              isActive: true
            }, { transaction });

            students.push(student);
            totalStudentsCreated++;
            deptStudentCounts[dept.code]++;
          }
        }
      }

      console.log(`✅ Created ${totalStudentsCreated} students total`);
      console.log(`📊 Department-wise distribution:`);
      for (const [deptCode, count] of Object.entries(deptStudentCounts)) {
        console.log(`   ${deptCode}: ${count} students`);
      }
      console.log('');

      // ============================================
      // 5. CREATE COURSES
      // ============================================
      console.log('📖 Creating courses...');
      
      const courses = [];
      const courseTypes = ['Core', 'Elective', 'Laboratory'];

      // CSE Courses
      const cseCourses = [
        { name: 'Data Structures and Algorithms', code: 'CSE201', semester: 3, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Database Management Systems', code: 'CSE202', semester: 3, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Operating Systems', code: 'CSE301', semester: 5, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Computer Networks', code: 'CSE302', semester: 5, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Machine Learning', code: 'CSE401', semester: 7, credits: 4, type: 'Elective', theory: 3, lab: 2 },
        { name: 'Cloud Computing', code: 'CSE402', semester: 7, credits: 4, type: 'Elective', theory: 3, lab: 2 },
        { name: 'Programming Lab', code: 'CSE203', semester: 3, credits: 2, type: 'Laboratory', theory: 0, lab: 4 },
        { name: 'Software Engineering', code: 'CSE303', semester: 5, credits: 4, type: 'Core', theory: 3, lab: 2 }
      ];

      // ECE Courses
      const eceCourses = [
        { name: 'Digital Electronics', code: 'ECE201', semester: 3, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Signals and Systems', code: 'ECE202', semester: 3, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Microprocessors', code: 'ECE301', semester: 5, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Communication Systems', code: 'ECE302', semester: 5, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'VLSI Design', code: 'ECE401', semester: 7, credits: 4, type: 'Elective', theory: 3, lab: 2 },
        { name: 'Embedded Systems', code: 'ECE402', semester: 7, credits: 4, type: 'Elective', theory: 3, lab: 2 }
      ];

      // MECH Courses
      const mechCourses = [
        { name: 'Thermodynamics', code: 'MECH201', semester: 3, credits: 4, type: 'Core', theory: 4, lab: 0 },
        { name: 'Fluid Mechanics', code: 'MECH202', semester: 3, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Manufacturing Technology', code: 'MECH301', semester: 5, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Heat Transfer', code: 'MECH302', semester: 5, credits: 4, type: 'Core', theory: 3, lab: 2 },
        { name: 'Automobile Engineering', code: 'MECH401', semester: 7, credits: 4, type: 'Elective', theory: 3, lab: 2 }
      ];

      // Create courses for each department
      const deptCourseMap = {
        'CSE': cseCourses,
        'ECE': eceCourses,
        'MECH': mechCourses
      };

      for (const dept of departments) {
        const deptCourses = deptCourseMap[dept.code] || [];
        const deptFaculties = faculties.filter(f => f.departmentId === dept.id);

        for (let i = 0; i < deptCourses.length; i++) {
          const courseData = deptCourses[i];
          const facultyIndex = i % deptFaculties.length;
          
          const course = await Course.create({
            collegeId: college.id,
            departmentId: dept.id,
            code: courseData.code,
            name: courseData.name,
            shortName: courseData.code,
            description: `${courseData.name} course for ${dept.name}`,
            credits: courseData.credits,
            semester: courseData.semester,
            courseType: courseData.type,
            theoryHours: courseData.theory,
            labHours: courseData.lab,
            tutorialHours: 1,
            totalHours: courseData.theory + courseData.lab + 1,
            hasInternalAssessment: true,
            hasFinalExam: true,
            internalMarks: 40,
            finalMarks: 60,
            passingMarks: 40,
            facultyId: deptFaculties[facultyIndex].id,
            isActive: true
          }, { transaction });

          courses.push(course);
        }
      }

      console.log(`✅ Created ${courses.length} courses\n`);

      // ============================================
      // 6. CREATE SECTIONS
      // ============================================
      console.log('🏫 Creating sections...');
      
      const sections = [];

      for (const dept of departments) {
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          const currentSemester = (2024 - admissionYears[batchIndex]) * 2 + 2;

          for (let sectionNum = 1; sectionNum <= dept.totalSections; sectionNum++) {
            const sectionCode = `${dept.code}-${batch}-${String.fromCharCode(64 + sectionNum)}`;
            const deptFaculties = faculties.filter(f => f.departmentId === dept.id && !f.isHOD);
            const classTeacher = deptFaculties[(sectionNum - 1) % deptFaculties.length];

            const section = await Section.create({
              collegeId: college.id,
              departmentId: dept.id,
              name: `Section ${String.fromCharCode(64 + sectionNum)}`,
              code: sectionCode,
              batch: batch,
              semester: currentSemester > 8 ? 8 : currentSemester,
              maxCapacity: dept.studentsPerSection,
              currentStrength: Math.floor(dept.studentsPerSection * 0.9),
              classTeacherId: classTeacher?.id,
              isActive: true
            }, { transaction });

            sections.push(section);
          }
        }
      }

      console.log(`✅ Created ${sections.length} sections\n`);

      // ============================================
      // 7. CREATE CLASSROOMS
      // ============================================
      console.log('🏢 Creating classrooms...');
      
      const classrooms = [];
      const buildings = ['A Block', 'B Block', 'C Block', 'D Block'];
      const classroomTypes = ['lecture_hall', 'seminar_room', 'conference_room'];

      for (let building = 0; building < buildings.length; building++) {
        for (let floor = 1; floor <= 4; floor++) {
          for (let room = 1; room <= 5; room++) {
            const classroom = await Classroom.create({
              collegeId: college.id,
              roomNumber: `${buildings[building]}-${floor}0${room}`,
              building: buildings[building],
              floor: floor,
              capacity: generateRandomNumber(40, 80),
              roomType: classroomTypes[generateRandomNumber(0, 2)],
              facilities: JSON.stringify(['Whiteboard', 'Projector', 'Audio System']),
              hasProjector: true,
              hasAC: generateRandomNumber(0, 1) === 1,
              hasSmartBoard: generateRandomNumber(0, 1) === 1,
              isActive: true
            }, { transaction });

            classrooms.push(classroom);
          }
        }
      }

      console.log(`✅ Created ${classrooms.length} classrooms\n`);

      // ============================================
      // 8. CREATE LABS
      // ============================================
      console.log('🔬 Creating laboratories...');
      
      const labs = [];
      let labCounter = 1;

      for (let deptIndex = 0; deptIndex < departmentConfig.length; deptIndex++) {
        const deptConf = departmentConfig[deptIndex];
        const dept = departments[deptIndex];
        
        for (let i = 0; i < deptConf.totalLabs; i++) {
          const deptFaculties = faculties.filter(f => f.departmentId === dept.id);
          const labIncharge = deptFaculties[i % deptFaculties.length];

          const lab = await Lab.create({
            collegeId: college.id,
            departmentId: dept.id,
            name: `${dept.shortName} Lab ${i + 1}`,
            labCode: `LAB-${dept.code}-${String(i + 1).padStart(2, '0')}`,
            description: `Laboratory for ${dept.name} experiments`,
            location: `${buildings[i % buildings.length]}-Ground Floor`,
            capacity: 30,
            equipment: JSON.stringify(['Computers', 'Workbenches', 'Equipment Set']),
            labInchargeId: labIncharge.userId, // Use userId instead of faculty id
            isActive: true
          }, { transaction });

          labs.push(lab);
          labCounter++;
        }
      }

      console.log(`✅ Created ${labs.length} labs\n`);

      // ============================================
      // 9. CREATE EXAM HALLS
      // ============================================
      console.log('📝 Creating exam halls...');
      
      const examHalls = [];

      for (let i = 0; i < 10; i++) {
        const examHall = await ExamHall.create({
          collegeId: college.id,
          hallName: `Exam Hall ${i + 1}`,
          hallCode: `EH-${String(i + 1).padStart(3, '0')}`,
          location: `${buildings[i % buildings.length]}-Floor ${Math.floor(i / 2) + 1}`,
          capacity: generateRandomNumber(60, 100),
          facilities: JSON.stringify(['CCTV', 'Wall Clock', 'Notice Board']),
          isActive: true
        }, { transaction });

        examHalls.push(examHall);
      }

      console.log(`✅ Created ${examHalls.length} exam halls\n`);

      // ============================================
      // 10. CREATE LIBRARY BOOKS
      // ============================================
      console.log('📚 Creating library books...');
      
      const libraryBooks = [];
      const bookCategories = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics'];
      const publishers = ['Pearson', 'McGraw Hill', 'Wiley', 'Oxford', 'Cengage', 'PHI'];

      for (let i = 0; i < 200; i++) {
        const category = bookCategories[generateRandomNumber(0, bookCategories.length - 1)];
        const publisher = publishers[generateRandomNumber(0, publishers.length - 1)];

        const book = await LibraryBook.create({
          collegeId: college.id,
          isbn: `978-${generateRandomNumber(100, 999)}-${generateRandomNumber(1000, 9999)}-${generateRandomNumber(10, 99)}-${generateRandomNumber(0, 9)}`,
          accessionNumber: `ACC${String(i + 1).padStart(6, '0')}`,
          title: `${category} Book Volume ${i + 1}`,
          author: `Author ${generateRandomNumber(1, 100)}`,
          publisher: publisher,
          edition: `${generateRandomNumber(1, 5)}th Edition`,
          publicationYear: generateRandomNumber(2015, 2024),
          category: category,
          subject: category,
          language: 'English',
          totalCopies: generateRandomNumber(3, 10),
          availableCopies: generateRandomNumber(1, 8),
          location: `Shelf-${String.fromCharCode(65 + Math.floor(i / 40))}-${generateRandomNumber(1, 10)}`,
          condition: 'good',
          price: generateRandomNumber(300, 1500),
          isActive: true
        }, { transaction });

        libraryBooks.push(book);
      }

      console.log(`✅ Created ${libraryBooks.length} library books\n`);

      // ============================================
      // 11. CREATE EXAMS
      // ============================================
      console.log('📝 Creating exams...');
      
      const exams = [];
      const examTypes = ['internal', 'final'];
      
      // Create exams for current semester courses
      for (const course of courses.slice(0, 20)) { // First 20 courses
        for (const examType of examTypes) {
          const examDate = examType === 'internal' 
            ? new Date('2024-10-15')
            : new Date('2024-12-10');

          const exam = await Exam.create({
            collegeId: college.id,
            courseId: course.id,
            examName: `${course.name} - ${examType === 'internal' ? 'Internal' : 'Final'} Exam`,
            examType: examType,
            examDate: examDate,
            startTime: '10:00:00',
            endTime: '13:00:00',
            duration: 180,
            maxMarks: examType === 'internal' ? 40 : 60,
            passingMarks: examType === 'internal' ? 16 : 24,
            examHallId: examHalls[generateRandomNumber(0, examHalls.length - 1)].id,
            invigilatorId: faculties[generateRandomNumber(0, faculties.length - 1)].id,
            instructions: 'Answer all questions. No electronic devices allowed.',
            status: 'completed',
            isActive: true
          }, { transaction });

          exams.push(exam);
        }
      }

      console.log(`✅ Created ${exams.length} exams\n`);

      // ============================================
      // 12. CREATE ASSIGNMENTS
      // ============================================
      console.log('📄 Creating assignments...');
      
      const assignments = [];

      for (const course of courses.slice(0, 15)) {
        for (let i = 0; i < 2; i++) {
          const assignment = await Assignment.create({
            courseId: course.id,
            facultyId: course.facultyId,
            title: `Assignment ${i + 1} - ${course.name}`,
            description: `Complete the exercises from chapter ${i + 1}`,
            instructions: 'Submit handwritten or typed solutions. Plagiarism will not be tolerated.',
            assignmentType: i === 0 ? 'individual' : 'project',
            maxMarks: 20,
            assignedDate: new Date('2024-09-01'),
            dueDate: new Date('2024-09-15'),
            submissionStartDate: new Date('2024-09-01'),
            submissionEndDate: new Date('2024-09-15'),
            allowLateSubmission: true,
            lateSubmissionPenalty: 10,
            allowedFileTypes: JSON.stringify(['pdf', 'doc', 'docx']),
            maxFileSize: 10485760,
            maxFiles: 3,
            status: 'active',
            isActive: true
          }, { transaction });

          assignments.push(assignment);
        }
      }

      console.log(`✅ Created ${assignments.length} assignments\n`);

      // ============================================
      // 13. CREATE TIMETABLE
      // ============================================
      console.log('⏰ Creating timetable entries...');
      
      const timetableEntries = [];
      const timeSlots = [
        { period: 1, start: '09:00:00', end: '10:00:00' },
        { period: 2, start: '10:00:00', end: '11:00:00' },
        { period: 3, start: '11:15:00', end: '12:15:00' },
        { period: 4, start: '12:15:00', end: '13:15:00' },
        { period: 5, start: '14:00:00', end: '15:00:00' },
        { period: 6, start: '15:00:00', end: '16:00:00' }
      ];

      // Create timetable for a few sections (sample)
      for (const section of sections.slice(0, 10)) {
        const deptCourses = courses.filter(c => 
          c.departmentId === section.departmentId && 
          c.semester === section.semester
        ).slice(0, 5);

        for (let day = 1; day <= 5; day++) { // Monday to Friday
          for (let periodIdx = 0; periodIdx < Math.min(timeSlots.length, deptCourses.length); periodIdx++) {
            const course = deptCourses[periodIdx];
            const slot = timeSlots[periodIdx];
            const classroom = classrooms[generateRandomNumber(0, 19)]; // Random classroom

            const timetable = await Timetable.create({
              collegeId: college.id,
              sectionId: section.id,
              courseId: course.id,
              facultyId: course.facultyId,
              classroomId: classroom.id,
              dayOfWeek: day,
              startTime: slot.start,
              endTime: slot.end,
              period: slot.period,
              academicYear: '2024-25',
              semester: section.semester,
              classType: 'theory',
              effectiveFrom: new Date('2024-07-01'),
              isActive: true
            }, { transaction });

            timetableEntries.push(timetable);
          }
        }
      }

      console.log(`✅ Created ${timetableEntries.length} timetable entries\n`);

      // ============================================
      // 14. CREATE SAMPLE TRANSACTIONS (FEE PAYMENTS)
      // ============================================
      console.log('💰 Creating fee transactions...');
      
      const transactions = [];
      const paymentMethods = ['upi', 'card', 'bank_transfer', 'cash'];

      for (const student of students.slice(0, 50)) { // First 50 students
        const txn = await Transaction.create({
          collegeId: college.id,
          type: 'income',
          category: 'tuition_fee',
          amount: 7500000, // 75000 in paisa
          description: 'Semester Fee Payment',
          studentId: student.id,
          paymentMethod: paymentMethods[generateRandomNumber(0, 3)],
          status: 'paid',
          dueDate: new Date('2024-07-15'),
          paidDate: new Date('2024-07-10'),
          referenceNumber: `TXN${Date.now()}${generateRandomNumber(1000, 9999)}`,
          receiptNumber: `RCP${Date.now()}${generateRandomNumber(1000, 9999)}`,
          academicYear: '2024-25',
          semester: student.currentSemester,
          isActive: true
        }, { transaction });

        transactions.push(txn);
      }

      console.log(`✅ Created ${transactions.length} transactions\n`);

      // Commit transaction
      await transaction.commit();

      // ============================================
      // SUMMARY
      // ============================================
      console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
      console.log('📊 Summary:');
      console.log(`   ✅ College: 1`);
      console.log(`   ✅ Admin Users: 1`);
      console.log(`   ✅ Departments: ${departments.length}`);
      console.log(`   ✅ Faculty: ${faculties.length}`);
      console.log(`   ✅ Students: ${students.length}`);
      console.log(`   ✅ Courses: ${courses.length}`);
      console.log(`   ✅ Sections: ${sections.length}`);
      console.log(`   ✅ Classrooms: ${classrooms.length}`);
      console.log(`   ✅ Labs: ${labs.length}`);
      console.log(`   ✅ Exam Halls: ${examHalls.length}`);
      console.log(`   ✅ Library Books: ${libraryBooks.length}`);
      console.log(`   ✅ Exams: ${exams.length}`);
      console.log(`   ✅ Assignments: ${assignments.length}`);
      console.log(`   ✅ Timetable Entries: ${timetableEntries.length}`);
      console.log(`   ✅ Transactions: ${transactions.length}`);
      console.log('\n📝 Login Credentials:');
      console.log(`   Email: admin@teccollege.edu.in`);
      console.log(`   Password: Admin@123`);
      console.log(`   Role: admin`);
      console.log('\n🎓 Sample Faculty Login:');
      console.log(`   Any faculty email from the created list`);
      console.log(`   Password: Admin@123`);
      console.log('\n👨‍🎓 Sample Student Login:');
      console.log(`   Any student email from the created list`);
      console.log(`   Password: Admin@123`);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding
seedData();

