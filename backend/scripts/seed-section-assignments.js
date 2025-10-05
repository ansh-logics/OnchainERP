const { sequelize } = require('../src/shared/db/database');
const Assignment = require('../src/shared/db/models/postgresql/Assignment');
const AssignmentSubmission = require('../src/shared/db/models/postgresql/AssignmentSubmission');
const Faculty = require('../src/shared/db/models/postgresql/Faculty');
const Section = require('../src/shared/db/models/postgresql/Section');
const Student = require('../src/shared/db/models/postgresql/Student');
const Timetable = require('../src/shared/db/models/postgresql/Timetable');
const User = require('../src/shared/db/models/postgresql/User');

async function seedSectionAssignments() {
  console.log('🌱 Starting to seed section-based assignments...');

  try {
    await sequelize.transaction(async (transaction) => {
      // Get all active faculty
      const facultyList = await Faculty.findAll({
        where: { isActive: true },
        transaction
      });

      // Get timetable entries to map faculty to sections
      const timetableEntries = await Timetable.findAll({
        where: { isActive: true },
        transaction
      });

      // Get all sections
      const sections = await Section.findAll({
        where: { isActive: true },
        transaction
      });

      // Create faculty-section mapping
      const facultySectionMap = new Map();
      for (const entry of timetableEntries) {
        if (!facultySectionMap.has(entry.facultyId)) {
          facultySectionMap.set(entry.facultyId, new Set());
        }
        facultySectionMap.get(entry.facultyId).add(entry.sectionId);
      }

      const facultyWithSections = facultyList.map(faculty => {
        const sectionIds = facultySectionMap.get(faculty.id) || new Set();
        const facultySections = sections.filter(section => sectionIds.has(section.id));
        return {
          ...faculty.toJSON(),
          timetableEntries: facultySections
        };
      });

      console.log(`👥 Found ${facultyWithSections.length} active faculty members`);

      const assignmentTypes = ['individual', 'group', 'lab', 'project', 'quiz', 'presentation'];
      const submissionFormats = ['pdf', 'doc,docx', 'pdf,doc,docx', 'zip'];
      
      let assignmentCount = 0;
      let submissionCount = 0;

      for (const faculty of facultyWithSections) {
        if (!faculty.timetableEntries || faculty.timetableEntries.length === 0) {
          console.log(`⚠️  Faculty ${faculty.id} has no timetable entries, skipping...`);
          continue;
        }

        console.log(`📚 Faculty ${faculty.id} teaches ${faculty.timetableEntries.length} sections`);

        for (const section of faculty.timetableEntries) {
          // Create 2-4 assignments per section
          const numAssignments = Math.floor(Math.random() * 3) + 2;

          for (let i = 0; i < numAssignments; i++) {
            const assignmentType = assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)];
            const submissionFormat = submissionFormats[Math.floor(Math.random() * submissionFormats.length)];
            
            // Generate dates
            const now = new Date();
            const assignedDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // 0-7 days ago
            const dueDate = new Date(now.getTime() + (Math.random() * 14 + 1) * 24 * 60 * 60 * 1000); // 1-15 days from now
            const submissionStartDate = assignedDate;
            const submissionEndDate = dueDate;

            const assignment = await Assignment.create({
              sectionId: section.id,
              facultyId: faculty.id,
              title: `${assignmentType.charAt(0).toUpperCase() + assignmentType.slice(1)} Assignment ${i + 1}`,
              description: `This is a ${assignmentType} assignment for ${section.name} (${section.code}). Please complete the given tasks and submit your work before the due date.`,
              instructions: `
                Instructions for this ${assignmentType} assignment:
                1. Read the assignment requirements carefully
                2. Complete all sections as specified
                3. Submit in ${submissionFormat} format
                4. Ensure your work is original
                5. Submit before the due date to avoid penalty
              `,
              assignmentType,
              submissionFormat,
              maxMarks: Math.floor(Math.random() * 50) + 50, // 50-100 marks
              assignedDate,
              dueDate,
              submissionStartDate,
              submissionEndDate,
              allowLateSubmission: Math.random() > 0.5,
              lateSubmissionPenalty: Math.floor(Math.random() * 20), // 0-20% penalty
              allowedFileTypes: submissionFormat.split(','),
              maxFileSize: 10485760, // 10MB
              maxFiles: Math.floor(Math.random() * 3) + 1, // 1-3 files
              status: 'active'
            }, { transaction });

            assignmentCount++;
            console.log(`✅ Created assignment: ${assignment.title} for ${section.name}`);

            // Get students in this section for submissions
            const students = await Student.findAll({
              where: { 
                sectionId: section.id,
                isActive: true
              },
              attributes: ['id'],
              transaction
            });

            // Create some submissions (60-80% submission rate)
            const submissionRate = 0.6 + Math.random() * 0.2;
            const numSubmissions = Math.floor(students.length * submissionRate);
            const submittingStudents = students.sort(() => 0.5 - Math.random()).slice(0, numSubmissions);

            for (const student of submittingStudents) {
              const submissionDate = new Date(
                assignedDate.getTime() + Math.random() * (dueDate.getTime() - assignedDate.getTime())
              );
              const isLateSubmission = submissionDate > dueDate;

              // Random submission content
              const submissionTexts = [
                'Assignment completed as per requirements.',
                'Please find my submission attached.',
                'Completed the assignment with detailed explanations.',
                'All requirements have been addressed in the submission.',
                'Assignment submission with supporting documents.'
              ];

              const submission = await AssignmentSubmission.create({
                assignmentId: assignment.id,
                studentId: student.id,
                submissionDate,
                submissionText: submissionTexts[Math.floor(Math.random() * submissionTexts.length)],
                fileUrls: [`/uploads/assignments/sample-${Date.now()}-${Math.random()}.pdf`],
                isLateSubmission,
                status: 'submitted'
              }, { transaction });

              // Grade some submissions (70% grading rate)
              if (Math.random() > 0.3) {
                const marksObtained = Math.floor(Math.random() * assignment.maxMarks * 0.4) + 
                                   Math.floor(assignment.maxMarks * 0.6); // 60-100% of max marks
                
                const feedbacks = [
                  'Good work! Well structured and comprehensive.',
                  'Excellent submission. All requirements met.',
                  'Good effort. Minor improvements needed.',
                  'Well done. Clear explanations provided.',
                  'Satisfactory work. Keep up the good work.'
                ];

                await submission.update({
                  marksObtained,
                  feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
                  status: 'graded',
                  gradedAt: new Date(submissionDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000),
                  gradedBy: faculty.id
                }, { transaction });
              }

              submissionCount++;
            }
          }
        }
      }

      console.log('✅ Transaction completed successfully');
      console.log(`📊 Created ${assignmentCount} assignments and ${submissionCount} submissions`);
    });

    console.log('🎉 Section-based assignment seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedSectionAssignments()
    .then(() => {
      console.log('✅ Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSectionAssignments };
