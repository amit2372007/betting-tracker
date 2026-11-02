/**
 * Finance Validation Middleware
 */

const { body } = require('express-validator');

const transactionValidationRules = [
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['income', 'expense', 'liability'])
    .withMessage('Invalid transaction type'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category too long'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description too long'),

  body('recurringType')
    .optional()
    .isIn(['One-time', 'Daily', 'Weekly', 'Monthly', 'Yearly'])
    .withMessage('Invalid recurring type'),
];

module.exports = { transactionValidationRules };
