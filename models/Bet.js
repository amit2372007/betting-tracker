/**
 * Bet Model
 * Defines the schema for individual betting entries
 */

const mongoose = require('mongoose');
const moment = require('moment');

const betSchema = new mongoose.Schema(
  {
    // Core bet information
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    betType: {
      type: String,
      required: [true, 'Bet type is required'],
      enum: [
        'Sports',
        'Casino',
        'Poker',
        'Horse Racing',
        'Football',
        'Basketball',
        'Tennis',
        'Cricket',
        'Boxing',
        'UFC/MMA',
        'eSports',
        'Other',
      ],
      trim: true,
    },
    event: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: [200, 'Event name cannot exceed 200 characters'],
    },
    selection: {
      type: String,
      trim: true,
      maxlength: [200, 'Selection cannot exceed 200 characters'],
    },
    platform: {
      type: String,
      required: [true, 'Betting platform is required'],
      trim: true,
      enum: [
        'Betway',
        'Bet365',
        'Dream11',
        'MPL',
        'My11Circle',
        'FanCode',
        'Parimatch',
        'RummyCircle',
        'Other',
      ],
    },
    odds: {
      type: Number,
      required: [true, 'Odds are required'],
      min: [1, 'Odds must be at least 1'],
    },
    stake: {
      type: Number,
      required: [true, 'Stake amount is required'],
      min: [0.01, 'Stake must be greater than 0'],
    },
    result: {
      type: String,
      required: [true, 'Result is required'],
      enum: ['Win', 'Loss', 'Void', 'Pending', 'Half Win', 'Half Loss'],
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted date
betSchema.virtual('formattedDate').get(function () {
  return moment(this.date).format('DD MMM YYYY');
});

// Pre-save middleware to calculate profit/loss
betSchema.pre('save', function (next) {
  if (this.result === 'Win') {
    this.profitLoss = this.stake * (this.odds - 1);
  } else if (this.result === 'Loss') {
    this.profitLoss = -this.stake;
  } else if (this.result === 'Half Win') {
    this.profitLoss = (this.stake * (this.odds - 1)) / 2;
  } else if (this.result === 'Half Loss') {
    this.profitLoss = -this.stake / 2;
  } else {
    this.profitLoss = 0;
  }
  next();
});

// Static method to get all stats
betSchema.statics.getStats = async function (filter = {}) {
  const bets = await this.find(filter);

  const stats = {
    totalBets: bets.length,
    wins: bets.filter((b) => b.result === 'Win' || b.result === 'Half Win').length,
    losses: bets.filter((b) => b.result === 'Loss' || b.result === 'Half Loss').length,
    voids: bets.filter((b) => b.result === 'Void').length,
    pending: bets.filter((b) => b.result === 'Pending').length,
    totalStaked: bets.reduce((sum, b) => sum + b.stake, 0),
    totalProfitLoss: bets.reduce((sum, b) => sum + b.profitLoss, 0),
    biggestWin: Math.max(...bets.filter((b) => b.profitLoss > 0).map((b) => b.profitLoss), 0),
    biggestLoss: Math.min(...bets.filter((b) => b.profitLoss < 0).map((b) => b.profitLoss), 0),
    averageStake: 0,
    winRate: 0,
    roi: 0,
  };

  const settledBets = bets.filter((b) => b.result !== 'Pending' && b.result !== 'Void');
  const wonBets = settledBets.filter((b) => b.result === 'Win' || b.result === 'Half Win');

  if (settledBets.length > 0) {
    stats.winRate = ((wonBets.length / settledBets.length) * 100).toFixed(1);
  }

  if (bets.length > 0) {
    stats.averageStake = (stats.totalStaked / bets.length).toFixed(2);
  }

  if (stats.totalStaked > 0) {
    stats.roi = ((stats.totalProfitLoss / stats.totalStaked) * 100).toFixed(1);
  }

  return stats;
};

// Ensure virtuals are included in toJSON
betSchema.set('toJSON', { virtuals: true });
betSchema.set('toObject', { virtuals: true });

// Indexes for better query performance
betSchema.index({ date: -1 });
betSchema.index({ betType: 1 });
betSchema.index({ platform: 1 });
betSchema.index({ result: 1 });

module.exports = mongoose.model('Bet', betSchema);
