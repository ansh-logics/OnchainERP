const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  assignFaculty,
  getCourseStudents,
  getCourseAssignments,
  getCoursesByDepartmentAndSemester
} = require('../controllers/courseController');

const router = express.Router();

const { protect, authorize, checkPermission } = require('../../shared/middleware/auth');

// Protect all routes
router.use(protect);

// Basic course routes
router.route('/')
  .get(getCourses)
  .post(authorize('admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

// Special course routes
router.get('/department/:department/semester/:semester', authorize('admin'), getCoursesByDepartmentAndSemester);
router.put('/:id/faculty/:facultyId', authorize('admin'), assignFaculty);
router.get('/:id/students', authorize('admin', 'faculty'), getCourseStudents);
router.get('/:id/assignments', getCourseAssignments);

module.exports = router;
