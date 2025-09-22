const { Course, Section, Timetable, Classroom, Department } = require('../models');

class AcademicService {
  // Course services
  async createCourse(courseData) {
    return await Course.create(courseData);
  }

  async getCourseById(id) {
    return await Course.findByPk(id, {
      include: ['college', 'department']
    });
  }

  async getCoursesByDepartment(departmentId) {
    return await Course.findAll({
      where: { departmentId },
      include: ['college', 'department']
    });
  }

  // Department services
  async createDepartment(departmentData) {
    return await Department.create(departmentData);
  }

  async getDepartmentById(id) {
    return await Department.findByPk(id, {
      include: ['college', 'hod', 'courses', 'sections']
    });
  }

  // Section services
  async createSection(sectionData) {
    return await Section.create(sectionData);
  }

  async getSectionsByDepartment(departmentId) {
    return await Section.findAll({
      where: { departmentId },
      include: ['college', 'department', 'classTeacher']
    });
  }

  // Classroom services
  async createClassroom(classroomData) {
    return await Classroom.create(classroomData);
  }

  async getClassroomsByCollege(collegeId) {
    return await Classroom.findAll({
      where: { collegeId },
      include: ['college']
    });
  }

  // Timetable services
  async createTimetable(timetableData) {
    return await Timetable.create(timetableData);
  }

  async getTimetableBySection(sectionId) {
    return await Timetable.findAll({
      where: { sectionId },
      include: ['college', 'section', 'course', 'faculty', 'classroom']
    });
  }
}

module.exports = new AcademicService();
