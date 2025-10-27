const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Simple stub models to prevent import errors - can be expanded later

const courseSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true },
  code: { type: String, required: true },
  departmentId: { type: String, ref: 'Department' },
  credits: { type: Number, default: 3 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'courses' });

const transactionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  studentId: { type: String, ref: 'Student' },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['pending', 'overdue', 'paid', 'failed'], default: 'pending' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'transactions' });

const feeSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  studentId: { type: String, ref: 'Student' },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['pending', 'overdue', 'paid', 'failed'], default: 'pending' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'fees' });

const labSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true },
  code: { type: String, required: true },
  departmentId: { type: String, ref: 'Department' },
  capacity: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'labs' });

const hostelSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true },
  type: { type: String, enum: ['boys', 'girls'], required: true },
  capacity: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'hostels' });

const hostelRoomSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  hostelId: { type: String, ref: 'Hostel' },
  roomNumber: { type: String, required: true },
  capacity: { type: Number, default: 2 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'hostelrooms' });

const hostelAllocationSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  studentId: { type: String, ref: 'Student' },
  roomId: { type: String, ref: 'HostelRoom' },
  allocationDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'hostelallocations' });

const attendanceSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  studentId: { type: String, ref: 'Student' },
  sectionId: { type: String, ref: 'Section' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'attendance' });

const assignmentSubmissionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  assignmentId: { type: String, ref: 'Assignment' },
  studentId: { type: String, ref: 'Student' },
  submissionDate: { type: Date, default: Date.now },
  marks: { type: Number },
  status: { type: String, default: 'submitted' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'assignmentsubmissions' });

// Add helper methods to all schemas
const addHelperMethods = (schema) => {
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

  schema.statics.findByPk = function(id) {
    return this.findById(id);
  };

  schema.statics.findAll = function(options = {}) {
    let query = this.find();
    if (options.where) query = query.where(options.where);
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.skip(options.offset);
    return query;
  };

  schema.statics.create = function(data) {
    return new this(data).save();
  };

  schema.statics.bulkCreate = function(dataArray) {
    return this.insertMany(dataArray);
  };

  schema.statics.update = function(updateData, options) {
    return this.updateMany(options.where || {}, updateData);
  };

  schema.statics.destroy = function(options) {
    return this.deleteMany(options.where || {});
  };

  schema.statics.count = function(options = {}) {
    return this.countDocuments(options.where || {});
  };

  schema.methods.update = function(data) {
    Object.assign(this, data);
    return this.save();
  };

  schema.methods.destroy = function() {
    return this.deleteOne();
  };
};

// Apply helper methods to all schemas
[courseSchema, transactionSchema, feeSchema, labSchema, hostelSchema, 
 hostelRoomSchema, hostelAllocationSchema, attendanceSchema, assignmentSubmissionSchema].forEach(addHelperMethods);

// Create and export models
const Course = mongoose.model('Course', courseSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Fee = mongoose.model('Fee', feeSchema);
const Lab = mongoose.model('Lab', labSchema);
const Hostel = mongoose.model('Hostel', hostelSchema);
const HostelRoom = mongoose.model('HostelRoom', hostelRoomSchema);
const HostelAllocation = mongoose.model('HostelAllocation', hostelAllocationSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

module.exports = {
  Course,
  Transaction,
  Fee,
  Lab,
  Hostel,
  HostelRoom,
  HostelAllocation,
  Attendance,
  AssignmentSubmission
};
