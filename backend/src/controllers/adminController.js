const { User, Student, Faculty, Course, Department } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const LoggingService = require('../services/LoggingService');

// @desc    Get system dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Count users by role
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalAdmin = await User.countDocuments({ role: 'admin' });
    
    // Count courses
    const totalCourses = await Course.countDocuments();
    
    // Get departments from Department collection
    let query = {};
    // If not super admin, only show departments from user's college
    if (req.user.role !== 'super_admin') {
      const userCollegeId = req.user.college?._id || req.user.college;
      query.college = userCollegeId;
    }
    
    const departments = await Department.find(query).select('name shortName');
    const totalDepartments = departments.length;
    const departmentNames = departments.map(dept => dept.name);
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role department createdAt');
    
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
    
    let query = {};
    
    if (courseId) {
      query['attendance.course'] = courseId;
    }
    
    if (startDate || endDate) {
      query['attendance.date'] = {};
      if (startDate) {
        query['attendance.date'].$gte = new Date(startDate);
      }
      if (endDate) {
        query['attendance.date'].$lte = new Date(endDate);
      }
    }
    
    // Aggregate attendance records
    const students = await Student.find(query)
      .populate('user', 'name email')
      .populate('attendance.course', 'code name')
      .populate('attendance.markedBy', 'name');
    
    // Format attendance data
    const attendanceReport = students.map(student => {
      const attendanceByDate = {};
      
      student.attendance.forEach(record => {
        if (!record.course) return; // Skip if course not populated
        
        const courseCode = record.course.code;
        const date = record.date.toISOString().split('T')[0];
        
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = {};
        }
        
        attendanceByDate[date][courseCode] = record.present ? 'Present' : 'Absent';
      });
      
      return {
        studentId: student._id,
        enrollmentNumber: student.enrollmentNumber,
        name: student.user.name,
        email: student.user.email,
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
    
    let query = {};
    
    if (courseId) {
      query['grades.course'] = courseId;
    }
    
    // Aggregate grade records
    const students = await Student.find(query)
      .populate('user', 'name email')
      .populate('grades.course', 'code name')
      .populate('grades.gradedBy', 'name');
    
    // Format grade data
    const gradeReport = students.map(student => {
      const gradesByCourse = {};
      
      student.grades.forEach(record => {
        if (!record.course) return; // Skip if course not populated
        
        const courseCode = record.course.code;
        
        if (!gradesByCourse[courseCode]) {
          gradesByCourse[courseCode] = {
            courseName: record.course.name,
            assignments: []
          };
        }
        
        gradesByCourse[courseCode].assignments.push({
          assignment: record.assignment,
          score: record.score,
          maxScore: record.maxScore,
          percentage: (record.score / record.maxScore) * 100,
          gradedBy: record.gradedBy ? record.gradedBy.name : 'Unknown'
        });
      });
      
      // Calculate average score for each course
      Object.keys(gradesByCourse).forEach(courseCode => {
        const assignments = gradesByCourse[courseCode].assignments;
        const totalScore = assignments.reduce((sum, assignment) => sum + assignment.score, 0);
        const totalMaxScore = assignments.reduce((sum, assignment) => sum + assignment.maxScore, 0);
        const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
        
        gradesByCourse[courseCode].averageScore = totalScore;
        gradesByCourse[courseCode].totalMaxScore = totalMaxScore;
        gradesByCourse[courseCode].averagePercentage = averagePercentage;
      });
      
      return {
        studentId: student._id,
        enrollmentNumber: student.enrollmentNumber,
        name: student.user.name,
        email: student.user.email,
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
      const hodUser = await User.findById(hod);
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
