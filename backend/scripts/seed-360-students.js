const bcrypt = require('bcryptjs');
const { 
  sequelize,
  User,
  College,
  Department,
  Student
} = require('../src/shared/db/models');

// Helper function to generate random data
const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Main seeding function for 360 students
async function seed360Students() {
  try {
    console.log('🌱 Starting 360 students seeding...\n');

    // Get existing college and departments
    const college = await College.findOne();
    if (!college) {
      console.log('❌ No college found. Please run seed-college-data.js first');
      process.exit(1);
    }

    const departments = await Department.findAll({ where: { collegeId: college.id } });
    if (departments.length === 0) {
      console.log('❌ No departments found. Please run seed-college-data.js first');
      process.exit(1);
    }

    console.log(`📚 Found college: ${college.name}`);
    console.log(`📚 Found ${departments.length} departments`);

    // Clear existing students first in smaller batches
    console.log('🗑️ Clearing existing students...');
    try {
      // Clear in batches to avoid memory issues
      await sequelize.query('DELETE FROM students WHERE id IN (SELECT id FROM students LIMIT 100)');
      await sequelize.query('DELETE FROM users WHERE role = \'student\' AND id IN (SELECT id FROM users WHERE role = \'student\' LIMIT 100)');
      
      // Clear remaining
      let studentCount = await sequelize.query('SELECT COUNT(*) as count FROM students', { type: sequelize.QueryTypes.SELECT });
      while (studentCount[0].count > 0) {
        await sequelize.query('DELETE FROM students WHERE id IN (SELECT id FROM students LIMIT 50)');
        studentCount = await sequelize.query('SELECT COUNT(*) as count FROM students', { type: sequelize.QueryTypes.SELECT });
      }
      
      let userCount = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE role = \'student\'', { type: sequelize.QueryTypes.SELECT });
      while (userCount[0].count > 0) {
        await sequelize.query('DELETE FROM users WHERE role = \'student\' AND id IN (SELECT id FROM users WHERE role = \'student\' LIMIT 50)');
        userCount = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE role = \'student\'', { type: sequelize.QueryTypes.SELECT });
      }
      
      console.log('✅ Cleared existing students');
    } catch (error) {
      console.log('⚠️ Some issues clearing students, continuing anyway...');
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // ============================================
      // CREATE 360 STUDENTS
      // ============================================
      console.log('👨‍🎓 Creating 360 students...');
      
      const students = [];
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const genders = ['Male', 'Female'];
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
      const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
      const guardianRelations = ['Father', 'Mother', 'Guardian'];
      const admissionYears = [2021, 2022, 2023, 2024];
      const batches = ['2021', '2022', '2023', '2024'];

      // Extended name lists for variety
      const maleNames = ['Rahul', 'Arjun', 'Karthik', 'Rohan', 'Aditya', 'Varun', 'Nikhil', 'Abhishek', 'Vikram', 'Sanjay', 
                        'Ravi', 'Amit', 'Suresh', 'Ajay', 'Anand', 'Deepak', 'Manoj', 'Prashant', 'Sachin', 'Yogesh',
                        'Ashish', 'Gaurav', 'Harsh', 'Ishan', 'Jatin', 'Kunal', 'Lalit', 'Mayank', 'Neeraj', 'Omkar',
                        'Pankaj', 'Qasim', 'Ritesh', 'Sumit', 'Tarun', 'Ujjwal', 'Vikas', 'Wasim', 'Yash', 'Zaid',
                        'Akash', 'Bharat', 'Chetan', 'Dev', 'Eshaan', 'Faisal', 'Gopal', 'Hemant', 'Irfan', 'Jayesh'];
      const femaleNames = ['Sneha', 'Pooja', 'Divya', 'Shruti', 'Nisha', 'Riya', 'Tanvi', 'Isha', 'Kavya', 'Lata',
                          'Meera', 'Naina', 'Ojaswini', 'Priya', 'Queenie', 'Rashmi', 'Swati', 'Tanya', 'Uma', 'Vidya',
                          'Wanda', 'Xara', 'Yamini', 'Zara', 'Ananya', 'Bhavana', 'Chandni', 'Deepika', 'Esha', 'Falguni',
                          'Gauri', 'Harini', 'Indira', 'Jyoti', 'Kiran', 'Lavanya', 'Madhuri', 'Neha', 'Orvita', 'Pallavi',
                          'Quincy', 'Radha', 'Sanya', 'Trisha', 'Urvashi', 'Vani', 'Wendy', 'Ximena', 'Yasmin', 'Zoya'];
      const lastNames = ['Gupta', 'Verma', 'Joshi', 'Pillai', 'Menon', 'Shah', 'Desai', 'Kulkarni', 'Agarwal', 'Bansal',
                        'Chandra', 'Dutta', 'Eyer', 'Fernandes', 'Ghosh', 'Hegde', 'Iyer', 'Jain', 'Kapoor', 'Lal',
                        'Mishra', 'Nair', 'Oak', 'Patel', 'Qureshi', 'Rao', 'Sharma', 'Trivedi', 'Upadhyay', 'Varma',
                        'Wadhwa', 'Xavier', 'Yadav', 'Zaveri', 'Arora', 'Bajaj', 'Chopra', 'Das', 'Ehsan', 'Garg',
                        'Hussain', 'Ingle', 'Joshi', 'Khan', 'Lamba', 'Mathur', 'Naresh', 'Oberoi', 'Pandey', 'Raj'];

      let totalStudentsCreated = 0;
      let deptStudentCounts = {};

      // Student distribution for exactly 360 students across existing departments
      // Will distribute evenly or based on department codes found
      let studentDistribution = {};
      
      if (departments.length === 2) {
        // If 2 departments, split 360 students: 180 each
        studentDistribution = {
          'CSE': 180,   // 45 per batch * 4 batches
          'AIML': 180   // 45 per batch * 4 batches
        };
      } else {
        // Fallback: distribute evenly
        const studentsPerDept = Math.floor(360 / departments.length);
        departments.forEach(dept => {
          studentDistribution[dept.code] = studentsPerDept;
        });
      }

      for (const dept of departments) {
        deptStudentCounts[dept.code] = 0;
        const totalStudentsForDept = studentDistribution[dept.code] || 60;
        const studentsPerBatch = Math.floor(totalStudentsForDept / 4);

        // Create students for different batches
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          const admissionYear = admissionYears[batchIndex];
          const currentSemester = Math.min((2024 - admissionYear) * 2 + 2, 8); // Max semester 8

          for (let i = 0; i < studentsPerBatch; i++) {
            const gender = genders[generateRandomNumber(0, 1)];
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
              studentId: rollNumber,
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
              currentSemester: currentSemester,
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
              guardianEmail: `guardian.${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
              guardianOccupation: ['Business', 'Service', 'Professional', 'Farmer'][generateRandomNumber(0, 3)],
              cgpa: (7.0 + Math.random() * 2.5).toFixed(2),
              totalCredits: Math.max((currentSemester - 1) * 20, 0),
              admissionStatus: 'enrolled',
              isActive: true
            }, { transaction });

            students.push(student);
            totalStudentsCreated++;
            deptStudentCounts[dept.code]++;

            // Progress indicator
            if (totalStudentsCreated % 50 === 0) {
              console.log(`   Created ${totalStudentsCreated} students...`);
            }
          }
        }
      }

      // Commit transaction
      await transaction.commit();

      console.log(`✅ Created ${totalStudentsCreated} students total`);
      console.log(`📊 Department-wise distribution:`);
      for (const [deptCode, count] of Object.entries(deptStudentCounts)) {
        console.log(`   ${deptCode}: ${count} students`);
      }
      console.log('');
      console.log('🎉 360 students seeded successfully!');

      // Verify count
      const verifyCount = await Student.count();
      console.log(`🔍 Verification: Total students in database: ${verifyCount}`);

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error seeding 360 students:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding function
if (require.main === module) {
  seed360Students();
}

module.exports = seed360Students;
