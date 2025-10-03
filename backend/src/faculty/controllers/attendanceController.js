const { Attendance, Student, Course, Faculty, Section, User, Timetable, Department } = require('../../shared/db/models');
const { Op } = require('sequelize');
const ErrorResponse = require('../../shared/utils/errorResponse');
const LoggingService = require('../../shared/services/LoggingService');

// SIMPLE DEMO ENDPOINTS

// @desc    Get all sections for a department
// @route   GET /api/faculty/attendance/demo/sections/:departmentId
// @access  Private/Faculty
exports.getDepartmentSections = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    
    const sections = await Section.findAll({
      where: { 
        departmentId: departmentId,
        isActive: true 
      },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name', 'code']
      }],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    next(error);
  }
};

// @desc    Get all students in a section
// @route   GET /api/faculty/attendance/demo/section-students/:sectionId
// @access  Private/Faculty
exports.getSectionStudents = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const { date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`📚 Fetching students for section ${sectionId} on date ${selectedDate}`);
    
    const students = await Student.findAll({
      where: {
        sectionId: sectionId,
        isActive: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }, {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code', 'batch']
      }],
      order: [['rollNumber', 'ASC']]
    });

    // Check if attendance already marked for this date
    const attendanceRecords = await Attendance.findAll({
      where: {
        studentId: students.map(s => s.id),
        attendanceDate: selectedDate
      }
    });

    console.log(`✅ Found ${students.length} students, ${attendanceRecords.length} attendance records`);

    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId] = record.status;
    });

    const studentsWithAttendance = students.map(student => ({
      id: student.id,
      rollNumber: student.rollNumber,
      enrollmentNumber: student.enrollmentNumber,
      name: student.user.name,
      email: student.user.email,
      batch: student.batch,
      section: student.section,
      attendanceStatus: attendanceMap[student.id] || null
    }));

    res.status(200).json({
      success: true,
      count: studentsWithAttendance.length,
      data: studentsWithAttendance
    });
  } catch (error) {
    console.error('❌ Error fetching section students:', error);
    next(error);
  }
};

