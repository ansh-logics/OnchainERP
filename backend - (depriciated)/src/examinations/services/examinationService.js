const { Exam, ExamHall, ExamResult } = require('../models');

class ExaminationService {
  // Exam Hall services
  async createExamHall(examHallData) {
    return await ExamHall.create(examHallData);
  }

  async getExamHallById(id) {
    return await ExamHall.findByPk(id, {
      include: ['college']
    });
  }

  async getExamHallsByCollege(collegeId) {
    return await ExamHall.findAll({
      where: { collegeId },
      include: ['college']
    });
  }

  // Exam services
  async createExam(examData) {
    return await Exam.create(examData);
  }

  async getExamById(id) {
    return await Exam.findByPk(id, {
      include: ['college', 'course', 'examHall', 'invigilator', 'results']
    });
  }

  async getExamsByCollege(collegeId) {
    return await Exam.findAll({
      where: { collegeId },
      include: ['college', 'course', 'examHall', 'invigilator'],
      order: [['examDate', 'ASC']]
    });
  }

  async getExamsByCourse(courseId) {
    return await Exam.findAll({
      where: { courseId },
      include: ['college', 'course', 'examHall', 'invigilator'],
      order: [['examDate', 'ASC']]
    });
  }

  // Exam Result services
  async createExamResult(resultData) {
    return await ExamResult.create(resultData);
  }

  async getExamResultById(id) {
    return await ExamResult.findByPk(id, {
      include: ['exam', 'student', 'evaluator']
    });
  }

  async getResultsByExam(examId) {
    return await ExamResult.findAll({
      where: { examId },
      include: ['exam', 'student', 'evaluator'],
      order: [['marksObtained', 'DESC']]
    });
  }

  async getResultsByStudent(studentId) {
    return await ExamResult.findAll({
      where: { studentId },
      include: ['exam', 'student', 'evaluator'],
      order: [['createdAt', 'DESC']]
    });
  }

  async updateExamResult(resultId, updateData) {
    return await ExamResult.update(updateData, {
      where: { id: resultId },
      returning: true
    });
  }

  async calculateExamStatistics(examId) {
    const results = await ExamResult.findAll({
      where: { examId },
      attributes: ['marksObtained']
    });

    if (results.length === 0) {
      return { totalStudents: 0, averageMarks: 0, highestMarks: 0, lowestMarks: 0 };
    }

    const marks = results.map(r => r.marksObtained);
    const totalStudents = marks.length;
    const averageMarks = marks.reduce((sum, mark) => sum + mark, 0) / totalStudents;
    const highestMarks = Math.max(...marks);
    const lowestMarks = Math.min(...marks);

    return {
      totalStudents,
      averageMarks: Math.round(averageMarks * 100) / 100,
      highestMarks,
      lowestMarks
    };
  }
}

module.exports = new ExaminationService();
