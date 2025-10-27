const asyncHandler = require('express-async-handler');
const { Hostel, HostelRoom, HostelAllocation, Student, Faculty, College, User } = require('../../shared/db/models');
const ErrorResponse = require('../../shared/utils/errorResponse');

// @desc    Get all hostels
// @route   GET /api/hostels
// @access  Public
const getHostels = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, collegeId, hostelType, gender } = req.query;

  const whereClause = { isActive: true };
  if (collegeId) whereClause.collegeId = collegeId;
  if (hostelType) whereClause.hostelType = hostelType;
  if (gender) whereClause.gender = gender;

  const hostels = await Hostel.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: College,
        as: 'college',
        attributes: ['id', 'name', 'shortName']
      },
      {
        model: Faculty,
        as: 'warden',
        attributes: ['id', 'employeeId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }]
      }
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: hostels.count,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: hostels.count,
      pages: Math.ceil(hostels.count / parseInt(limit))
    },
    data: hostels.rows
  });
});

// @desc    Get single hostel
// @route   GET /api/hostels/:id
// @access  Public
const getHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findByPk(req.params.id, {
    include: [
      {
        model: College,
        as: 'college',
        attributes: ['id', 'name', 'shortName']
      },
      {
        model: Faculty,
        as: 'warden',
        attributes: ['id', 'employeeId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }]
      },
      {
        model: HostelRoom,
        as: 'rooms',
        where: { isActive: true },
        required: false
      }
    ]
  });

  if (!hostel) {
    return res.status(404).json({
      success: false,
      message: 'Hostel not found'
    });
  }

  res.status(200).json({
    success: true,
    data: hostel
  });
});

// @desc    Create new hostel
// @route   POST /api/hostels
// @access  Private (Admin)
const createHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.create(req.body);

  res.status(201).json({
    success: true,
    data: hostel
  });
});

// @desc    Update hostel
// @route   PUT /api/hostels/:id
// @access  Private (Admin)
const updateHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findByPk(req.params.id);

  if (!hostel) {
    return res.status(404).json({
      success: false,
      message: 'Hostel not found'
    });
  }

  await hostel.update(req.body);

  res.status(200).json({
    success: true,
    data: hostel
  });
});

// @desc    Delete hostel
// @route   DELETE /api/hostels/:id
// @access  Private (Admin)
const deleteHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findByPk(req.params.id);

  if (!hostel) {
    return res.status(404).json({
      success: false,
      message: 'Hostel not found'
    });
  }

  await hostel.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: 'Hostel deleted successfully'
  });
});

// @desc    Get hostel rooms
// @route   GET /api/hostels/:id/rooms
// @access  Public
const getHostelRooms = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, roomType, condition } = req.query;

  const whereClause = { hostelId: id, isActive: true };
  if (roomType) whereClause.roomType = roomType;
  if (condition) whereClause.condition = condition;

  const rooms = await HostelRoom.findAndCountAll({
    where: whereClause,
    include: [{
      model: HostelAllocation,
      as: 'allocations',
      where: { isActive: true, status: ['allocated', 'checked_in'] },
      required: false,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'rollNumber', 'enrollmentNumber'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }]
      }]
    }],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['roomNumber', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: rooms.count,
    data: rooms.rows
  });
});

// @desc    Create hostel room
// @route   POST /api/hostels/:id/rooms
// @access  Private (Admin)
const createHostelRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const roomData = { ...req.body, hostelId: id };

  const room = await HostelRoom.create(roomData);

  res.status(201).json({
    success: true,
    data: room
  });
});

// @desc    Get hostel occupancy
// @route   GET /api/hostels/:id/occupancy
// @access  Public
const getHostelOccupancy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hostel = await Hostel.findByPk(id);
  if (!hostel) {
    return res.status(404).json({
      success: false,
      message: 'Hostel not found'
    });
  }

  const totalRooms = await HostelRoom.count({
    where: { hostelId: id, isActive: true }
  });

  const occupiedRooms = await HostelRoom.count({
    where: { hostelId: id, isActive: true },
    include: [{
      model: HostelAllocation,
      as: 'allocations',
      where: { isActive: true, status: ['allocated', 'checked_in'] },
      required: true
    }]
  });

  const activeAllocations = await HostelAllocation.count({
    where: { hostelId: id, isActive: true, status: ['allocated', 'checked_in'] }
  });

  res.status(200).json({
    success: true,
    data: {
      hostelId: id,
      totalCapacity: hostel.totalCapacity,
      currentOccupancy: hostel.currentOccupancy,
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      activeAllocations,
      occupancyPercentage: Math.round((hostel.currentOccupancy / hostel.totalCapacity) * 100)
    }
  });
});

// @desc    Allocate room to student
// @route   POST /api/hostels/allocations
// @access  Private (Admin)
const allocateRoom = asyncHandler(async (req, res) => {
  const { studentId, hostelId, roomId, academicYear, semester } = req.body;

  // Check if student already has active allocation
  const existingAllocation = await HostelAllocation.findOne({
    where: {
      studentId,
      academicYear,
      isActive: true,
      status: ['allocated', 'checked_in']
    }
  });

  if (existingAllocation) {
    return res.status(400).json({
      success: false,
      message: 'Student already has an active hostel allocation for this academic year'
    });
  }

  // Check room availability
  const room = await HostelRoom.findByPk(roomId);
  if (!room || room.currentOccupancy >= room.capacity) {
    return res.status(400).json({
      success: false,
      message: 'Room is not available or at full capacity'
    });
  }

  // Get hostel fees
  const hostel = await Hostel.findByPk(hostelId);
  
  const allocation = await HostelAllocation.create({
    ...req.body,
    monthlyFee: hostel.monthlyFee,
    securityDeposit: hostel.securityDeposit,
    allocationDate: new Date()
  });

  // Update room occupancy
  await room.increment('currentOccupancy');
  await hostel.increment('currentOccupancy');

  res.status(201).json({
    success: true,
    data: allocation
  });
});

// @desc    Check in student
// @route   POST /api/hostels/:id/checkin/:studentId
// @access  Private (Warden/Admin)
const checkInStudent = asyncHandler(async (req, res) => {
  const { id: hostelId, studentId } = req.params;

  const allocation = await HostelAllocation.findOne({
    where: {
      studentId,
      hostelId,
      isActive: true,
      status: 'allocated'
    }
  });

  if (!allocation) {
    return res.status(404).json({
      success: false,
      message: 'Active allocation not found for this student'
    });
  }

  await allocation.update({
    status: 'checked_in',
    checkInDate: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Student checked in successfully',
    data: allocation
  });
});

// @desc    Check out student
// @route   POST /api/hostels/:id/checkout/:studentId
// @access  Private (Warden/Admin)
const checkOutStudent = asyncHandler(async (req, res) => {
  const { id: hostelId, studentId } = req.params;

  const allocation = await HostelAllocation.findOne({
    where: {
      studentId,
      hostelId,
      isActive: true,
      status: 'checked_in'
    },
    include: [{
      model: HostelRoom,
      as: 'room'
    }]
  });

  if (!allocation) {
    return res.status(404).json({
      success: false,
      message: 'Active check-in not found for this student'
    });
  }

  await allocation.update({
    status: 'checked_out',
    checkOutDate: new Date()
  });

  // Update room and hostel occupancy
  await allocation.room.decrement('currentOccupancy');
  await Hostel.decrement('currentOccupancy', { where: { id: hostelId } });

  res.status(200).json({
    success: true,
    message: 'Student checked out successfully',
    data: allocation
  });
});

module.exports = {
  getHostels,
  getHostel,
  createHostel,
  updateHostel,
  deleteHostel,
  getHostelRooms,
  createHostelRoom,
  getHostelOccupancy,
  allocateRoom,
  checkInStudent,
  checkOutStudent
};
