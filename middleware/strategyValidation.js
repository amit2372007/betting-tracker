/**
 * Strategy Validation Middleware
 */

const { body } = require('express-validator');

const strategyValidationRules = [
  body('initialBankroll')
    .notEmpty()
    .withMessage('Initial bankroll is required')
    .isFloat({ min: 100 })
    .withMessage('Initial bankroll must be at least ₹100'),

  body('dailyTargetPercentage')
    .notEmpty()
    .withMessage('Daily target percentage is required')
    .isFloat({ min: 1, max: 8 })
    .withMessage('Daily target must be between 1% and 8%'),

  body('stopLossPercentage')
    .notEmpty()
    .withMessage('Stop loss percentage is required')
    .isFloat({ min: 1, max: 20 })
    .withMessage('Stop loss must be between 1% and 20%'),

  body('stopProfitPercentage')
    .notEmpty()
    .withMessage('Stop profit percentage is required')
    .isFloat({ min: 1, max: 15 })
    .withMessage('Stop profit must be between 1% and 15%'),

  body('riskLevel')
    .notEmpty()
    .withMessage('Risk level is required')
    .isIn(['Conservative', 'Moderate', 'Aggressive'])
    .withMessage('Invalid risk level'),
];

module.exports = { strategyValidationRules };
