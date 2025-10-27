const { Student, Attendance } = require('../models');

class StudentService {
  // Attendance services
  async markAttendance(attendanceData) {
    return await Attendance.create(attendanceData);
  }

  async getStudentAttendance(studentId, courseId = null) {
    const whereClause = { studentId };
    if (courseId) {
      whereClause.courseId = courseId;
    }

    return await Attendance.findAll({
      where: whereClause,
      include: ['student', 'course', 'faculty', 'marker'],
      order: [['date', 'DESC']]
    });
  }

  async getAttendanceByDateRange(studentId, startDate, endDate) {
    return await Attendance.findAll({
      where: {
        studentId,
        date: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      },
      include: ['student', 'course', 'faculty', 'marker'],
      order: [['date', 'DESC']]
    });
  }

  async getAttendanceStatistics(studentId, courseId = null) {
    const whereClause = { studentId };
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const totalClasses = await Attendance.count({
      where: whereClause
    });

    const attendedClasses = await Attendance.count({
      where: {
        ...whereClause,
        status: 'PRESENT'
      }
    });

    return {
      totalClasses,
      attendedClasses,
      attendancePercentage: totalClasses > 0 ? (attendedClasses / totalClasses * 100) : 0
    };
  }
}

module.exports = new StudentService();
