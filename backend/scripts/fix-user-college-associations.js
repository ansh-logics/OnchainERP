const { User, College } = require('../src/shared/db/models');

const fixUserCollegeAssociations = async () => {
  try {
    console.log('Starting user-college association fix...');
    
    // Find all users without collegeId
    const usersWithoutCollege = await User.findAll({
      where: {
        collegeId: null,
        role: ['admin', 'faculty', 'student', 'cashier']
      }
    });
    
    console.log(`Found ${usersWithoutCollege.length} users without college association`);
    
    if (usersWithoutCollege.length === 0) {
      console.log('No users need fixing');
      return;
    }
    
    // Check if there are any colleges
    const colleges = await College.findAll({
      attributes: ['id', 'name', 'adminId']
    });
    
    if (colleges.length === 0) {
      console.log('No colleges found in database');
      return;
    }
    
    console.log(`Found ${colleges.length} colleges`);
    
    // For each user without college, try to associate them
    for (const user of usersWithoutCollege) {
      console.log(`Processing user: ${user.email} (${user.role})`);
      
      if (user.role === 'admin') {
        // For admin users, find a college where they are the admin
        const college = colleges.find(c => c.adminId === user.id);
        if (college) {
          await user.update({ collegeId: college.id });
          console.log(`  ✓ Associated admin ${user.email} with college ${college.name}`);
        } else {
          // If no college found for admin, associate with first college
          await user.update({ collegeId: colleges[0].id });
          console.log(`  ✓ Associated admin ${user.email} with default college ${colleges[0].name}`);
        }
      } else {
        // For non-admin users, associate with the first available college
        await user.update({ collegeId: colleges[0].id });
        console.log(`  ✓ Associated ${user.role} ${user.email} with college ${colleges[0].name}`);
      }
    }
    
    console.log('User-college association fix completed successfully');
    
  } catch (error) {
    console.error('Error fixing user-college associations:', error);
  }
};

// Run the fix if this script is executed directly
if (require.main === module) {
  fixUserCollegeAssociations()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = fixUserCollegeAssociations;
