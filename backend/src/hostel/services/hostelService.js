const { Hostel, HostelRoom, HostelAllocation, Student, User } = require('../../shared/db/models');
const LoggingService = require('../../shared/services/LoggingService');

class HostelService {
  static async createHostel(hostelData, userId) {
    try {
      const hostel = await Hostel.create(hostelData);
      
      await LoggingService.logUserAction(
        'hostel_created',
        userId,
        { hostelId: hostel.id, name: hostel.name }
      );
      
      return hostel;
    } catch (error) {
      await LoggingService.logError('hostel', 'create_hostel', userId, error);
      throw error;
    }
  }
  
  static async getAllHostels(filters = {}) {
    const { collegeId, gender, type, limit = 100, offset = 0 } = filters;
    
    const whereClause = {};
    if (collegeId) whereClause.collegeId = collegeId;
    if (gender) whereClause.gender = gender;
    if (type) whereClause.type = type;
    
    return await Hostel.findAndCountAll({
      where: whereClause,
      include: [{
        model: HostelRoom,
        as: 'rooms',
        attributes: ['id', 'roomNumber', 'capacity', 'isOccupied']
      }],
      limit,
      offset,
      order: [['name', 'ASC']]
    });
  }
  
  static async allocateRoom(allocationData, userId) {
    try {
      // Check if room is available
      const room = await HostelRoom.findByPk(allocationData.roomId);
      if (!room || room.isOccupied) {
        throw new Error('Room is not available');
      }
      
      // Create allocation
      const allocation = await HostelAllocation.create({
        ...allocationData,
        allocatedBy: userId,
        status: 'active'
      });
      
      // Update room status
      await HostelRoom.update(
        { isOccupied: true },
        { where: { id: allocationData.roomId } }
      );
      
      await LoggingService.logUserAction(
        'room_allocated',
        userId,
        { 
          allocationId: allocation.id, 
          roomId: allocationData.roomId,
          studentId: allocationData.studentId
        }
      );
      
      return allocation;
    } catch (error) {
      await LoggingService.logError('hostel', 'allocate_room', userId, error);
      throw error;
    }
  }
  
  static async deallocateRoom(allocationId, userId) {
    try {
      const allocation = await HostelAllocation.findByPk(allocationId);
      if (!allocation) {
        throw new Error('Allocation not found');
      }
      
      // Update allocation status
      await HostelAllocation.update(
        { 
          status: 'inactive',
          deallocatedAt: new Date(),
          deallocatedBy: userId
        },
        { where: { id: allocationId } }
      );
      
      // Update room status
      await HostelRoom.update(
        { isOccupied: false },
        { where: { id: allocation.roomId } }
      );
      
      await LoggingService.logUserAction(
        'room_deallocated',
        userId,
        { 
          allocationId: allocation.id, 
          roomId: allocation.roomId,
          studentId: allocation.studentId
        }
      );
      
      return true;
    } catch (error) {
      await LoggingService.logError('hostel', 'deallocate_room', userId, error);
      throw error;
    }
  }
  
  static async getHostelOccupancy(hostelId) {
    const hostel = await Hostel.findByPk(hostelId, {
      include: [{
        model: HostelRoom,
        as: 'rooms',
        include: [{
          model: HostelAllocation,
          as: 'allocation',
          where: { status: 'active' },
          required: false,
          include: [{
            model: Student,
            as: 'student',
            include: [{
              model: User,
              as: 'user',
              attributes: ['name', 'email']
            }]
          }]
        }]
      }]
    });
    
    return hostel;
  }
}

module.exports = HostelService;
