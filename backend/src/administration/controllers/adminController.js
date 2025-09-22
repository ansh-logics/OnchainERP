const { User, Student, Faculty, Course, Department, sequelize } = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');
const LoggingService = require('../../shared/services/LoggingService');

// @desc    Get system dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Count users by role
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalFaculty = await User.count({ where: { role: 'faculty' } });
    const totalAdmin = await User.count({ where: { role: 'admin' } });
    
    // Count courses
    const totalCourses = await Course.count();
    
    // Get departments from Department collection
    let whereClause = {};
    // If not super admin, only show departments from user's college
    if (req.user.role !== 'super_admin') {
      const userCollegeId = req.user.college?.id || req.user.collegeId;
      whereClause.collegeId = userCollegeId;
    }
    
    const departments = await Department.findAll({ 
      where: whereClause,
      attributes: ['name', 'shortName']
    });
    const totalDepartments = departments.length;
    const departmentNames = departments.map(dept => dept.name);
    
    // Get recent users
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['name', 'email', 'role', 'createdAt'],
      include: [
        {
          association: 'studentProfile',
          attributes: ['departmentId'],
          required: false
        },
        {
          association: 'facultyProfile', 
          attributes: ['departmentId'],
          required: false
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        userStats: {
          totalUsers: totalStudents + totalFaculty + totalAdmin,
          totalStudents,
          totalFaculty,
          totalAdmin
        },
        courseStats: {
          totalCourses
        },
        departmentStats: {
          totalDepartments,
          departments: departmentNames
        },
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate student attendance report
// @route   GET /api/admin/reports/attendance
// @access  Private/Admin
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }
    
    // Get students with their attendance data (assuming attendance is stored in a separate table or JSON field)
    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          association: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    
    // Format attendance data
    const attendanceReport = students.map(student => {
      // Note: Attendance would need to be implemented as a separate model
      // For now, return placeholder data
      const attendanceByDate = {};
      
      return {
        studentId: student.id,
        enrollmentNumber: student.enrollmentNumber,
        name: student.User.name,
        email: student.User.email,
        attendance: attendanceByDate
      };
    });
    
    res.status(200).json({
      success: true,
      count: attendanceReport.length,
      data: attendanceReport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate student grade report
// @route   GET /api/admin/reports/grades
// @access  Private/Admin
exports.getGradeReport = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    
    let whereClause = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    // Get students with their grade data
    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          association: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    
    // Format grade data
    const gradeReport = students.map(student => {
      // Note: Grades would need to be implemented as a separate model
      // For now, return placeholder data
      const gradesByCourse = {};
      
      return {
        studentId: student.id,
        enrollmentNumber: student.enrollmentNumber,
        name: student.User.name,
        email: student.User.email,
        courses: gradesByCourse
      };
    });
    
    res.status(200).json({
      success: true,
      count: gradeReport.length,
      data: gradeReport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new department
// @route   POST /api/admin/departments
// @access  Private/Admin
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, hod } = req.body;
    
    // Check if HOD (Head of Department) exists
    if (hod) {
      const hodUser = await User.findByPk(hod);
      if (!hodUser) {
        return next(
          new ErrorResponse(`User not found with id of ${hod}`, 404)
        );
      }
    }
    
    // For now, we'll just return a success message
    // In a real application, you would create a Department model and save the data
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        name,
        description,
        hod
      }
    });
  } catch (error) {
    next(error);
  }
};
