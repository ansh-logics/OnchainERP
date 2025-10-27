const { Faculty, Assignment, AssignmentSubmission } = require('../models');

class FacultyService {
  // Faculty services
  async createFaculty(facultyData) {
    return await Faculty.create(facultyData);
  }

  async getFacultyById(id) {
    return await Faculty.findByPk(id, {
      include: ['user', 'college', 'department', 'sections']
    });
  }

  async getFacultyByDepartment(departmentId) {
    return await Faculty.findAll({
      where: { departmentId },
      include: ['user', 'college', 'department']
    });
  }

  // Assignment services
  async createAssignment(assignmentData) {
    return await Assignment.create(assignmentData);
  }

  async getAssignmentById(id) {
    return await Assignment.findByPk(id, {
      include: ['course', 'faculty', 'submissions']
    });
  }

  async getAssignmentsByFaculty(facultyId) {
    return await Assignment.findAll({
      where: { facultyId },
      include: ['course', 'faculty', 'submissions'],
      order: [['dueDate', 'ASC']]
    });
  }

  async getAssignmentsByCourse(courseId) {
    return await Assignment.findAll({
      where: { courseId },
      include: ['course', 'faculty', 'submissions'],
      order: [['dueDate', 'ASC']]
    });
  }

  // Assignment submission services
  async submitAssignment(submissionData) {
    return await AssignmentSubmission.create(submissionData);
  }

  async getSubmissionById(id) {
    return await AssignmentSubmission.findByPk(id, {
      include: ['assignment', 'student', 'grader']
    });
  }

  async getSubmissionsByAssignment(assignmentId) {
    return await AssignmentSubmission.findAll({
      where: { assignmentId },
      include: ['assignment', 'student', 'grader'],
      order: [['submittedAt', 'DESC']]
    });
  }

  async gradeSubmission(submissionId, grade, feedback, gradedBy) {
    return await AssignmentSubmission.update(
      { 
        grade, 
        feedback, 
        gradedBy,
        gradedAt: new Date()
      },
      { 
        where: { id: submissionId },
        returning: true 
      }
    );
  }
}

module.exports = new FacultyService();
