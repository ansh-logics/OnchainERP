const { 
  College, 
  Student, 
  Faculty, 
  Department, 
  Transaction, 
  Hostel, 
  HostelAllocation,
  Exam,
  User 
} = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');

// @desc    Get dashboard analytics for admin
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Get user's college ID - try multiple sources
    let collegeId = req.user.collegeId;
    
    // If collegeId is null, try to get it from the college association
    if (!collegeId && req.user.college) {
      collegeId = req.user.college.id;
    }
    
    // If still no collegeId, check if user is super_admin (they might access multiple colleges)
    if (!collegeId) {
      if (req.user.role === 'super_admin') {
        // For super_admin, we could return aggregate data or ask them to specify a college
        return res.status(200).json({
          success: true,
          data: {
            totalStudents: 0,
            totalFaculty: 0,
            totalDepartments: 0,
            revenue: 0,
            hostelOccupancy: 0,
            activeAlerts: 0,
            pendingFees: 0,
            upcomingExams: 0,
            message: 'Super admin - please select a specific college to view analytics'
          }
        });
      } else {
        return next(new ErrorResponse('User not associated with any college. Please contact administrator to assign you to a college.', 400));
      }
    }

    // Get all counts in parallel for better performance
    const [
      totalStudents,
      totalFaculty,
      totalDepartments,
      revenueData,
      hostelData,
      upcomingExams,
      pendingFees
    ] = await Promise.all([
      // Total Students
      Student.count({ 
        where: { 
          collegeId, 
          isActive: true 
        } 
      }),
      
      // Total Faculty
      Faculty.count({ 
        where: { 
          collegeId, 
          isActive: true 
        } 
      }),
      
      // Total Departments
      Department.count({ 
        where: { 
          collegeId, 
          isActive: true 
        } 
      }),
      
      // Revenue calculation (sum of all paid transactions)
      Transaction.sum('amount', {
        where: {
          collegeId,
          status: 'paid',
          type: 'income', // Only count income transactions
          createdAt: {
            [Op.gte]: new Date(new Date().getFullYear(), 3, 1) // Current academic year (April 1st)
          }
        }
      }),
      
      // Hostel occupancy
      Promise.all([
        HostelAllocation.count({
          where: {
            status: ['allocated', 'checked_in'],
            isActive: true
          },
          include: [{
            model: Hostel,
            as: 'hostel',
            where: { collegeId }
          }]
        }),
        Hostel.sum('totalCapacity', {
          where: { 
            collegeId,
            isActive: true 
          }
        })
      ]),
      
      // Upcoming exams (next 30 days)
      Exam.count({
        where: {
          collegeId,
          examDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
          }
        }
      }),
      
      // Pending fees (transactions with pending status)
      Transaction.count({
        where: {
          collegeId,
          status: 'pending'
        }
      })
    ]);

    // Calculate hostel occupancy percentage
    const [occupiedBeds, totalCapacity] = hostelData;
    const hostelOccupancy = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

    // Mock active alerts count (you can implement proper alerts system later)
    const activeAlerts = 4;

    const analytics = {
      totalStudents: totalStudents || 0,
      totalFaculty: totalFaculty || 0,
      totalDepartments: totalDepartments || 0,
      revenue: revenueData || 0,
      hostelOccupancy: hostelOccupancy,
      activeAlerts: activeAlerts,
      pendingFees: pendingFees || 0,
      upcomingExams: upcomingExams || 0
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    next(new ErrorResponse('Failed to fetch dashboard analytics', 500));
  }
};

// @desc    Get system health status
// @route   GET /api/dashboard/health
// @access  Private/Admin
const getSystemHealth = async (req, res, next) => {
  try {
    // Basic system health checks
    const health = {
      database: 'healthy',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // Mock: 1 day ago
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      diskSpace: 'sufficient', // You can implement actual disk space check
      status: 'operational'
    };

    res.status(200).json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('System health check error:', error);
    next(new ErrorResponse('Failed to check system health', 500));
  }
};

module.exports = {
  getDashboardAnalytics,
  getSystemHealth
};
