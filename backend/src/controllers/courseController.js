const { Course, Faculty, Student, Department, College, User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

const TYPE_UI_TO_DB = {
  Core: 'Core',
  Elective: 'Elective',
  Lab: 'Laboratory',
  Project: 'Project'
};

const TYPE_DB_TO_UI = {
  Core: 'Core',
  Elective: 'Elective',
  Laboratory: 'Lab',
  Project: 'Project',
  Internship: 'Internship'
};

function mapCourseTypeToDb(uiType) {
  if (!uiType) return 'Core';
  return TYPE_UI_TO_DB[uiType] || uiType;
}

function mapCourseTypeToUi(dbType) {
  return TYPE_DB_TO_UI[dbType] || dbType;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(s) {
  return typeof s === 'string' && UUID_RE.test(s);
}

async function resolveUserCollegeId(userInstance) {
  const plain = userInstance.get ? userInstance.get({ plain: true }) : userInstance;
  if (plain.studentProfile?.collegeId) return plain.studentProfile.collegeId;
  if (plain.facultyProfile?.collegeId) return plain.facultyProfile.collegeId;
  const college = await College.findOne({
    where: { adminId: plain.id },
    attributes: ['id']
  });
  return college?.id || null;
}

function serializeCourse(row) {
  const c = row.get ? row.get({ plain: true }) : row;
  return {
    _id: c.id,
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description,
    credits: c.credits,
    semester: c.semester,
    type: mapCourseTypeToUi(c.courseType),
    courseType: c.courseType,
    department: c.department?.name || '',
    collegeId: c.collegeId,
    departmentId: c.departmentId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  };
}

const courseInclude = [
  { model: Department, as: 'department', attributes: ['id', 'name', 'shortName'] },
  { model: College, as: 'college', attributes: ['id', 'name', 'shortName'] }
];

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      include: courseInclude,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses.map((c) => serializeCourse(c))
    });
  } catch (error) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      const duplicateField = error?.errors?.[0]?.path || 'field';
      return next(new ErrorResponse(`A course with this ${duplicateField} already exists.`, 409));
    }
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: courseInclude
    });

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        ...serializeCourse(course),
        faculty: null,
        students: []
      }
    });
  } catch (error) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      const duplicateField = error?.errors?.[0]?.path || 'field';
      return next(new ErrorResponse(`A course with this ${duplicateField} already exists.`, 409));
    }
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res, next) => {
  try {
    let collegeId = req.body.college;
    if (collegeId && typeof collegeId === 'object' && collegeId._id) {
      collegeId = collegeId._id;
    }
    if (!collegeId) {
      collegeId = await resolveUserCollegeId(req.user);
    }
    if (!collegeId) {
      return next(new ErrorResponse('College is required', 400));
    }

    let departmentId = req.body.department;
    if (typeof departmentId === 'string' && !isUuid(departmentId)) {
      const department = await Department.findOne({
        where: { name: departmentId, collegeId }
      });

      if (!department) {
        return next(
          new ErrorResponse(`Department '${req.body.department}' not found`, 404)
        );
      }
      departmentId = department.id;
    }

    if (!departmentId) {
      return next(new ErrorResponse('Department is required', 400));
    }

    const courseType = mapCourseTypeToDb(req.body.type || req.body.courseType);
    const prerequisites =
      req.body.prerequisites && String(req.body.prerequisites).trim()
        ? JSON.stringify(
            String(req.body.prerequisites)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          )
        : null;

    const course = await Course.create({
      collegeId,
      departmentId,
      code: req.body.code,
      name: req.body.name,
      shortName: req.body.shortName || req.body.name?.slice(0, 40) || req.body.code,
      description: req.body.description || '',
      credits: req.body.credits,
      semester: req.body.semester,
      courseType,
      prerequisites
    });

    const withAssoc = await Course.findByPk(course.id, { include: courseInclude });

    res.status(201).json({
      success: true,
      data: serializeCourse(withAssoc)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    const patch = {};
    if (req.body.code !== undefined) patch.code = req.body.code;
    if (req.body.name !== undefined) patch.name = req.body.name;
    if (req.body.description !== undefined) patch.description = req.body.description;
    if (req.body.shortName !== undefined) patch.shortName = req.body.shortName;
    if (req.body.credits !== undefined) patch.credits = req.body.credits;
    if (req.body.semester !== undefined) patch.semester = req.body.semester;
    if (req.body.isActive !== undefined) patch.isActive = req.body.isActive;
    if (req.body.type !== undefined || req.body.courseType !== undefined) {
      patch.courseType = mapCourseTypeToDb(req.body.type || req.body.courseType);
    }
    if (req.body.prerequisites !== undefined) {
      patch.prerequisites =
        req.body.prerequisites && String(req.body.prerequisites).trim()
          ? JSON.stringify(
              String(req.body.prerequisites)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            )
          : null;
    }

    if (req.body.department !== undefined) {
      const d = req.body.department;
      if (typeof d === 'string' && !isUuid(d)) {
        const department = await Department.findOne({
          where: { name: d, collegeId: course.collegeId }
        });
        if (!department) {
          return next(new ErrorResponse(`Department '${d}' not found`, 404));
        }
        patch.departmentId = department.id;
      } else if (isUuid(d)) {
        patch.departmentId = d;
      }
    }

    await course.update(patch);
    const updated = await Course.findByPk(course.id, { include: courseInclude });

    res.status(200).json({
      success: true,
      data: serializeCourse(updated)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    await course.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign faculty to course
// @route   PUT /api/courses/:id/faculty/:facultyId
// @access  Private/Admin
exports.assignFaculty = async (req, res, next) => {
  return next(
    new ErrorResponse(
      'Assigning faculty to a course is not supported in the current schema (use sections / class teachers).',
      501
    )
  );
};

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private/Faculty or Admin
exports.getCourseStudents = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ where: { userId: req.user.id } });

      if (!faculty || faculty.departmentId !== course.departmentId) {
        return next(
          new ErrorResponse(`Not authorized to access this course's students`, 403)
        );
      }
    }

    const students = await Student.findAll({
      where: {
        departmentId: course.departmentId,
        currentSemester: course.semester
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    const data = students.map((s) => {
      const row = s.get({ plain: true });
      return {
        ...row,
        _id: row.id,
        contactNumber: row.user?.phone
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course assignments
// @route   GET /api/courses/:id/assignments
// @access  Private
exports.getCourseAssignments = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses by department and semester
// @route   GET /api/courses/department/:department/semester/:semester
// @access  Private/Admin
exports.getCoursesByDepartmentAndSemester = async (req, res, next) => {
  try {
    const { department, semester } = req.params;
    const sem = parseInt(semester, 10);

    let dept = await Department.findByPk(department);
    if (!dept) {
      dept = await Department.findOne({ where: { name: department } });
    }
    if (!dept) {
      return next(new ErrorResponse('Department not found', 404));
    }

    const courses = await Course.findAll({
      where: {
        departmentId: dept.id,
        semester: sem
      },
      include: courseInclude,
      order: [['code', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses.map((c) => serializeCourse(c)),
      message: `Found ${courses.length} courses for ${dept.name} department, semester ${sem}`
    });
  } catch (error) {
    next(error);
  }
};
