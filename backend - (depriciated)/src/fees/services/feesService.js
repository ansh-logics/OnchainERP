const { Transaction, Student, User } = require('../../shared/db/models');
const LoggingService = require('../../shared/services/LoggingService');

class FeesService {
  static async createTransaction(transactionData, userId) {
    try {
      const transaction = await Transaction.create(transactionData);
      
      await LoggingService.logUserAction(
        'transaction_created',
        userId,
        { 
          transactionId: transaction.id, 
          amount: transaction.amount,
          type: transaction.type 
        }
      );
      
      return transaction;
    } catch (error) {
      await LoggingService.logError('fees', 'create_transaction', userId, error);
      throw error;
    }
  }
  
  static async getTransactions(filters = {}) {
    const { 
      studentId, 
      type, 
      status, 
      startDate, 
      endDate, 
      limit = 100, 
      offset = 0 
    } = filters;
    
    const whereClause = {};
    if (studentId) whereClause.studentId = studentId;
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }
    
    return await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          include: [{
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }
  
  static async getStudentFees(studentId) {
    return await Transaction.findAll({
      where: { studentId },
      order: [['createdAt', 'DESC']]
    });
  }
  
  static async processPayment(paymentData, userId) {
    try {
      const transaction = await Transaction.create({
        ...paymentData,
        status: 'completed',
        processedBy: userId,
        processedAt: new Date()
      });
      
      await LoggingService.logUserAction(
        'payment_processed',
        userId,
        { 
          transactionId: transaction.id, 
          amount: transaction.amount,
          studentId: transaction.studentId
        }
      );
      
      return transaction;
    } catch (error) {
      await LoggingService.logError('fees', 'process_payment', userId, error);
      throw error;
    }
  }
  
  static async getFinancialSummary(collegeId, filters = {}) {
    const { startDate, endDate } = filters;
    
    const whereClause = { status: 'completed' };
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }
    
    const summary = await Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount']
      ],
      where: whereClause,
      group: ['type'],
      raw: true
    });
    
    return summary;
  }
}

module.exports = FeesService;