// @desc    Mark simple attendance
// @route   POST /api/faculty/attendance/demo/mark
// @access  Private/Faculty
exports.markSimpleAttendance = async (req, res, next) => {
  try {
    const { sectionId, date, attendanceRecords } = req.body;
    const facultyUserId = req.user.id;

    console.log(`📝 Marking attendance for section ${sectionId} on ${date}`);
    console.log(`📋 Faculty user ID: ${facultyUserId}`);
    console.log(`👥 Records count: ${attendanceRecords?.length || 0}`);

    // Get faculty record
    const faculty = await Faculty.findOne({
      where: { userId: facultyUserId }
    });

    if (!faculty) {
      console.error('❌ Faculty profile not found for user:', facultyUserId);
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    console.log(`✅ Faculty found: ${faculty.id}`);

    // Get a default course for this section (just pick first one)
    const section = await Section.findByPk(sectionId);
    if (!section) {
      console.error('❌ Section not found:', sectionId);
      return next(new ErrorResponse('Section not found', 404));
    }

    console.log(`✅ Section found: ${section.name} (Dept: ${section.departmentId})`);

    // Get any course for this department
    const course = await Course.findOne({
      where: { departmentId: section.departmentId }
    });

    if (!course) {
      console.error('❌ No course found for department:', section.departmentId);
      return next(new ErrorResponse('No course found for this department', 404));
    }

    console.log(`✅ Course found: ${course.name} (${course.code})`);

    const attendanceDate = date || new Date().toISOString().split('T')[0];
    let markedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;

    // Mark attendance for each student
    for (const record of attendanceRecords) {
      const { studentId, status } = record;

      // Check if attendance already exists
      const existing = await Attendance.findOne({
        where: {
          studentId: studentId,
          attendanceDate: attendanceDate
        }
      });

      if (existing) {
        // Update existing attendance
        await existing.update({
          status: status,
          markedBy: faculty.id
        });
        updatedCount++;
      } else {
        // Create new attendance with courseId
        await Attendance.create({
          studentId: studentId,
          courseId: course.id,
          facultyId: faculty.id,
          attendanceDate: attendanceDate,
          status: status,
          markedBy: faculty.id,
          period: 1,
          classType: 'theory'
        });
        createdCount++;
      }
      markedCount++;
    }

    console.log(`✅ Attendance saved: ${createdCount} created, ${updatedCount} updated (Total: ${markedCount})`);

    res.status(200).json({
      success: true,
      message: `Attendance marked for ${markedCount} students`,
      data: {
        marked: markedCount,
        created: createdCount,
        updated: updatedCount,
        date: attendanceDate,
        sectionId: sectionId
      }
    });
  } catch (error) {
    console.error('❌ Error marking attendance:', error);
    next(error);
  }
};

// @desc    Get all department students with attendance (combined view)
// @route   GET /api/faculty/attendance/demo/department-attendance/:departmentId
// @access  Private/Faculty
exports.getDepartmentAttendance = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    // Get all students from all sections in the department
    const students = await Student.findAll({
      where: {
        departmentId: departmentId,
        isActive: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }, {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code', 'batch']
      }],
      order: [['rollNumber', 'ASC']]
    });

    // Get attendance for the selected date
    const attendanceRecords = await Attendance.findAll({
      where: {
        studentId: students.map(s => s.id),
        attendanceDate: selectedDate
      }
    });

    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId] = record.status;
    });

    const studentsWithAttendance = students.map(student => ({
      id: student.id,
      rollNumber: student.rollNumber,
      enrollmentNumber: student.enrollmentNumber,
      name: student.user.name,
      email: student.user.email,
      batch: student.batch,
      section: student.section ? student.section.name : 'N/A',
      sectionCode: student.section ? student.section.code : 'N/A',
      attendanceStatus: attendanceMap[student.id] || 'not_marked'
    }));

    // Calculate statistics
    const stats = {
      total: studentsWithAttendance.length,
      present: studentsWithAttendance.filter(s => s.attendanceStatus === 'present').length,
      absent: studentsWithAttendance.filter(s => s.attendanceStatus === 'absent').length,
      late: studentsWithAttendance.filter(s => s.attendanceStatus === 'late').length,
      excused: studentsWithAttendance.filter(s => s.attendanceStatus === 'excused').length,
      notMarked: studentsWithAttendance.filter(s => s.attendanceStatus === 'not_marked').length
    };

    res.status(200).json({
      success: true,
      count: studentsWithAttendance.length,
      data: studentsWithAttendance,
      stats: stats,
      date: selectedDate
    });
  } catch (error) {
    console.error('Error fetching department attendance:', error);
    next(error);
  }
};

