/**
 * Validation Middleware
 * Input validation rules for betting entries
 */

const { body } = require('express-validator');

const betValidationRules = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('betType')
    .notEmpty()
    .withMessage('Bet type is required')
    .isIn(['Sports', 'Casino', 'Poker', 'Horse Racing', 'Football', 'Basketball', 'Tennis', 'Cricket', 'Boxing', 'UFC/MMA', 'eSports', 'Other'])
    .withMessage('Invalid bet type'),

  body('event')
    .notEmpty()
    .withMessage('Event name is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Event name too long'),

  body('platform')
    .notEmpty()
    .withMessage('Platform is required'),

  body('odds')
    .notEmpty()
    .withMessage('Odds are required')
    .isFloat({ min: 1 })
    .withMessage('Odds must be at least 1'),

  body('stake')
    .notEmpty()
    .withMessage('Stake amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Stake must be greater than 0'),

  body('result')
    .notEmpty()
    .withMessage('Result is required')
    .isIn(['Win', 'Loss', 'Void', 'Pending', 'Half Win', 'Half Loss'])
    .withMessage('Invalid result'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes too long'),
];

module.exports = { betValidationRules };
