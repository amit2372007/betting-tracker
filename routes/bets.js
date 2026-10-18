/**
 * Bet Routes
 * All CRUD routes for betting entries
 */

const express = require('express');
const router = express.Router();
const {
  getBets,
  getNewBetForm,
  createBet,
  getBet,
  getEditBetForm,
  updateBet,
  deleteBet,
  exportCSV,
  exportPDF,
} = require('../controllers/betController');
const { betValidationRules } = require('../middleware/validation');

// Export routes (must be before /:id routes)
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);

// CRUD routes
router.get('/', getBets);
router.get('/new', getNewBetForm);
router.post('/', betValidationRules, createBet);
router.get('/:id', getBet);
router.get('/:id/edit', getEditBetForm);
router.put('/:id', betValidationRules, updateBet);
router.delete('/:id', deleteBet);

module.exports = router;
