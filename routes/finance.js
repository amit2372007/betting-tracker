
const express = require('express');
const router = express.Router();
const {
  getFinanceDashboard,
  getTransactions,
  getAddTransactionForm,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCSV,
} = require('../controllers/financeController');
const { transactionValidationRules } = require('../middleware/financeValidation');

// Export route (must be before /:id routes)
router.get('/export/csv', exportCSV);

// Main routes
router.get('/', getFinanceDashboard);
router.get('/transactions', getTransactions);
router.get('/add', getAddTransactionForm);
router.post('/transactions', transactionValidationRules, createTransaction);
router.put('/transactions/:id', transactionValidationRules, updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

module.exports = router;