const Lab = require('../models/Lab');
const Department = require('../models/Department');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new lab
// @route   POST /api/labs
// @access  Private (Admin, Super Admin)
const createLab = async (req, res, next) => {
  try {
    const {
      name,
      labCode,
      description,
      department,
      college,
      location,
      capacity,
      equipment,
      labIncharge,
      type,
      operatingHours,
      safetyRules
    } = req.body;

    // Check if user has permission to create lab in this college/department
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== college) {
      return next(new ErrorResponse('Not authorized to create lab in this college', 403));
    }

    // Check if lab with same code exists in the department
    const existingLab = await Lab.findOne({
      labCode: labCode.toUpperCase(),
      department
    });

    if (existingLab) {
      return next(new ErrorResponse('Lab with this code already exists in the department', 400));
    }

    // Verify department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Verify lab incharge exists
    if (labIncharge) {
      const labInchargeUser = await User.findById(labIncharge);
      if (!labInchargeUser) {
        return next(new ErrorResponse('Lab incharge user not found', 404));
      }
    }

    const lab = await Lab.create({
      name,
      labCode: labCode.toUpperCase(),
      description,
      department,
      college,
      location,
      capacity,
      equipment: equipment || [],
      labIncharge,
      type,
      operatingHours,
      safetyRules: safetyRules || []
    });

    await lab.populate([
      { path: 'department', select: 'name shortName' },
      { path: 'college', select: 'name shortName' },
      { path: 'labIncharge', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: lab
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all labs
// @route   GET /api/labs
// @access  Private
const getLabs = async (req, res, next) => {
  try {
    let query = {};

    // If not super admin, only show labs from user's college
    if (req.user.role !== 'super_admin') {
      query.college = req.user.college;
    }

    // Filter by department if specified
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Filter by type if specified
    if (req.query.type) {
      query.type = req.query.type;
    }

    const labs = await Lab.find(query)
      .populate('department', 'name shortName')
      .populate('college', 'name shortName')
      .populate('labIncharge', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lab
// @route   GET /api/labs/:id
// @access  Private
const getLab = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id)
      .populate('department', 'name shortName')
      .populate('college', 'name shortName')
      .populate('labIncharge', 'name email contactNumber')
      .populate('equipment.addedBy', 'name')
      .populate('maintenanceRecords.performedBy', 'name');

    if (!lab) {
      return next(new ErrorResponse('Lab not found', 404));
    }

    // Check if user has access to this lab
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== lab.college._id.toString()) {
      return next(new ErrorResponse('Not authorized to access this lab', 403));
    }

    res.status(200).json({
      success: true,
      data: lab
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lab
// @route   PUT /api/labs/:id
// @access  Private (Admin, Faculty, Super Admin)
const updateLab = async (req, res, next) => {
  try {
    let lab = await Lab.findById(req.params.id);

    if (!lab) {
      return next(new ErrorResponse('Lab not found', 404));
    }

    // Check if user has permission to update this lab
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== lab.college.toString()) {
      return next(new ErrorResponse('Not authorized to update this lab', 403));
    }

    // Additional check for faculty - they can only update if they are lab incharge
    if (req.user.role === 'faculty' && lab.labIncharge && lab.labIncharge.toString() !== req.user.id) {
      return next(new ErrorResponse('Faculty can only update labs they are in charge of', 403));
    }

    lab = await Lab.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'department', select: 'name shortName' },
      { path: 'college', select: 'name shortName' },
      { path: 'labIncharge', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      data: lab
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lab
// @route   DELETE /api/labs/:id
// @access  Private (Admin, Super Admin)
const deleteLab = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return next(new ErrorResponse('Lab not found', 404));
    }

    // Check if user has permission to delete this lab
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== lab.college.toString()) {
      return next(new ErrorResponse('Not authorized to delete this lab', 403));
    }

    await lab.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lab deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add equipment to lab
// @route   POST /api/labs/:id/equipment
// @access  Private (Admin, Faculty, Super Admin)
const addEquipment = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return next(new ErrorResponse('Lab not found', 404));
    }

    // Check if user has permission to add equipment to this lab
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== lab.college.toString()) {
      return next(new ErrorResponse('Not authorized to add equipment to this lab', 403));
    }

    // Additional check for faculty - they can only add equipment if they are lab incharge
    if (req.user.role === 'faculty' && lab.labIncharge && lab.labIncharge.toString() !== req.user.id) {
      return next(new ErrorResponse('Faculty can only add equipment to labs they are in charge of', 403));
    }

    const equipmentData = {
      ...req.body,
      addedBy: req.user.id,
      addedAt: new Date()
    };

    lab.equipment.push(equipmentData);
    await lab.save();

    await lab.populate('equipment.addedBy', 'name');

    res.status(201).json({
      success: true,
      data: lab.equipment[lab.equipment.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update equipment in lab
// @route   PUT /api/labs/:id/equipment/:equipmentId
// @access  Private (Admin, Faculty, Super Admin)
const updateEquipment = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return next(new ErrorResponse('Lab not found', 404));
    }

    // Check if user has permission to update equipment in this lab
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== lab.college.toString()) {
      return next(new ErrorResponse('Not authorized to update equipment in this lab', 403));
    }

    // Additional check for faculty - they can only update equipment if they are lab incharge
    if (req.user.role === 'faculty' && lab.labIncharge && lab.labIncharge.toString() !== req.user.id) {
      return next(new ErrorResponse('Faculty can only update equipment in labs they are in charge of', 403));
    }

    const equipment = lab.equipment.id(req.params.equipmentId);

    if (!equipment) {
      return next(new ErrorResponse('Equipment not found', 404));
    }

    // Update equipment fields
    Object.keys(req.body).forEach(key => {
      equipment[key] = req.body[key];
    });

    equipment.lastUpdatedBy = req.user.id;
    equipment.lastUpdatedAt = new Date();

    await lab.save();

    await lab.populate('equipment.addedBy', 'name');
    await lab.populate('equipment.lastUpdatedBy', 'name');

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove equipment from lab
// @route   DELETE /api/labs/:id/equipment/:equipmentId
// @access  Private (Admin, Faculty, Super Admin)
const removeEquipment = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return next(new ErrorResponse('Lab not found', 404));
    }

    // Check if user has permission to remove equipment from this lab
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== lab.college.toString()) {
      return next(new ErrorResponse('Not authorized to remove equipment from this lab', 403));
    }

    // Additional check for faculty - they can only remove equipment if they are lab incharge
    if (req.user.role === 'faculty' && lab.labIncharge && lab.labIncharge.toString() !== req.user.id) {
      return next(new ErrorResponse('Faculty can only remove equipment from labs they are in charge of', 403));
    }

    const equipment = lab.equipment.id(req.params.equipmentId);

    if (!equipment) {
      return next(new ErrorResponse('Equipment not found', 404));
    }

    lab.equipment.pull(req.params.equipmentId);
    await lab.save();

    res.status(200).json({
      success: true,
      message: 'Equipment removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add maintenance record to lab
// @route   POST /api/labs/:id/maintenance
// @access  Private (Admin, Faculty, Super Admin)
const addMaintenanceRecord = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return next(new ErrorResponse('Lab not found', 404));
    }

    // Check if user has permission to add maintenance record to this lab
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== lab.college.toString()) {
      return next(new ErrorResponse('Not authorized to add maintenance record to this lab', 403));
    }

    // Additional check for faculty - they can only add maintenance records if they are lab incharge
    if (req.user.role === 'faculty' && lab.labIncharge && lab.labIncharge.toString() !== req.user.id) {
      return next(new ErrorResponse('Faculty can only add maintenance records to labs they are in charge of', 403));
    }

    const maintenanceData = {
      ...req.body,
      performedBy: req.user.id,
      recordedAt: new Date()
    };

    lab.maintenanceRecords.push(maintenanceData);
    await lab.save();

    await lab.populate('maintenanceRecords.performedBy', 'name');

    res.status(201).json({
      success: true,
      data: lab.maintenanceRecords[lab.maintenanceRecords.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lab availability schedule
// @route   GET /api/labs/:id/availability
// @access  Private
const getLabAvailability = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id)
      .populate('department', 'name shortName')
      .populate('college', 'name shortName');

    if (!lab) {
      return next(new ErrorResponse('Lab not found', 404));
    }

    // Check if user has access to this lab
    if (req.user.role !== 'super_admin' && req.user.college.toString() !== lab.college._id.toString()) {
      return next(new ErrorResponse('Not authorized to access this lab availability', 403));
    }

    // Get date range from query parameters
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // For now, return basic availability based on operating hours
    // In a real application, this would check against scheduled classes, bookings, etc.
    const availability = {
      labId: lab._id,
      labName: lab.name,
      capacity: lab.capacity,
      operatingHours: lab.operatingHours,
      schedule: []
    };

    // Generate availability for each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const operatingHour = lab.operatingHours.find(oh => oh.day === dayOfWeek);

      availability.schedule.push({
        date: new Date(date),
        dayOfWeek,
        isOpen: operatingHour ? operatingHour.isOpen : false,
        openTime: operatingHour ? operatingHour.openTime : null,
        closeTime: operatingHour ? operatingHour.closeTime : null,
        availableSlots: operatingHour && operatingHour.isOpen ? lab.capacity : 0,
        bookedSlots: 0 // This would be calculated from actual bookings
      });
    }

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLab,
  getLabs,
  getLab,
  updateLab,
  deleteLab,
  addEquipment,
  updateEquipment,
  removeEquipment,
  addMaintenanceRecord,
  getLabAvailability
};
