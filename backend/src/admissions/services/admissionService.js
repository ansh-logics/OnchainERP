const { Student, User, Department } = require('../../shared/db/models');
const { Op } = require('sequelize');
const LoggingService = require('../../shared/services/LoggingService');

class AdmissionService {
  static async createStudent(studentData, userId) {
    try {
      const student = await Student.create(studentData);
      
      await LoggingService.logUserAction(
        'student_created',
        userId,
        { studentId: student.id, rollNumber: student.rollNumber }
      );
      
      return student;
    } catch (error) {
      await LoggingService.logError('admission', 'create_student', userId, error);
      throw error;
    }
  }
  
  static async getAllStudents(filters = {}) {
    const { collegeId, departmentId, status, limit = 100, offset = 0 } = filters;
    
    const whereClause = {};
    if (collegeId) whereClause.collegeId = collegeId;
    if (departmentId) whereClause.departmentId = departmentId;
    if (status) whereClause.status = status;
    
    return await Student.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name', 'code']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }
  
  static async getStudentById(id) {
    return await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name', 'code']
        }
      ]
    });
  }
  
  static async updateStudent(id, updateData, userId) {
    try {
      const [updatedRowsCount] = await Student.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount > 0) {
        await LoggingService.logUserAction(
          'student_updated',
          userId,
          { studentId: id, updatedFields: Object.keys(updateData) }
        );
        
        return await this.getStudentById(id);
      }
      
      return null;
    } catch (error) {
      await LoggingService.logError('admission', 'update_student', userId, error);
      throw error;
    }
  }
  
  static async deleteStudent(id, userId) {
    try {
      const deletedRowsCount = await Student.destroy({
        where: { id }
      });
      
      if (deletedRowsCount > 0) {
        await LoggingService.logUserAction(
          'student_deleted',
          userId,
          { studentId: id }
        );
      }
      
      return deletedRowsCount > 0;
    } catch (error) {
      await LoggingService.logError('admission', 'delete_student', userId, error);
      throw error;
    }
  }
}

module.exports = AdmissionService;
