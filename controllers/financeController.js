const Transaction = require('../models/Transaction');
const Bet = require('../models/Bet');
const { validationResult } = require('express-validator');
const moment = require('moment');
const { Parser } = require('json2csv');

// @desc    Get finance dashboard
// @route   GET /finance
const getFinanceDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Get financial summary
    const summary = await Transaction.getFinanceSummary(filter);

    // Get betting profit/loss
    const bettingStats = await Bet.getStats(filter);

    // Calculate net worth (Finance + Betting)
    const netWorth = summary.netBalance + bettingStats.totalProfitLoss;

    // Get recent transactions
    const recentTransactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Get category breakdown for charts
    const expenseBreakdown = await Transaction.getCategoryBreakdown('expense', filter);
    const incomeBreakdown = await Transaction.getCategoryBreakdown('income', filter);

    // Get monthly cash flow (last 12 months)
    const cashFlow = await Transaction.getMonthlyCashFlow(12);

    // Get recurring transactions
    const recurringTransactions = await Transaction.find({
      isRecurring: true,
      nextRecurrence: { $exists: true },
    }).lean();

    res.render('finance/dashboard', {
      title: 'Finance Dashboard',
      summary,
      bettingStats,
      netWorth,
      recentTransactions,
      expenseBreakdown: JSON.stringify(expenseBreakdown),
      incomeBreakdown: JSON.stringify(incomeBreakdown),
      cashFlow: JSON.stringify(cashFlow),
      recurringTransactions,
      filters: { startDate, endDate },
      moment,
    });
  } catch (error) {
    console.error('Finance Dashboard Error:', error);
    res.status(500).render('error', { message: 'Error loading finance dashboard' });
  }
};

// @desc    Get all transactions with filtering
// @route   GET /finance/transactions
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, startDate, endDate, search } = req.query;

    const filter = {};

    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalTransactions = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / parseInt(limit));

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const summary = await Transaction.getFinanceSummary(filter);

    // Get all categories for filters
    const categories = Transaction.getCategories();

    res.render('finance/transactions', {
      title: 'All Transactions',
      transactions,
      summary,
      currentPage: parseInt(page),
      totalPages,
      totalTransactions,
      filters: { type, category, startDate, endDate, search },
      categories,
      moment,
    });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).render('error', { message: 'Error loading transactions' });
  }
};

// @desc    Show add transaction form
// @route   GET /finance/add
const getAddTransactionForm = (req, res) => {
  const categories = Transaction.getCategories();
  res.render('finance/add', {
    title: 'Add Transaction',
    transaction: {},
    errors: [],
    categories,
    moment,
  });
};

// @desc    Create transaction
// @route   POST /finance/transactions
const createTransaction = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const categories = Transaction.getCategories();
    return res.render('finance/add', {
      title: 'Add Transaction',
      transaction: req.body,
      errors: errors.array(),
      categories,
      moment,
    });
  }

  try {
    const transactionData = {
      type: req.body.type,
      category: req.body.category,
      amount: parseFloat(req.body.amount),
      description: req.body.description,
      date: req.body.date,
      recurringType: req.body.recurringType || 'One-time',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    };

    await Transaction.create(transactionData);

    req.flash('success', '✅ Transaction added successfully!');
    res.redirect('/finance/transactions');
  } catch (error) {
    console.error('Create Transaction Error:', error);
    const categories = Transaction.getCategories();
    res.render('finance/add', {
      title: 'Add Transaction',
      transaction: req.body,
      errors: [{ msg: 'Error creating transaction. Please try again.' }],
      categories,
      moment,
    });
  }
};

// @desc    Update transaction
// @route   PUT /finance/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transactionData = {
      type: req.body.type,
      category: req.body.category,
      amount: parseFloat(req.body.amount),
      description: req.body.description,
      date: req.body.date,
      recurringType: req.body.recurringType || 'One-time',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    };

    await Transaction.findByIdAndUpdate(req.params.id, transactionData, { runValidators: true });

    req.flash('success', '✅ Transaction updated successfully!');
    res.redirect('/finance/transactions');
  } catch (error) {
    console.error('Update Transaction Error:', error);
    req.flash('error', 'Error updating transaction');
    res.redirect('/finance/transactions');
  }
};

// @desc    Delete transaction
// @route   DELETE /finance/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    req.flash('success', '🗑️ Transaction deleted successfully!');
    res.redirect('/finance/transactions');
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    req.flash('error', 'Error deleting transaction');
    res.redirect('/finance/transactions');
  }
};

// @desc    Export transactions to CSV
// @route   GET /finance/export/csv
const exportCSV = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ date: -1 }).lean();

    const fields = [
      { label: 'Date', value: (row) => moment(row.date).format('DD/MM/YYYY') },
      { label: 'Type', value: 'type' },
      { label: 'Category', value: 'category' },
      { label: 'Amount (₹)', value: 'amount' },
      { label: 'Description', value: 'description' },
      { label: 'Recurring', value: 'recurringType' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.attachment('finance_transactions.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV Export Error:', error);
    req.flash('error', 'Error exporting data');
    res.redirect('/finance/transactions');
  }
};

module.exports = {
  getFinanceDashboard,
  getTransactions,
  getAddTransactionForm,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCSV,
};