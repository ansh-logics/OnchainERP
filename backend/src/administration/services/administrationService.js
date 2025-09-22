const { College, User } = require('../models');

class AdministrationService {
  // College services
  async createCollege(collegeData) {
    return await College.create(collegeData);
  }

  async getCollegeById(id) {
    return await College.findByPk(id, {
      include: ['admin']
    });
  }

  async getAllColleges() {
    return await College.findAll({
      include: ['admin'],
      order: [['name', 'ASC']]
    });
  }

  async updateCollege(id, updateData) {
    return await College.update(updateData, {
      where: { id },
      returning: true
    });
  }

  async deleteCollege(id) {
    return await College.destroy({
      where: { id }
    });
  }

  // User services (admin related)
  async getUserById(id) {
    return await User.findByPk(id);
  }

  async getUsersByRole(role) {
    return await User.findAll({
      where: { role },
      order: [['firstName', 'ASC']]
    });
  }

  async updateUserRole(userId, role) {
    return await User.update(
      { role },
      { where: { id: userId }, returning: true }
    );
  }

  async getCollegeStatistics(collegeId) {
    // This would typically aggregate data from other modules
    // For now, returning basic structure
    return {
      collegeId,
      totalStudents: 0,
      totalFaculty: 0,
      totalDepartments: 0,
      totalCourses: 0
    };
  }
}

module.exports = new AdministrationService();
