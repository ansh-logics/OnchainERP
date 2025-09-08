const { Department, Student } = require('../models');

/**
 * Generate roll number for a student based on department configuration
 * @param {string} departmentId - Department ObjectId
 * @param {string} admissionYear - Year of admission (e.g., "2024")
 * @returns {Promise<string>} - Generated roll number
 */
const generateRollNumber = async (departmentId, admissionYear) => {
  try {
    const department = await Department.findByPk(departmentId);
    
    if (!department) {
      throw new Error('Department not found');
    }

    const { rollNumberConfig } = department;
    const { pattern, currentNumber } = rollNumberConfig;
    
    // Parse the pattern and replace placeholders
    let rollNumber = pattern;
    
    // Replace {YEAR} with admission year (last 2 digits)
    const yearShort = admissionYear.slice(-2);
    rollNumber = rollNumber.replace('{YEAR}', yearShort);
    rollNumber = rollNumber.replace('{YY}', yearShort);
    
    // Replace {DEPT} with department short name
    rollNumber = rollNumber.replace('{DEPT}', department.shortName);
    
    // Replace {###} with current number (padded with zeros)
    const numberPadding = pattern.match(/{#+}/);
    if (numberPadding) {
      const paddingLength = numberPadding[0].length - 2; // Remove { and }
      const paddedNumber = currentNumber.toString().padStart(paddingLength, '0');
      rollNumber = rollNumber.replace(/{#+}/, paddedNumber);
    }
    
    // Increment the current number for next student
    const updatedRollNumberConfig = {
      ...department.rollNumberConfig,
      currentNumber: currentNumber + 1
    };
    await department.update({ rollNumberConfig: updatedRollNumberConfig });
    
    return rollNumber;
  } catch (error) {
    throw new Error(`Error generating roll number: ${error.message}`);
  }
};

/**
 * Assign roll numbers to all students in a department who don't have one
 * @param {string} departmentId - Department ObjectId
 * @returns {Promise<Object>} - Result with assigned count and errors
 */
const assignRollNumbers = async (departmentId) => {
  try {
    const department = await Department.findByPk(departmentId);
    
    if (!department) {
      throw new Error('Department not found');
    }

    // Get all students in this department without roll numbers
    const studentsWithoutRollNumbers = await Student.findAll({
      where: {
        departmentId: departmentId,
        rollNumber: null
      },
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });

    const results = {
      assigned: 0,
      errors: [],
      students: []
    };

    for (const student of studentsWithoutRollNumbers) {
      try {
        // Extract admission year from batch or use current year
        const admissionYear = student.batch || new Date().getFullYear().toString();
        
        const rollNumber = await generateRollNumber(departmentId, admissionYear);
        
        // Update student with roll number
        await student.update({ rollNumber });
        
        results.assigned++;
        results.students.push({
          studentId: student.id,
          name: student.user.name,
          email: student.user.email,
          rollNumber: rollNumber
        });
      } catch (error) {
        results.errors.push({
          studentId: student.id,
          name: student.user?.name || 'Unknown',
          error: error.message
        });
      }
    }

    // Mark roll numbers as assigned for this department
    await department.update({ rollNumbersAssigned: true });

    return results;
  } catch (error) {
    throw new Error(`Error assigning roll numbers: ${error.message}`);
  }
};

/**
 * Reset roll number sequence for a department
 * @param {string} departmentId - Department ObjectId
 * @param {number} newStartNumber - New starting number (optional)
 * @returns {Promise<Object>} - Updated department
 */
const resetRollNumberSequence = async (departmentId, newStartNumber = null) => {
  try {
    const department = await Department.findByPk(departmentId);
    
    if (!department) {
      throw new Error('Department not found');
    }

    // Reset to starting number or use provided number
    const resetNumber = newStartNumber || department.rollNumberConfig.startingNumber;
    const updatedRollNumberConfig = {
      ...department.rollNumberConfig,
      currentNumber: resetNumber
    };
    
    await department.update({ 
      rollNumberConfig: updatedRollNumberConfig,
      rollNumbersAssigned: false 
    });
    
    return department;
  } catch (error) {
    throw new Error(`Error resetting roll number sequence: ${error.message}`);
  }
};

/**
 * Validate roll number pattern
 * @param {string} pattern - Roll number pattern
 * @returns {boolean} - Whether pattern is valid
 */
const validateRollNumberPattern = (pattern) => {
  // Pattern should contain at least one placeholder
  const validPlaceholders = ['{YEAR}', '{YY}', '{DEPT}', '{###}'];
  
  return validPlaceholders.some(placeholder => 
    pattern.includes(placeholder) || pattern.includes('{##}') || pattern.includes('{####}')
  );
};

module.exports = {
  generateRollNumber,
  assignRollNumbers,
  resetRollNumberSequence,
  validateRollNumberPattern
};
