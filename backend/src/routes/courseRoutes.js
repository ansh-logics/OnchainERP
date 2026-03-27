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

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Static path before /:id so "department" is not captured as an id
router.get(
  '/department/:department/semester/:semester',
  authorize('admin'),
  getCoursesByDepartmentAndSemester
);

router.route('/')
  .get(getCourses)
  .post(authorize('admin'), createCourse);

router.put('/:id/faculty/:facultyId', authorize('admin'), assignFaculty);
router.get('/:id/students', authorize('admin', 'faculty'), getCourseStudents);
router.get('/:id/assignments', getCourseAssignments);

router.route('/:id')
  .get(getCourse)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

module.exports = router;
