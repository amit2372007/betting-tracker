/**
 * Transaction Model
 * Personal finance tracking - income, expenses, liabilities
 */

const mongoose = require('mongoose');
const moment = require('moment');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['income', 'expense', 'liability'],
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    recurringType: {
      type: String,
      enum: ['One-time', 'Daily', 'Weekly', 'Monthly', 'Yearly'],
      default: 'One-time',
    },
    nextRecurrence: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware
transactionSchema.pre('save', function (next) {
  // Set isRecurring flag
  this.isRecurring = this.recurringType !== 'One-time';

  // Calculate next recurrence date
  if (this.isRecurring && !this.nextRecurrence) {
    const recurrenceMap = {
      'Daily': { days: 1 },
      'Weekly': { weeks: 1 },
      'Monthly': { months: 1 },
      'Yearly': { years: 1 },
    };
    this.nextRecurrence = moment(this.date).add(recurrenceMap[this.recurringType]).toDate();
  }

  next();
});

// Virtual: Formatted date
transactionSchema.virtual('formattedDate').get(function () {
  return moment(this.date).format('DD MMM YYYY');
});

// Virtual: Amount display with sign
transactionSchema.virtual('displayAmount').get(function () {
  const sign = this.type === 'income' ? '+' : '-';
  return `${sign}₹${this.amount.toFixed(2)}`;
});

// Static method: Get financial summary
transactionSchema.statics.getFinanceSummary = async function (filter = {}) {
  const transactions = await this.find(filter);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const liabilities = transactions
    .filter(t => t.type === 'liability')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = income - expenses - liabilities;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    totalLiabilities: liabilities,
    netBalance: netBalance,
    transactionCount: transactions.length,
  };
};

// Static method: Get category breakdown
transactionSchema.statics.getCategoryBreakdown = async function (type, filter = {}) {
  const matchFilter = { ...filter, type };

  const breakdown = await this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return breakdown.map(b => ({
    category: b._id,
    total: b.total,
    count: b.count,
  }));
};

// Static method: Get monthly cash flow
transactionSchema.statics.getMonthlyCashFlow = async function (months = 12) {
  const startDate = moment().subtract(months, 'months').startOf('month').toDate();

  const cashFlow = await this.aggregate([
    { $match: { date: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Format for charts
  const monthlyData = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = moment().subtract(i, 'months');
    const year = date.year();
    const month = date.month() + 1;

    const income = cashFlow.find(
      cf => cf._id.year === year && cf._id.month === month && cf._id.type === 'income'
    )?.total || 0;

    const expense = cashFlow.find(
      cf => cf._id.year === year && cf._id.month === month && cf._id.type === 'expense'
    )?.total || 0;

    const liability = cashFlow.find(
      cf => cf._id.year === year && cf._id.month === month && cf._id.type === 'liability'
    )?.total || 0;

    monthlyData.push({
      month: date.format('MMM YY'),
      income,
      expense,
      liability,
      net: income - expense - liability,
    });
  }

  return monthlyData;
};

// Static method: Predefined categories
transactionSchema.statics.getCategories = function () {
  return {
    income: [
      'Salary',
      'Freelance',
      'Business',
      'Investment Returns',
      'Rental Income',
      'Gift',
      'Refund',
      'Other Income',
    ],
    expense: [
      'Rent',
      'Utilities',
      'Groceries',
      'Food & Dining',
      'Transportation',
      'Healthcare',
      'Entertainment',
      'Shopping',
      'Education',
      'Insurance',
      'Subscriptions',
      'Other Expense',
    ],
    liability: [
      'Loan Payment',
      'Credit Card Bill',
      'Mortgage',
      'Car Loan',
      'Student Loan',
      'Medical Bill',
      'Tax Payment',
      'Other Liability',
    ],
  };
};

transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

// Indexes
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ isRecurring: 1, nextRecurrence: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
