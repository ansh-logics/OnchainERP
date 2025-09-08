const { validationResult, body } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};

// Transaction validation rules
const validateTransaction = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  
  body('amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('description')
    .notEmpty()
    .isLength({ max: 500 })
    .withMessage('Description is required and must be less than 500 characters'),
  
  body('paymentMethod')
    .isIn(['cash', 'card', 'bank_transfer', 'upi', 'cheque', 'dd', 'online'])
    .withMessage('Invalid payment method'),
  
  body('status')
    .optional()
    .isIn(['paid', 'pending', 'overdue', 'cancelled', 'refunded'])
    .withMessage('Invalid status'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('academicYear')
    .optional()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
  
  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  
  validate
];

module.exports = { validate, validateTransaction };
