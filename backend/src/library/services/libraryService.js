const { LibraryBook, LibraryIssue } = require('../models');

class LibraryService {
  // Library Book services
  async addBook(bookData) {
    return await LibraryBook.create(bookData);
  }

  async getBookById(id) {
    return await LibraryBook.findByPk(id, {
      include: ['college', 'issues']
    });
  }

  async getBooksByCollege(collegeId) {
    return await LibraryBook.findAll({
      where: { collegeId },
      include: ['college'],
      order: [['title', 'ASC']]
    });
  }

  async searchBooks(collegeId, searchTerm) {
    const { Op } = require('sequelize');
    return await LibraryBook.findAll({
      where: {
        collegeId,
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { author: { [Op.iLike]: `%${searchTerm}%` } },
          { isbn: { [Op.iLike]: `%${searchTerm}%` } },
          { subject: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      include: ['college'],
      order: [['title', 'ASC']]
    });
  }

  async updateBookQuantity(bookId, quantity) {
    return await LibraryBook.update(
      { totalCopies: quantity },
      { where: { id: bookId }, returning: true }
    );
  }

  // Library Issue services
  async issueBook(issueData) {
    // Check if book is available
    const book = await LibraryBook.findByPk(issueData.bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    const issuedCopies = await LibraryIssue.count({
      where: { 
        bookId: issueData.bookId,
        status: 'ISSUED'
      }
    });

    if (issuedCopies >= book.totalCopies) {
      throw new Error('Book not available for issue');
    }

    return await LibraryIssue.create({
      ...issueData,
      issueDate: new Date(),
      status: 'ISSUED'
    });
  }

  async returnBook(issueId, returnedTo) {
    return await LibraryIssue.update(
      { 
        returnDate: new Date(),
        returnedTo,
        status: 'RETURNED'
      },
      { 
        where: { id: issueId },
        returning: true 
      }
    );
  }

  async getIssueById(id) {
    return await LibraryIssue.findByPk(id, {
      include: ['book', 'student', 'issuer', 'returner']
    });
  }

  async getIssuesByStudent(studentId) {
    return await LibraryIssue.findAll({
      where: { studentId },
      include: ['book', 'student', 'issuer', 'returner'],
      order: [['issueDate', 'DESC']]
    });
  }

  async getActiveIssues(collegeId = null) {
    const whereClause = { status: 'ISSUED' };
    
    return await LibraryIssue.findAll({
      where: whereClause,
      include: [
        {
          model: LibraryBook,
          as: 'book',
          where: collegeId ? { collegeId } : {},
          include: ['college']
        },
        'student',
        'issuer'
      ],
      order: [['issueDate', 'DESC']]
    });
  }

  async getOverdueBooks(collegeId = null) {
    const { Op } = require('sequelize');
    const whereClause = { 
      status: 'ISSUED',
      dueDate: { [Op.lt]: new Date() }
    };
    
    return await LibraryIssue.findAll({
      where: whereClause,
      include: [
        {
          model: LibraryBook,
          as: 'book',
          where: collegeId ? { collegeId } : {},
          include: ['college']
        },
        'student',
        'issuer'
      ],
      order: [['dueDate', 'ASC']]
    });
  }
}

module.exports = new LibraryService();
