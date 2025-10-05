const { sequelize } = require('../src/shared/db/database');
const { Assignment, AssignmentSubmission, Faculty, Course, Student, User } = require('../src/shared/db/models');

async function seedAssignments() {
  try {
    console.log('🌱 Starting assignment seeding...');

    // Get faculty and courses
    const faculty = await Faculty.findAll({
      include: [{
        model: User,
        as: 'user'
      }]
    });

    const courses = await Course.findAll();
    const students = await Student.findAll();

    if (faculty.length === 0 || courses.length === 0) {
      console.log('❌ No faculty or courses found. Please seed basic data first.');
      return;
    }

    console.log(`📚 Found ${faculty.length} faculty members and ${courses.length} courses`);

    // Sample assignments data
    const assignmentsData = [
      {
        title: 'Binary Search Tree Implementation',
        description: 'Implement a complete Binary Search Tree with insertion, deletion, and traversal operations.',
        instructions: 'Submit your code in Java with proper documentation, test cases, and time complexity analysis.',
        assignmentType: 'individual',
        maxMarks: 100,
        assignedDate: '2024-10-01',
        dueDate: '2024-10-25',
        submissionFormat: 'java,pdf,txt'
      },
      {
        title: 'Database Design Project',
        description: 'Design a complete database schema for a Library Management System.',
        instructions: 'Create ER diagrams, normalize to 3NF, and provide SQL scripts for table creation.',
        assignmentType: 'individual',
        maxMarks: 80,
        assignedDate: '2024-10-05',
        dueDate: '2024-10-28',
        submissionFormat: 'pdf,sql'
      },
      {
        title: 'Web Development Group Project',
        description: 'Create a responsive e-commerce website using React and Node.js.',
        instructions: 'Include user authentication, product catalog, shopping cart, and payment integration.',
        assignmentType: 'group',
        maxMarks: 150,
        assignedDate: '2024-09-25',
        dueDate: '2024-11-05',
        submissionFormat: 'zip,pdf'
      },
      {
        title: 'Data Structures Performance Analysis',
        description: 'Compare the performance of different sorting algorithms.',
        instructions: 'Implement at least 5 sorting algorithms and provide detailed performance comparison.',
        assignmentType: 'lab',
        maxMarks: 60,
        assignedDate: '2024-10-10',
        dueDate: '2024-10-30',
        submissionFormat: 'java,pdf'
      },
      {
        title: 'AI Ethics Research Paper',
        description: 'Write a comprehensive research paper on ethical implications of AI in healthcare.',
        instructions: 'Minimum 15 pages, APA format, at least 20 scholarly references.',
        assignmentType: 'individual',
        maxMarks: 100,
        assignedDate: '2024-10-08',
        dueDate: '2024-11-15',
        submissionFormat: 'pdf,doc'
      }
    ];

    // Create assignments
    for (let i = 0; i < assignmentsData.length && i < faculty.length && i < courses.length; i++) {
      const assignmentData = {
        ...assignmentsData[i],
        facultyId: faculty[i % faculty.length].id,
        courseId: courses[i % courses.length].id
      };

      const assignment = await Assignment.create(assignmentData);
      console.log(`✅ Created assignment: ${assignment.title}`);

      // Create some submissions for each assignment
      const numSubmissions = Math.min(3, students.length);
      for (let j = 0; j < numSubmissions; j++) {
        const student = students[j];
        const submissionDate = new Date(assignment.assignedDate);
        submissionDate.setDate(submissionDate.getDate() + Math.floor(Math.random() * 20) + 1);
        
        const isLateSubmission = submissionDate > new Date(assignment.dueDate);
        const hasGrade = Math.random() > 0.5; // 50% chance of being graded

        const submissionData = {
          assignmentId: assignment.id,
          studentId: student.id,
          submissionDate,
          isLateSubmission,
          submissionText: `This is my submission for ${assignment.title}. I have completed all the required tasks.`,
          fileUrls: [
            `/uploads/assignments/sample-submission-${j + 1}.pdf`,
            `/uploads/assignments/sample-code-${j + 1}.java`
          ]
        };

        if (hasGrade) {
          submissionData.marksObtained = Math.floor(Math.random() * assignment.maxMarks * 0.4) + Math.floor(assignment.maxMarks * 0.6); // 60-100% range
          submissionData.feedback = 'Good work! Well structured code and clear documentation.';
          submissionData.gradedBy = assignment.facultyId;
          submissionData.gradedAt = new Date(submissionDate.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days after submission
          submissionData.status = 'graded';
        } else {
          submissionData.status = 'submitted';
        }

        await AssignmentSubmission.create(submissionData);
        console.log(`  📝 Created submission by student ${j + 1}${hasGrade ? ' (graded)' : ' (pending)'}`);
      }
    }

    console.log('✅ Assignment seeding completed successfully!');
    console.log('\n🎯 Sample Data Created:');
    console.log(`   - ${assignmentsData.length} assignments`);
    console.log(`   - Sample submissions for each assignment`);
    console.log(`   - Mix of graded and pending submissions`);
    console.log('\n🎯 You can now test:');
    console.log('   1. Faculty can create, view, and manage assignments');
    console.log('   2. Students can view assignments and submit work');
    console.log('   3. Faculty can grade submissions and provide feedback');
    console.log('   4. File upload functionality for submissions');

  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedAssignments()
    .then(() => {
      console.log('🌱 Assignment seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Assignment seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAssignments;
