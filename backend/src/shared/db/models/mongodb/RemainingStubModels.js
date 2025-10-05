const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Create stub models for the remaining entities
const createStubModel = (name, additionalFields = {}) => {
  const schema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    ...additionalFields
  }, { 
    timestamps: true, 
    collection: name.toLowerCase() + 's' 
  });

  // Add helper methods
  schema.virtual('id').get(function() {
    return this._id;
  });

  schema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });

  schema.statics.findByPk = function(id) { return this.findById(id); };
  schema.statics.findAll = function(options = {}) {
    let query = this.find();
    if (options.where) query = query.where(options.where);
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.skip(options.offset);
    return query;
  };
  schema.statics.create = function(data) { return new this(data).save(); };
  schema.statics.bulkCreate = function(dataArray) { return this.insertMany(dataArray); };
  schema.statics.update = function(updateData, options) { return this.updateMany(options.where || {}, updateData); };
  schema.statics.destroy = function(options) { return this.deleteMany(options.where || {}); };
  schema.statics.count = function(options = {}) { return this.countDocuments(options.where || {}); };
  schema.methods.update = function(data) { Object.assign(this, data); return this.save(); };
  schema.methods.destroy = function() { return this.deleteOne(); };

  return mongoose.model(name, schema);
};

// Create all remaining stub models
const Exam = createStubModel('Exam', {
  examDate: { type: Date },
  duration: { type: Number },
  maxMarks: { type: Number }
});

const ExamHall = createStubModel('ExamHall', {
  capacity: { type: Number, default: 50 },
  location: { type: String }
});

const ExamResult = createStubModel('ExamResult', {
  examId: { type: String, ref: 'Exam' },
  studentId: { type: String, ref: 'Student' },
  marks: { type: Number }
});

const LibraryBook = createStubModel('LibraryBook', {
  isbn: { type: String },
  author: { type: String },
  copies: { type: Number, default: 1 }
});

const LibraryIssue = createStubModel('LibraryIssue', {
  bookId: { type: String, ref: 'LibraryBook' },
  studentId: { type: String, ref: 'Student' },
  issueDate: { type: Date, default: Date.now },
  returnDate: { type: Date }
});

const Classroom = createStubModel('Classroom', {
  building: { type: String },
  floor: { type: Number },
  capacity: { type: Number, default: 60 }
});

const Timetable = createStubModel('Timetable', {
  sectionId: { type: String, ref: 'Section' },
  facultyId: { type: String, ref: 'Faculty' },
  day: { type: String },
  period: { type: Number },
  subject: { type: String }
});

const CourseEnrollment = createStubModel('CourseEnrollment', {
  studentId: { type: String, ref: 'Student' },
  courseId: { type: String, ref: 'Course' },
  enrollmentDate: { type: Date, default: Date.now }
});

const FacultySubstitution = createStubModel('FacultySubstitution', {
  originalFacultyId: { type: String, ref: 'Faculty' },
  substituteFacultyId: { type: String, ref: 'Faculty' },
  date: { type: Date },
  period: { type: Number }
});

const Permission = createStubModel('Permission', {
  code: { type: String, required: true },
  description: { type: String }
});

const RolePermission = createStubModel('RolePermission', {
  role: { type: String, required: true },
  permissionId: { type: String, ref: 'Permission' }
});

const PasswordResetRequest = createStubModel('PasswordResetRequest', {
  userId: { type: String, ref: 'User' },
  token: { type: String, required: true },
  expires: { type: Date, required: true }
});

module.exports = {
  Exam,
  ExamHall,
  ExamResult,
  LibraryBook,
  LibraryIssue,
  Classroom,
  Timetable,
  CourseEnrollment,
  FacultySubstitution,
  Permission,
  RolePermission,
  PasswordResetRequest
};
