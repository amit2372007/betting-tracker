/**
 * Strategy Routes
 */

const express = require('express');
const router = express.Router();
const {
  getStrategyDashboard,
  getCreateStrategyForm,
  createStrategy,
  updateStrategy,
  getAnalysis,
} = require('../controllers/strategyController');
const { strategyValidationRules } = require('../middleware/strategyValidation');

router.get('/', getStrategyDashboard);
router.get('/create', getCreateStrategyForm);
router.post('/create', strategyValidationRules, createStrategy);
router.put('/:id', strategyValidationRules, updateStrategy);
router.get('/analysis', getAnalysis);

module.exports = router;
