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

    console.log(`📚 Fetching students for courseId: ${courseId}, sectionId: ${sectionId}, date: ${date}, period: ${period}`);

    // Verify timetable entry exists
    const timetableEntry = await Timetable.findOne({
      where: {
        courseId: courseId,
        sectionId: sectionId,
        period: period ? parseInt(period) : undefined,
        isActive: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'code', 'currentStrength']
        }
      ]
    });

    if (!timetableEntry) {
      console.warn(`⚠️ No timetable entry found for course ${courseId}, section ${sectionId}, period ${period}`);
    } else {
      console.log(`✅ Timetable entry found: ${timetableEntry.course.code} - ${timetableEntry.section.name}`);
    }

    // Get students in the section
    const students = await Student.findAll({
      where: {
        sectionId: sectionId,
        isActive: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['rollNumber', 'ASC']]
    });

    console.log(`📋 Found ${students.length} students in section ${sectionId}`);

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
      console.log(`📝 Found ${attendanceRecords.length} existing attendance records`);
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
      data: studentsWithAttendance,
      meta: {
        courseId,
        sectionId,
        date,
        period,
        timetableExists: !!timetableEntry
      }
    });
  } catch (error) {
    console.error('❌ Error fetching class students:', error);
    console.error('Error stack:', error.stack);
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

// @desc    Get attendance summary/statistics for a section
// @route   GET /api/faculty/attendance/summary/section/:sectionId
// @access  Private/Faculty
exports.getSectionAttendanceSummary = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const { startDate, endDate } = req.query;

    console.log(`📊 Fetching section attendance summary for sectionId: ${sectionId}`);

    // Build query conditions
    const whereConditions = {};

    if (startDate && endDate) {
      whereConditions.attendanceDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get all students in the section
    const students = await Student.findAll({
      where: {
        sectionId: sectionId,
        isActive: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['rollNumber', 'ASC']]
    });

    // Get attendance records for all students
    const attendanceRecords = await Attendance.findAll({
      where: {
        ...whereConditions,
        studentId: students.map(s => s.id)
      },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['code', 'name']
      }]
    });

    // Calculate student-wise statistics
    const studentStats = students.map(student => {
      const studentAttendance = attendanceRecords.filter(r => r.studentId === student.id);
      
      // Overall stats
      const totalClasses = studentAttendance.length;
      const present = studentAttendance.filter(r => r.status === 'present').length;
      const absent = studentAttendance.filter(r => r.status === 'absent').length;
      const late = studentAttendance.filter(r => r.status === 'late').length;
      const excused = studentAttendance.filter(r => r.status === 'excused').length;
      
      const percentage = totalClasses > 0 
        ? parseFloat(((present / totalClasses) * 100).toFixed(2))
        : 0;

      // Subject-wise breakdown
      const subjectWise = {};
      studentAttendance.forEach(record => {
        const courseCode = record.course?.code || 'Unknown';
        if (!subjectWise[courseCode]) {
          subjectWise[courseCode] = {
            courseName: record.course?.name || 'Unknown',
            present: 0,
            total: 0,
            percentage: 0
          };
        }
        subjectWise[courseCode].total++;
        if (record.status === 'present') subjectWise[courseCode].present++;
      });

      // Calculate subject percentages
      Object.values(subjectWise).forEach(sub => {
        sub.percentage = sub.total > 0 
          ? parseFloat(((sub.present / sub.total) * 100).toFixed(2))
          : 0;
      });

      return {
        student: {
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.user.name,
          email: student.user.email
        },
        subjects: subjectWise,
        overallPresent: present,
        overallTotal: totalClasses,
        overallPercentage: percentage,
        absent: absent,
        late: late,
        excused: excused
      };
    });

    res.status(200).json({
      success: true,
      data: {
        students: studentStats,
        summary: {
          totalStudents: students.length,
          averagePercentage: studentStats.length > 0
            ? parseFloat((studentStats.reduce((sum, s) => sum + s.overallPercentage, 0) / studentStats.length).toFixed(2))
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching section attendance summary:', error);
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

// STUDENT ATTENDANCE ENDPOINTS

// @desc    Get student's own attendance records with percentage
// @route   GET /api/faculty/attendance/student/my-attendance
// @access  Private/Student
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    const userId = req.user.id;

    // Get student record
    const student = await Student.findOne({
      where: { userId: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }, {
        model: Section,
        as: 'section',
        attributes: ['id', 'name', 'code', 'semester']
      }]
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Build query conditions
    const whereConditions = {
      studentId: student.id
    };

    if (courseId) {
      whereConditions.courseId = courseId;
    }

    if (startDate && endDate) {
      whereConditions.attendanceDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get attendance records
    const attendanceRecords = await Attendance.findAll({
      where: whereConditions,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'name', 'credits']
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

    // Calculate subject-wise statistics
    const subjectStats = {};
    
    attendanceRecords.forEach(record => {
      const courseId = record.courseId;
      const courseCode = record.course?.code || 'Unknown';
      const courseName = record.course?.name || 'Unknown';

      if (!subjectStats[courseId]) {
        subjectStats[courseId] = {
          courseId: courseId,
          courseCode: courseCode,
          courseName: courseName,
          totalClasses: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          percentage: 0
        };
      }

      subjectStats[courseId].totalClasses++;
      subjectStats[courseId][record.status]++;
    });

    // Calculate percentages
    Object.values(subjectStats).forEach(stats => {
      if (stats.totalClasses > 0) {
        stats.percentage = parseFloat(((stats.present / stats.totalClasses) * 100).toFixed(2));
      }
    });

    // Calculate overall statistics
    const overallStats = {
      totalClasses: attendanceRecords.length,
      present: attendanceRecords.filter(r => r.status === 'present').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      late: attendanceRecords.filter(r => r.status === 'late').length,
      excused: attendanceRecords.filter(r => r.status === 'excused').length,
      overallPercentage: 0
    };

    if (overallStats.totalClasses > 0) {
      overallStats.overallPercentage = parseFloat(
        ((overallStats.present / overallStats.totalClasses) * 100).toFixed(2)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.user.name,
          rollNumber: student.rollNumber,
          enrollmentNumber: student.enrollmentNumber,
          section: student.section
        },
        overallStats,
        subjectWiseStats: Object.values(subjectStats),
        attendanceRecords: attendanceRecords
      }
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    next(error);
  }
};

// @desc    Get student's attendance percentage by subject
// @route   GET /api/faculty/attendance/student/percentage
// @access  Private/Student
exports.getStudentAttendancePercentage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get student record
    const student = await Student.findOne({
      where: { userId: userId }
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Get all courses for the student's section
    const timetableEntries = await Timetable.findAll({
      where: {
        sectionId: student.sectionId,
        isActive: true
      },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'code', 'name', 'credits']
      }],
      attributes: ['courseId'],
      group: ['courseId', 'course.id', 'course.code', 'course.name', 'course.credits']
    });

    const courses = [...new Set(timetableEntries.map(t => t.course))];

    // Get attendance for each course
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const attendanceRecords = await Attendance.findAll({
          where: {
            studentId: student.id,
            courseId: course.id
          }
        });

        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const total = attendanceRecords.length;
        const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;

        return {
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          credits: course.credits,
          totalClasses: total,
          present: present,
          absent: attendanceRecords.filter(r => r.status === 'absent').length,
          late: attendanceRecords.filter(r => r.status === 'late').length,
          excused: attendanceRecords.filter(r => r.status === 'excused').length,
          percentage: percentage,
          status: percentage >= 75 ? 'good' : percentage >= 60 ? 'warning' : 'critical'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: courseStats
    });
  } catch (error) {
    console.error('Error calculating attendance percentage:', error);
    next(error);
  }
};

// ADMIN COMPREHENSIVE REPORTS

// @desc    Get comprehensive attendance report for admin
// @route   GET /api/faculty/attendance/admin/comprehensive-report
// @access  Private/Admin
exports.getComprehensiveAttendanceReport = async (req, res, next) => {
  try {
    const { departmentId, sectionId, courseId, startDate, endDate, minPercentage, maxPercentage } = req.query;

    // Build base query for students
    const studentWhere = {};
    if (departmentId) studentWhere.departmentId = departmentId;
    if (sectionId) studentWhere.sectionId = sectionId;

    const students = await Student.findAll({
      where: { ...studentWhere, isActive: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['name', 'code', 'semester']
        }
      ]
    });

    // Build attendance query
    const attendanceWhere = {
      studentId: students.map(s => s.id)
    };

    if (courseId) attendanceWhere.courseId = courseId;
    if (startDate && endDate) {
      attendanceWhere.attendanceDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.findAll({
      where: attendanceWhere,
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'code', 'name']
      }]
    });

    // Calculate student-wise statistics
    const studentStats = students.map(student => {
      const studentAttendance = attendanceRecords.filter(r => r.studentId === student.id);
      const present = studentAttendance.filter(r => r.status === 'present').length;
      const total = studentAttendance.length;
      const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;

      // Calculate subject-wise for this student
      const subjectWise = {};
      studentAttendance.forEach(record => {
        const cId = record.courseId;
        if (!subjectWise[cId]) {
          subjectWise[cId] = {
            courseCode: record.course?.code,
            courseName: record.course?.name,
            present: 0,
            total: 0,
            percentage: 0
          };
        }
        subjectWise[cId].total++;
        if (record.status === 'present') subjectWise[cId].present++;
      });

      // Calculate subject percentages
      Object.values(subjectWise).forEach(sub => {
        sub.percentage = sub.total > 0 ? parseFloat(((sub.present / sub.total) * 100).toFixed(2)) : 0;
      });

      return {
        studentId: student.id,
        rollNumber: student.rollNumber,
        enrollmentNumber: student.enrollmentNumber,
        name: student.user.name,
        email: student.user.email,
        section: student.section?.name,
        sectionCode: student.section?.code,
        totalClasses: total,
        present: present,
        absent: studentAttendance.filter(r => r.status === 'absent').length,
        late: studentAttendance.filter(r => r.status === 'late').length,
        excused: studentAttendance.filter(r => r.status === 'excused').length,
        percentage: percentage,
        status: percentage >= 75 ? 'good' : percentage >= 60 ? 'warning' : 'critical',
        subjectWise: Object.values(subjectWise)
      };
    });

    // Filter by percentage if specified
    let filteredStats = studentStats;
    if (minPercentage) {
      filteredStats = filteredStats.filter(s => s.percentage >= parseFloat(minPercentage));
    }
    if (maxPercentage) {
      filteredStats = filteredStats.filter(s => s.percentage <= parseFloat(maxPercentage));
    }

    // Overall statistics
    const overallStats = {
      totalStudents: filteredStats.length,
      studentsAbove75: filteredStats.filter(s => s.percentage >= 75).length,
      students60to75: filteredStats.filter(s => s.percentage >= 60 && s.percentage < 75).length,
      studentsBelow60: filteredStats.filter(s => s.percentage < 60).length,
      averageAttendance: filteredStats.length > 0 
        ? parseFloat((filteredStats.reduce((sum, s) => sum + s.percentage, 0) / filteredStats.length).toFixed(2))
        : 0
    };

    res.status(200).json({
      success: true,
      data: {
        overallStats,
        studentStats: filteredStats,
        filters: {
          departmentId,
          sectionId,
          courseId,
          startDate,
          endDate,
          minPercentage,
          maxPercentage
        }
      }
    });
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    next(error);
  }
};

// @desc    Get period-wise attendance statistics
// @route   GET /api/faculty/attendance/admin/period-stats
// @access  Private/Admin
exports.getPeriodWiseStats = async (req, res, next) => {
  try {
    const { sectionId, courseId, startDate, endDate } = req.query;

    const whereConditions = {};
    if (sectionId) {
      // Get students in section
      const students = await Student.findAll({
        where: { sectionId, isActive: true }
      });
      whereConditions.studentId = students.map(s => s.id);
    }
    if (courseId) whereConditions.courseId = courseId;
    if (startDate && endDate) {
      whereConditions.attendanceDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const attendanceRecords = await Attendance.findAll({
      where: whereConditions,
      include: [{
        model: Course,
        as: 'course',
        attributes: ['code', 'name']
      }]
    });

    // Group by date and period
    const periodStats = {};
    
    attendanceRecords.forEach(record => {
      const key = `${record.attendanceDate}_P${record.period}`;
      if (!periodStats[key]) {
        periodStats[key] = {
          date: record.attendanceDate,
          period: record.period,
          courseCode: record.course?.code,
          courseName: record.course?.name,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
          percentage: 0
        };
      }

      periodStats[key][record.status]++;
      periodStats[key].total++;
    });

    // Calculate percentages
    Object.values(periodStats).forEach(stat => {
      if (stat.total > 0) {
        stat.percentage = parseFloat(((stat.present / stat.total) * 100).toFixed(2));
      }
    });

    res.status(200).json({
      success: true,
      count: Object.keys(periodStats).length,
      data: Object.values(periodStats).sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.period - a.period;
      })
    });
  } catch (error) {
    console.error('Error fetching period-wise stats:', error);
    next(error);
  }
};

// DEPARTMENT-LEVEL ATTENDANCE ENDPOINTS

// @desc    Get department-wise attendance aggregation
// @route   GET /api/faculty/attendance/admin/department-stats
// @access  Private/Admin/Faculty
exports.getDepartmentWiseStats = async (req, res, next) => {
  try {
    const { departmentId, startDate, endDate, courseId, facultyId } = req.query;
    const userRole = req.user.role;

    console.log('📊 Fetching department-wise attendance stats');

    // Build department filter
    let departmentWhere = { isActive: true };
    
    // If faculty, restrict to their department
    if (userRole === 'faculty') {
      const faculty = await Faculty.findOne({
        where: { userId: req.user.id }
      });
      
      if (faculty && faculty.departmentId) {
        departmentWhere.id = faculty.departmentId;
      }
    } else if (departmentId) {
      departmentWhere.id = departmentId;
    }

    // Get departments
    const departments = await Department.findAll({
      where: departmentWhere,
      attributes: ['id', 'name', 'code']
    });

    // Calculate stats for each department
    const departmentStats = await Promise.all(
      departments.map(async (department) => {
        // Get all sections in department
        const sections = await Section.findAll({
          where: { 
            departmentId: department.id,
            isActive: true 
          },
          attributes: ['id', 'name', 'code', 'currentStrength']
        });

        // Get all students in department
        const students = await Student.findAll({
          where: {
            departmentId: department.id,
            isActive: true
          }
        });

        // Build attendance query
        const attendanceWhere = {
          studentId: students.map(s => s.id)
        };

        if (startDate && endDate) {
          attendanceWhere.attendanceDate = {
            [Op.between]: [startDate, endDate]
          };
        }

        if (courseId) {
          attendanceWhere.courseId = courseId;
        }

        if (facultyId) {
          attendanceWhere.facultyId = facultyId;
        }

        // Get attendance records
        const attendanceRecords = await Attendance.findAll({
          where: attendanceWhere
        });

        // Calculate statistics
        const totalPeriods = attendanceRecords.length;
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const absent = attendanceRecords.filter(r => r.status === 'absent').length;
        const late = attendanceRecords.filter(r => r.status === 'late').length;
        const excused = attendanceRecords.filter(r => r.status === 'excused').length;

        const percentage = totalPeriods > 0 
          ? parseFloat(((present / totalPeriods) * 100).toFixed(2))
          : 0;

        // Get section-wise breakdown
        const sectionBreakdown = await Promise.all(
          sections.map(async (section) => {
            const sectionStudents = students.filter(s => s.sectionId === section.id);
            const sectionAttendance = attendanceRecords.filter(
              r => sectionStudents.some(s => s.id === r.studentId)
            );

            const sectionPresent = sectionAttendance.filter(r => r.status === 'present').length;
            const sectionTotal = sectionAttendance.length;
            const sectionPercentage = sectionTotal > 0
              ? parseFloat(((sectionPresent / sectionTotal) * 100).toFixed(2))
              : 0;

            return {
              sectionId: section.id,
              sectionName: section.name,
              sectionCode: section.code,
              studentCount: sectionStudents.length,
              totalPeriods: sectionTotal,
              present: sectionPresent,
              absent: sectionAttendance.filter(r => r.status === 'absent').length,
              late: sectionAttendance.filter(r => r.status === 'late').length,
              excused: sectionAttendance.filter(r => r.status === 'excused').length,
              percentage: sectionPercentage,
              status: sectionPercentage >= 75 ? 'good' : sectionPercentage >= 60 ? 'warning' : 'critical'
            };
          })
        );

        return {
          departmentId: department.id,
          departmentName: department.name,
          departmentCode: department.code,
          totalStudents: students.length,
          totalSections: sections.length,
          totalPeriods: totalPeriods,
          present: present,
          absent: absent,
          late: late,
          excused: excused,
          percentage: percentage,
          status: percentage >= 75 ? 'good' : percentage >= 60 ? 'warning' : 'critical',
          sections: sectionBreakdown.sort((a, b) => b.percentage - a.percentage)
        };
      })
    );

    // Overall statistics
    const overallStats = {
      totalDepartments: departmentStats.length,
      totalStudents: departmentStats.reduce((sum, d) => sum + d.totalStudents, 0),
      totalPeriods: departmentStats.reduce((sum, d) => sum + d.totalPeriods, 0),
      totalPresent: departmentStats.reduce((sum, d) => sum + d.present, 0),
      totalAbsent: departmentStats.reduce((sum, d) => sum + d.absent, 0),
      averagePercentage: departmentStats.length > 0
        ? parseFloat((departmentStats.reduce((sum, d) => sum + d.percentage, 0) / departmentStats.length).toFixed(2))
        : 0,
      departmentsAbove75: departmentStats.filter(d => d.percentage >= 75).length,
      departments60to75: departmentStats.filter(d => d.percentage >= 60 && d.percentage < 75).length,
      departmentsBelow60: departmentStats.filter(d => d.percentage < 60).length
    };

    res.status(200).json({
      success: true,
      data: {
        overallStats,
        departments: departmentStats.sort((a, b) => b.percentage - a.percentage),
        filters: {
          departmentId,
          startDate,
          endDate,
          courseId,
          facultyId
        }
      }
    });
  } catch (error) {
    console.error('Error fetching department-wise stats:', error);
    next(error);
  }
};

// @desc    Get detailed department attendance with student drill-down
// @route   GET /api/faculty/attendance/admin/department-detail/:departmentId
// @access  Private/Admin/Faculty
exports.getDepartmentDetailedStats = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { startDate, endDate, sectionId } = req.query;

    console.log(`📊 Fetching detailed stats for department: ${departmentId}`);

    // Get department info
    const department = await Department.findByPk(departmentId, {
      attributes: ['id', 'name', 'code']
    });

    if (!department) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Get sections
    const sectionWhere = { 
      departmentId: departmentId,
      isActive: true 
    };
    if (sectionId) {
      sectionWhere.id = sectionId;
    }

    const sections = await Section.findAll({
      where: sectionWhere,
      attributes: ['id', 'name', 'code', 'semester', 'currentStrength']
    });

    // Get all students in these sections
    const students = await Student.findAll({
      where: {
        sectionId: sections.map(s => s.id),
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['name', 'code']
        }
      ]
    });

    // Build attendance query
    const attendanceWhere = {
      studentId: students.map(s => s.id)
    };

    if (startDate && endDate) {
      attendanceWhere.attendanceDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get attendance records
    const attendanceRecords = await Attendance.findAll({
      where: attendanceWhere,
      include: [{
        model: Course,
        as: 'course',
        attributes: ['code', 'name']
      }]
    });

    // Calculate student-wise stats
    const studentStats = students.map(student => {
      const studentAttendance = attendanceRecords.filter(r => r.studentId === student.id);
      const present = studentAttendance.filter(r => r.status === 'present').length;
      const total = studentAttendance.length;
      const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;

      return {
        studentId: student.id,
        rollNumber: student.rollNumber,
        name: student.user.name,
        email: student.user.email,
        section: student.section?.name,
        sectionCode: student.section?.code,
        totalPeriods: total,
        present: present,
        absent: studentAttendance.filter(r => r.status === 'absent').length,
        late: studentAttendance.filter(r => r.status === 'late').length,
        excused: studentAttendance.filter(r => r.status === 'excused').length,
        percentage: percentage,
        status: percentage >= 75 ? 'good' : percentage >= 60 ? 'warning' : 'critical'
      };
    });

    // Section-wise stats
    const sectionStats = sections.map(section => {
      const sectionStudents = students.filter(s => s.sectionId === section.id);
      const sectionAttendance = attendanceRecords.filter(
        r => sectionStudents.some(s => s.id === r.studentId)
      );

      const present = sectionAttendance.filter(r => r.status === 'present').length;
      const total = sectionAttendance.length;
      const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;

      return {
        sectionId: section.id,
        sectionName: section.name,
        sectionCode: section.code,
        semester: section.semester,
        studentCount: sectionStudents.length,
        totalPeriods: total,
        present: present,
        absent: sectionAttendance.filter(r => r.status === 'absent').length,
        late: sectionAttendance.filter(r => r.status === 'late').length,
        excused: sectionAttendance.filter(r => r.status === 'excused').length,
        percentage: percentage,
        status: percentage >= 75 ? 'good' : percentage >= 60 ? 'warning' : 'critical'
      };
    });

    // Overall department stats
    const totalPresent = attendanceRecords.filter(r => r.status === 'present').length;
    const totalPeriods = attendanceRecords.length;
    const overallPercentage = totalPeriods > 0 
      ? parseFloat(((totalPresent / totalPeriods) * 100).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        department: {
          id: department.id,
          name: department.name,
          code: department.code,
          totalStudents: students.length,
          totalSections: sections.length,
          totalPeriods: totalPeriods,
          present: totalPresent,
          absent: attendanceRecords.filter(r => r.status === 'absent').length,
          late: attendanceRecords.filter(r => r.status === 'late').length,
          excused: attendanceRecords.filter(r => r.status === 'excused').length,
          percentage: overallPercentage
        },
        sectionStats: sectionStats.sort((a, b) => b.percentage - a.percentage),
        studentStats: studentStats.sort((a, b) => a.percentage - b.percentage)
      }
    });
  } catch (error) {
    console.error('Error fetching department detailed stats:', error);
    next(error);
  }
};