// @desc    Get faculty's classes for a specific date
// @route   GET /api/faculty/attendance/classes
// @access  Private/Faculty
exports.getFacultyClasses = async (req, res, next) => {
  try {
    const { date } = req.query;
    const facultyUserId = req.user.id;

    // Get faculty record
    const faculty = await Faculty.findOne({
      where: { userId: facultyUserId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Get the day of week (1 = Monday, 7 = Sunday)
    const targetDate = date ? new Date(date) : new Date();
    const dayOfWeek = targetDate.getDay() === 0 ? 7 : targetDate.getDay();

    // Get all timetable entries for this faculty on this day
    const classes = await Timetable.findAll({
      where: {
        facultyId: faculty.id,
        dayOfWeek: dayOfWeek,
        isActive: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'name', 'courseType'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name', 'code']
          }]
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'code', 'batch', 'semester', 'currentStrength']
        }
      ],
      order: [['period', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching faculty classes:', error);
    next(error);
  }
};

// @desc    Get students for a specific class/section
// @route   GET /api/faculty/attendance/students/:courseId/:sectionId
// @access  Private/Faculty
exports.getClassStudents = async (req, res, next) => {
  try {
    const { courseId, sectionId } = req.params;
    const { date, period } = req.query;

    // Get students in the section
    const students = await Student.findAll({
      where: {
        sectionId: sectionId,
        isActive: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'profilePicture']
      }],
      order: [['rollNumber', 'ASC']]
    });

    // If date and period provided, get existing attendance records
    let attendanceRecords = [];
    if (date && period) {
      attendanceRecords = await Attendance.findAll({
        where: {
          courseId: courseId,
          attendanceDate: date,
          period: parseInt(period)
        }
      });
    }

    // Map attendance to students
    const studentsWithAttendance = students.map(student => {
      const attendanceRecord = attendanceRecords.find(
        record => record.studentId === student.id
      );

      return {
        id: student.id,
        rollNumber: student.rollNumber,
        enrollmentNumber: student.enrollmentNumber,
        name: student.user.name,
        email: student.user.email,
        profilePicture: student.user.profilePicture,
        batch: student.batch,
        currentSemester: student.currentSemester,
        attendance: attendanceRecord ? {
          id: attendanceRecord.id,
          status: attendanceRecord.status,
          topic: attendanceRecord.topic,
          classType: attendanceRecord.classType,
          markedAt: attendanceRecord.markedAt
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: studentsWithAttendance.length,
      data: studentsWithAttendance
    });
  } catch (error) {
    console.error('Error fetching class students:', error);
    next(error);
  }
};

// @desc    Mark attendance for multiple students
// @route   POST /api/faculty/attendance/mark
// @access  Private/Faculty
exports.markBulkAttendance = async (req, res, next) => {
  try {
    const { courseId, sectionId, date, period, classType, topic, attendanceRecords } = req.body;
    const facultyUserId = req.user.id;

    // Validate required fields
    if (!courseId || !date || !period || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return next(new ErrorResponse('Please provide courseId, date, period, and attendanceRecords', 400));
    }

    // Get faculty record
    const faculty = await Faculty.findOne({
      where: { userId: facultyUserId }
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }

    // Check if faculty is assigned to this course (via timetable)
    const timetableEntry = await Timetable.findOne({
      where: {
        courseId: courseId,
        facultyId: faculty.id,
        isActive: true
      }
    });

    if (!timetableEntry) {
      return next(new ErrorResponse('You are not assigned to teach this course', 403));
    }

    const markedAttendance = [];
    const errors = [];

    // Process each attendance record
    for (const record of attendanceRecords) {
      try {
        const { studentId, status } = record;

        if (!studentId || !status) {
          errors.push({ studentId, error: 'Missing studentId or status' });
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          where: {
            studentId: studentId,
            courseId: courseId,
            attendanceDate: date,
            period: period
          }
        });

        let attendanceEntry;

        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = status;
          existingAttendance.classType = classType || existingAttendance.classType;
          existingAttendance.topic = topic || existingAttendance.topic;
          existingAttendance.modifiedBy = faculty.id;
          existingAttendance.modifiedAt = new Date();
          existingAttendance.modificationReason = 'Updated by faculty';
          
          await existingAttendance.save();
          attendanceEntry = existingAttendance;
        } else {
          // Create new attendance record
          attendanceEntry = await Attendance.create({
            studentId: studentId,
            courseId: courseId,
            facultyId: faculty.id,
            attendanceDate: date,
            period: period,
            status: status,
            classType: classType || 'theory',
            topic: topic || '',
            markedBy: faculty.id,
            markedAt: new Date()
          });
        }

        markedAttendance.push(attendanceEntry);
      } catch (error) {
        console.error(`Error marking attendance for student ${record.studentId}:`, error);
        errors.push({ 
          studentId: record.studentId, 
          error: error.message 
        });
      }
    }

    // Log the action
    await LoggingService.log({
      userId: req.user.id,
      action: 'mark_attendance',
      resourceType: 'attendance',
      resourceId: courseId,
      details: `Marked attendance for ${markedAttendance.length} students in course ${course.code}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Successfully marked attendance for ${markedAttendance.length} students`,
      data: {
        marked: markedAttendance.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    next(error);
  }
};

// @desc    Get attendance records for a course
// @route   GET /api/faculty/attendance/records/:courseId
// @access  Private/Faculty
exports.getCourseAttendance = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate, studentId, sectionId } = req.query;
    const facultyUserId = req.user.id;

    // Get faculty record
    const faculty = await Faculty.findOne({
      where: { userId: facultyUserId }
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Build query conditions
    const whereConditions = {
      courseId: courseId
    };

    if (startDate && endDate) {
      whereConditions.attendanceDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (studentId) {
      whereConditions.studentId = studentId;
    }

    // Get attendance records
    let attendanceRecords = await Attendance.findAll({
      where: whereConditions,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'rollNumber', 'enrollmentNumber', 'batch', 'sectionId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }],
          where: sectionId ? { sectionId } : {}
        },
        {
          model: Faculty,
          as: 'markedByFaculty',
          attributes: ['id', 'employeeId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['name']
          }]
        }
      ],
      order: [['attendanceDate', 'DESC'], ['period', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    console.error('Error fetching course attendance:', error);
    next(error);
  }
};

// @desc    Get attendance summary/statistics for a course
// @route   GET /api/faculty/attendance/summary/:courseId
// @access  Private/Faculty
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { sectionId, startDate, endDate } = req.query;

    // Build query conditions
    const whereConditions = {
      courseId: courseId
    };

    if (startDate && endDate) {
      whereConditions.attendanceDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.findAll({
      where: whereConditions,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'rollNumber', 'sectionId'],
        where: sectionId ? { sectionId } : {},
        include: [{
          model: User,
          as: 'user',
          attributes: ['name']
        }]
      }]
    });

    // Calculate statistics
    const studentStats = {};
    const dateStats = {};
    let totalClasses = 0;

    attendanceRecords.forEach(record => {
      const studentId = record.studentId;
      const dateKey = record.attendanceDate;
      const periodKey = `${dateKey}_${record.period}`;

      // Initialize student stats
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          studentId: studentId,
          studentName: record.student?.user?.name || 'Unknown',
          rollNumber: record.student?.rollNumber || 'N/A',
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
          percentage: 0
        };
      }

      // Count by status
      studentStats[studentId][record.status]++;
      studentStats[studentId].total++;

      // Track unique classes
      if (!dateStats[periodKey]) {
        dateStats[periodKey] = true;
        totalClasses++;
      }
    });

    // Calculate percentages
    Object.values(studentStats).forEach(stats => {
      if (stats.total > 0) {
        stats.percentage = ((stats.present / stats.total) * 100).toFixed(2);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalClasses: totalClasses,
        studentWiseAttendance: Object.values(studentStats),
        summary: {
          totalRecords: attendanceRecords.length,
          uniqueStudents: Object.keys(studentStats).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    next(error);
  }
};

// @desc    Update a single attendance record
// @route   PUT /api/faculty/attendance/:attendanceId
// @access  Private/Faculty
exports.updateAttendance = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const { status, modificationReason } = req.body;
    const facultyUserId = req.user.id;

    // Get faculty record
    const faculty = await Faculty.findOne({
      where: { userId: facultyUserId }
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Find the attendance record
    const attendance = await Attendance.findByPk(attendanceId);

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    // Verify faculty is authorized (either marked it or teaches the course)
    const timetableEntry = await Timetable.findOne({
      where: {
        courseId: attendance.courseId,
        facultyId: faculty.id
      }
    });

    if (!timetableEntry && attendance.markedBy !== faculty.id) {
      return next(new ErrorResponse('Not authorized to update this attendance record', 403));
    }

    // Update the record
    attendance.status = status || attendance.status;
    attendance.modifiedBy = faculty.id;
    attendance.modifiedAt = new Date();
    attendance.modificationReason = modificationReason || 'Updated by faculty';

    await attendance.save();

    // Log the action
    await LoggingService.log({
      userId: req.user.id,
      action: 'update_attendance',
      resourceType: 'attendance',
      resourceId: attendanceId,
      details: `Updated attendance record to ${status}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/faculty/attendance/:attendanceId
// @access  Private/Faculty/Admin
exports.deleteAttendance = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const facultyUserId = req.user.id;

    // Get faculty record (if faculty role)
    let faculty = null;
    if (req.user.role === 'faculty') {
      faculty = await Faculty.findOne({
        where: { userId: facultyUserId }
      });

      if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
      }
    }

    // Find the attendance record
    const attendance = await Attendance.findByPk(attendanceId);

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    // Verify authorization
    if (req.user.role === 'faculty') {
      if (attendance.markedBy !== faculty.id) {
        return next(new ErrorResponse('Not authorized to delete this attendance record', 403));
      }
    }

    await attendance.destroy();

    // Log the action
    await LoggingService.log({
      userId: req.user.id,
      action: 'delete_attendance',
      resourceType: 'attendance',
      resourceId: attendanceId,
      details: 'Deleted attendance record',
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    next(error);
  }
};

