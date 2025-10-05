const { 
  sequelize,
  Student,
  Fee,
  Transaction
} = require('../src/shared/db/models');

// Function to update fee data for testing
async function updateFeeData() {
  try {
    console.log('🏦 Updating fee data for testing...\n');

    const transaction = await sequelize.transaction();

    try {
      // Get all students
      const students = await Student.findAll({
        limit: 15 // Work with first 15 students
      });

      if (students.length === 0) {
        console.log('❌ No students found. Please run the main seeding script first.');
        return;
      }

      const feeRecords = [];
      
      console.log('💰 Creating fee records with partial payments...');

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        // Define total fees based on department/course
        let totalFees = 150000; // Default fee
        
        // Different fee amounts for different scenarios
        if (i < 3) {
          totalFees = 175000; // Higher fees for first 3 students
        } else if (i < 6) {
          totalFees = 150000; // Standard fees
        } else if (i < 9) {
          totalFees = 125000; // Lower fees
        } else {
          totalFees = 200000; // Premium course fees
        }

        // Create different payment scenarios
        let paidAmount = 0;
        let feeStatus = 'Unpaid';

        if (i < 2) {
          // Students with no payment (Unpaid)
          paidAmount = 0;
          feeStatus = 'Unpaid';
        } else if (i < 8) {
          // Students with partial payment
          paidAmount = totalFees * (0.3 + Math.random() * 0.4); // 30-70% paid
          feeStatus = 'Partial';
        } else if (i < 12) {
          // Students with almost full payment (still partial)
          paidAmount = totalFees * (0.7 + Math.random() * 0.25); // 70-95% paid
          feeStatus = 'Partial';
        } else {
          // Students with full payment (these will be updated to partial)
          paidAmount = totalFees; // Will be reduced below
          feeStatus = 'Paid';
        }

        // For "fully paid" students, reduce their payment to create pending amount
        if (feeStatus === 'Paid') {
          paidAmount = totalFees * 0.6; // Reduce to 60% paid
          feeStatus = 'Partial';
        }

        // Round amounts
        paidAmount = Math.round(paidAmount);

        // Check if fee record exists
        let feeRecord = await Fee.findOne({
          where: {
            studentId: student.id,
            academicYear: '2024-25',
            semester: student.currentSemester || 1
          }
        });

        if (feeRecord) {
          // Update existing fee record
          await feeRecord.update({
            totalFees,
            paidAmount,
            feeStatus
          }, { transaction });
        } else {
          // Create new fee record
          feeRecord = await Fee.create({
            studentId: student.id,
            collegeId: student.collegeId,
            academicYear: '2024-25',
            semester: student.currentSemester || 1,
            totalFees,
            paidAmount,
            feeStatus,
            dueDate: new Date('2024-12-31'),
            isActive: true
          }, { transaction });
        }

        feeRecords.push(feeRecord);

        // Create transaction record if payment was made
        if (paidAmount > 0) {
          const txnExists = await Transaction.findOne({
            where: {
              studentId: student.id,
              category: 'tuition_fee',
              academicYear: '2024-25'
            }
          });

          if (!txnExists) {
            await Transaction.create({
              collegeId: student.collegeId,
              studentId: student.id,
              type: 'income',
              category: 'tuition_fee',
              amount: paidAmount * 100, // Convert to paisa
              description: `Partial fee payment for student ${student.enrollmentNumber}`,
              paymentMethod: ['upi', 'card', 'bank_transfer'][Math.floor(Math.random() * 3)],
              status: 'paid',
              paidDate: new Date(),
              referenceNumber: `FEE-${Date.now()}-${student.id.slice(0, 8)}`,
              academicYear: '2024-25',
              semester: student.currentSemester || 1
            }, { transaction });
          }
        }
      }

      await transaction.commit();

      // Display summary
      console.log('\n✅ Fee data update completed!');
      console.log('\n📊 Summary:');
      
      const unpaidCount = feeRecords.filter(f => f.feeStatus === 'Unpaid').length;
      const partialCount = feeRecords.filter(f => f.feeStatus === 'Partial').length;
      const paidCount = feeRecords.filter(f => f.feeStatus === 'Paid').length;
      
      console.log(`   📝 Total Students: ${feeRecords.length}`);
      console.log(`   ❌ Unpaid: ${unpaidCount}`);
      console.log(`   ⏳ Partial: ${partialCount}`);
      console.log(`   ✅ Paid: ${paidCount}`);
      
      console.log('\n💡 Students with pending payments:');
      
      for (let i = 0; i < Math.min(10, feeRecords.length); i++) {
        const fee = feeRecords[i];
        const student = students[i];
        const remaining = fee.totalFees - fee.paidAmount;
        
        if (remaining > 0) {
          console.log(`   ${student.enrollmentNumber}: ₹${remaining.toLocaleString()} pending (${fee.feeStatus})`);
        }
      }

      console.log('\n🎯 Ready for Razorpay testing!');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error updating fee data:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the update
updateFeeData();
