const { Lab, Department, User, College } = require('../models');
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

    // Check if lab with same code exists in the department
    const existingLab = await Lab.findOne({
      where: {
        labCode: labCode.toUpperCase(),
        departmentId: department
      }
    });

    if (existingLab) {
      return next(new ErrorResponse('Lab with this code already exists in the department', 400));
    }

    // Verify department exists
    const departmentExists = await Department.findByPk(department);
    if (!departmentExists) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Verify lab incharge exists
    if (labIncharge) {
      const labInchargeUser = await User.findByPk(labIncharge);
      if (!labInchargeUser) {
        return next(new ErrorResponse('Lab incharge user not found', 404));
      }
    }

    const lab = await Lab.create({
      name,
      labCode: labCode.toUpperCase(),
      description,
      departmentId: department,
      collegeId: college,
      location,
      capacity,
      equipment: equipment || [],
      labInchargeId: labIncharge
    });

    // Get lab with associations
    const labWithAssociations = await Lab.findByPk(lab.id, {
      include: [
        { model: Department, as: 'department', attributes: ['name', 'shortName'] },
        { model: User, as: 'labIncharge', attributes: ['name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: labWithAssociations
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
    const labs = await Lab.findAll({
      include: [
        { model: Department, as: 'department', attributes: ['name', 'shortName'] },
        { model: College, as: 'college', attributes: ['name', 'shortName'] },
        { model: User, as: 'labIncharge', attributes: ['name', 'email'] }
      ],
      order: [['name', 'ASC']]
    });

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
    const lab = await Lab.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'department', attributes: ['name', 'shortName'] },
        { model: College, as: 'college', attributes: ['name', 'shortName'] },
        { model: User, as: 'labIncharge', attributes: ['name', 'email'] }
      ]
    });

    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
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
// @access  Private (Admin, Super Admin)
const updateLab = async (req, res, next) => {
  try {
    let lab = await Lab.findByPk(req.params.id);

    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }

    // Update lab
    lab = await lab.update(req.body);

    // Get updated lab with associations
    const updatedLab = await Lab.findByPk(lab.id, {
      include: [
        { model: Department, as: 'department', attributes: ['name', 'shortName'] },
        { model: College, as: 'college', attributes: ['name', 'shortName'] },
        { model: User, as: 'labIncharge', attributes: ['name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedLab
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
    const lab = await Lab.findByPk(req.params.id);

    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }

    // Soft delete
    await lab.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Lab deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add equipment to lab
// @route   POST /api/labs/:id/equipment
// @access  Private (Admin, Super Admin)
const addEquipment = async (req, res, next) => {
  try {
    const lab = await Lab.findByPk(req.params.id);

    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }

    const { name, model, serialNumber, purchaseDate, warranty, condition } = req.body;

    const newEquipment = {
      id: Date.now().toString(),
      name,
      model,
      serialNumber,
      purchaseDate,
      warranty,
      condition: condition || 'Working',
      addedBy: req.user.id,
      addedAt: new Date()
    };

    const currentEquipment = lab.equipment || [];
    currentEquipment.push(newEquipment);

    await lab.update({ equipment: currentEquipment });

    res.status(200).json({
      success: true,
      message: 'Equipment added successfully',
      data: newEquipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update equipment in lab
// @route   PUT /api/labs/:id/equipment/:equipmentId
// @access  Private (Admin, Super Admin)
const updateEquipment = async (req, res, next) => {
  try {
    const lab = await Lab.findByPk(req.params.id);

    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }

    const equipmentId = req.params.equipmentId;
    const currentEquipment = lab.equipment || [];
    const equipmentIndex = currentEquipment.findIndex(eq => eq.id === equipmentId);

    if (equipmentIndex === -1) {
      return next(new ErrorResponse('Equipment not found', 404));
    }

    currentEquipment[equipmentIndex] = {
      ...currentEquipment[equipmentIndex],
      ...req.body,
      updatedAt: new Date()
    };

    await lab.update({ equipment: currentEquipment });

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: currentEquipment[equipmentIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove equipment from lab
// @route   DELETE /api/labs/:id/equipment/:equipmentId
// @access  Private (Admin, Super Admin)
const removeEquipment = async (req, res, next) => {
  try {
    const lab = await Lab.findByPk(req.params.id);

    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }

    const equipmentId = req.params.equipmentId;
    const currentEquipment = lab.equipment || [];
    const updatedEquipment = currentEquipment.filter(eq => eq.id !== equipmentId);

    if (currentEquipment.length === updatedEquipment.length) {
      return next(new ErrorResponse('Equipment not found', 404));
    }

    await lab.update({ equipment: updatedEquipment });

    res.status(200).json({
      success: true,
      message: 'Equipment removed successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add maintenance record
// @route   POST /api/labs/:id/maintenance
// @access  Private (Admin, Super Admin)
const addMaintenanceRecord = async (req, res, next) => {
  try {
    const lab = await Lab.findByPk(req.params.id);

    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }

    const { type, description, date, cost, vendor } = req.body;

    const newMaintenanceRecord = {
      id: Date.now().toString(),
      type,
      description,
      date: date || new Date(),
      cost,
      vendor,
      performedBy: req.user.id,
      createdAt: new Date()
    };

    const currentMaintenance = lab.maintenance || [];
    currentMaintenance.push(newMaintenanceRecord);

    await lab.update({ maintenance: currentMaintenance });

    res.status(200).json({
      success: true,
      message: 'Maintenance record added successfully',
      data: newMaintenanceRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lab availability
// @route   GET /api/labs/:id/availability
// @access  Private
const getLabAvailability = async (req, res, next) => {
  try {
    const lab = await Lab.findByPk(req.params.id);

    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }

    const availability = lab.availability || {};

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
