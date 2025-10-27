const { sequelize } = require('../src/shared/db/database');

async function migrateAssignmentsToSectionBased() {
  console.log('🔄 Starting migration: Course-based to Section-based Assignments');

  try {
    // Check if migration is needed
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'assignments' 
      AND column_name = 'courseId'
    `);

    if (results.length === 0) {
      console.log('✅ Migration already completed or not needed');
      return;
    }

    await sequelize.transaction(async (transaction) => {
      console.log('🔧 Starting database transaction...');

      // Step 1: Add sectionId column
      console.log('1️⃣ Adding sectionId column...');
      await sequelize.query(`
        ALTER TABLE assignments 
        ADD COLUMN IF NOT EXISTS "sectionId" UUID;
      `, { transaction });

      // Step 2: Update existing assignments to use sectionId
      // For this migration, we'll need to find sections based on the courseId
      console.log('2️⃣ Migrating existing assignments to section-based...');
      
      // Get all assignments with their course information
      const assignments = await sequelize.query(`
        SELECT 
          a.id,
          a."courseId",
          a."facultyId",
          c."departmentId"
        FROM assignments a
        JOIN courses c ON a."courseId" = c.id
        WHERE a."sectionId" IS NULL
      `, { transaction, type: sequelize.QueryTypes.SELECT });

      console.log(`📊 Found ${assignments.length} assignments to migrate`);

      // For each assignment, find a suitable section
      for (const assignment of assignments) {
        // Try to find a section where this faculty teaches
        const [suitableSection] = await sequelize.query(`
          SELECT DISTINCT s.id
          FROM sections s
          JOIN timetable t ON s.id = t."sectionId"
          JOIN courses c ON t."courseId" = c.id
          WHERE t."facultyId" = :facultyId
          AND c."departmentId" = :departmentId
          AND s."isActive" = true
          LIMIT 1
        `, {
          transaction,
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            facultyId: assignment.facultyId,
            departmentId: assignment.departmentId
          }
        });

        if (suitableSection) {
          await sequelize.query(`
            UPDATE assignments 
            SET "sectionId" = :sectionId
            WHERE id = :assignmentId
          `, {
            transaction,
            replacements: {
              sectionId: suitableSection.id,
              assignmentId: assignment.id
            }
          });
          console.log(`✅ Migrated assignment ${assignment.id} to section ${suitableSection.id}`);
        } else {
          console.log(`⚠️  No suitable section found for assignment ${assignment.id}, will be handled manually`);
        }
      }

      // Step 3: Make sectionId NOT NULL after migration
      console.log('3️⃣ Making sectionId column NOT NULL...');
      await sequelize.query(`
        ALTER TABLE assignments 
        ALTER COLUMN "sectionId" SET NOT NULL;
      `, { transaction });

      // Step 4: Add foreign key constraint
      console.log('4️⃣ Adding foreign key constraint...');
      await sequelize.query(`
        ALTER TABLE assignments 
        ADD CONSTRAINT fk_assignments_section 
        FOREIGN KEY ("sectionId") REFERENCES sections(id);
      `, { transaction });

      // Step 5: Update indexes
      console.log('5️⃣ Updating indexes...');
      
      // Drop old courseId index
      await sequelize.query(`
        DROP INDEX IF EXISTS assignments_course_id;
      `, { transaction });

      // Create new sectionId index
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS assignments_section_id 
        ON assignments("sectionId");
      `, { transaction });

      // Step 6: Remove courseId column (optional - comment out if you want to keep it)
      console.log('6️⃣ Removing courseId column...');
      await sequelize.query(`
        ALTER TABLE assignments 
        DROP COLUMN IF EXISTS "courseId";
      `, { transaction });

      console.log('✅ Transaction completed successfully');
    });

    console.log('🎉 Migration completed successfully!');
    
    // Verify migration
    const [newResults] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_assignments,
        COUNT("sectionId") as assignments_with_section
      FROM assignments
    `);

    console.log(`📊 Migration verification:`);
    console.log(`   Total assignments: ${newResults[0].total_assignments}`);
    console.log(`   Assignments with sectionId: ${newResults[0].assignments_with_section}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateAssignmentsToSectionBased()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAssignmentsToSectionBased };
