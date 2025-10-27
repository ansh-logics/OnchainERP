const ErrorResponse = require('../utils/errorResponse');
const { Faculty, Student, User, Department, Section, College } = require('../db/models');

// Middleware to ensure faculty profile exists and attach it to req.faculty
exports.facultyProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      console.log('[FACULTY_PROFILE] No user found in request');
      return next(new ErrorResponse('User not authenticated', 401));
    }

    console.log('[FACULTY_PROFILE] Checking profile for user:', req.user.id, 'Role:', req.user.role);

    // Verify the user has faculty role
    if (req.user.role !== 'faculty') {
      console.log('[FACULTY_PROFILE] User is not a faculty member:', req.user.role);
      return next(new ErrorResponse('Access denied. Faculty role required.', 403));
    }

    // Check if faculty profile is already loaded via auth middleware
    if (req.user.facultyProfile) {
      console.log('[FACULTY_PROFILE] Faculty profile already loaded from auth middleware');
      req.faculty = req.user.facultyProfile;
      return next();
    }

    console.log('[FACULTY_PROFILE] Faculty profile not in user object, fetching separately');

    // If not loaded, fetch it separately
    const faculty = await Faculty.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Department, as: 'department', attributes: ['id', 'name', 'shortName'] },
        { model: College, as: 'college', attributes: ['id', 'name', 'shortName'] }
      ]
    });

    if (!faculty) {
      console.log('[FACULTY_PROFILE] Faculty profile not found in database for user:', req.user.id);
      return next(new ErrorResponse('Faculty profile not found', 404));
    }

    console.log('[FACULTY_PROFILE] Faculty profile loaded successfully:', faculty.id);
    req.faculty = faculty;
    req.user.facultyProfile = faculty; // Attach to user object for consistency

    next();
  } catch (error) {
    console.error('[FACULTY_PROFILE] Middleware error:', error);
    return next(new ErrorResponse('Error loading faculty profile', 500));
  }
};

// Middleware to ensure student profile exists and attach it to req.student
exports.studentProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }

    // Check if student profile is already loaded via auth middleware
    if (req.user.studentProfile) {
      req.student = req.user.studentProfile;
      return next();
    }

    // If not loaded, fetch it separately
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Department, as: 'department', attributes: ['id', 'name', 'shortName'] },
        { model: Section, as: 'section', attributes: ['id', 'name', 'semester'] },
        { model: College, as: 'college', attributes: ['id', 'name', 'shortName'] }
      ]
    });

    if (!student) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    req.student = student;
    req.user.studentProfile = student; // Attach to user object for consistency

    next();
  } catch (error) {
    console.error('Student profile middleware error:', error);
    return next(new ErrorResponse('Error loading student profile', 500));
  }
};

// Middleware to ensure user has appropriate profile based on role
exports.ensureProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }

    const { role } = req.user;

    if (role === 'faculty') {
      return exports.facultyProfile(req, res, next);
    } else if (role === 'student') {
      return exports.studentProfile(req, res, next);
    } else {
      // For admin and other roles, no specific profile needed
      return next();
    }
  } catch (error) {
    console.error('Profile middleware error:', error);
    return next(new ErrorResponse('Error loading user profile', 500));
  }
};
