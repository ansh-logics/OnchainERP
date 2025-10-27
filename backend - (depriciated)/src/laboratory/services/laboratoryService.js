const { Lab } = require('../models');

class LaboratoryService {
  async createLab(labData) {
    return await Lab.create(labData);
  }

  async getLabById(id) {
    return await Lab.findByPk(id, {
      include: ['college', 'department', 'labIncharge']
    });
  }

  async getLabsByCollege(collegeId) {
    return await Lab.findAll({
      where: { collegeId },
      include: ['college', 'department', 'labIncharge'],
      order: [['name', 'ASC']]
    });
  }

  async getLabsByDepartment(departmentId) {
    return await Lab.findAll({
      where: { departmentId },
      include: ['college', 'department', 'labIncharge'],
      order: [['name', 'ASC']]
    });
  }

  async updateLabCapacity(labId, capacity) {
    return await Lab.update(
      { capacity },
      { where: { id: labId }, returning: true }
    );
  }

  async assignLabIncharge(labId, labInchargeId) {
    return await Lab.update(
      { labInchargeId },
      { where: { id: labId }, returning: true }
    );
  }

  async updateLabStatus(labId, status) {
    return await Lab.update(
      { status },
      { where: { id: labId }, returning: true }
    );
  }

  async getAvailableLabs(collegeId, departmentId = null) {
    const whereClause = { 
      collegeId,
      status: 'ACTIVE'
    };
    
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    return await Lab.findAll({
      where: whereClause,
      include: ['college', 'department', 'labIncharge'],
      order: [['name', 'ASC']]
    });
  }
}

module.exports = new LaboratoryService();
