/**
 * Strategy Model
 * Bankroll management and daily earning strategy tracking
 */

const mongoose = require('mongoose');
const moment = require('moment');

const dailyRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  profitLoss: { type: Number, default: 0 },
  bankrollSnapshot: { type: Number, required: true },
  stopTriggered: {
    type: String,
    enum: ['none', 'stop-loss', 'stop-profit'],
    default: 'none',
  },
  betCount: { type: Number, default: 0 },
  consecutiveLosses: { type: Number, default: 0 },
}, { _id: false });

const strategySchema = new mongoose.Schema(
  {
    initialBankroll: {
      type: Number,
      required: [true, 'Initial bankroll is required'],
      min: [100, 'Initial bankroll must be at least ₹100'],
    },
    currentBankroll: {
      type: Number,
      required: true,
    },
    dailyTargetPercentage: {
      type: Number,
      required: [true, 'Daily target percentage is required'],
      min: [1, 'Daily target must be at least 1%'],
      max: [8, 'Daily target cannot exceed 8%'],
      default: 3,
    },
    stopLossPercentage: {
      type: Number,
      required: true,
      min: [1, 'Stop loss must be at least 1%'],
      max: [20, 'Stop loss cannot exceed 20%'],
      default: 5,
    },
    stopProfitPercentage: {
      type: Number,
      required: true,
      min: [1, 'Stop profit must be at least 1%'],
      max: [15, 'Stop profit cannot exceed 15%'],
      default: 3,
    },
    ninetyDayTargetAmount: {
      type: Number,
      default: 0,
    },
    dailyMaxStake: {
      type: Number,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ['Conservative', 'Moderate', 'Aggressive'],
      default: 'Moderate',
    },
    strategyStartDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dailyRecords: [dailyRecordSchema],
    consecutiveLosses: {
      type: Number,
      default: 0,
    },
    highWaterMark: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate derived fields
strategySchema.pre('save', function (next) {
  // Calculate 90-day target based on daily target percentage
  const dailyGrowthRate = 1 + (this.dailyTargetPercentage / 100);
  this.ninetyDayTargetAmount = this.initialBankroll * Math.pow(dailyGrowthRate, 90);

  // Calculate daily max stake based on risk level and bankroll
  const stakePercentages = {
    'Conservative': 0.02,  // 2% of bankroll
    'Moderate': 0.05,      // 5% of bankroll
    'Aggressive': 0.10,    // 10% of bankroll
  };
  this.dailyMaxStake = this.currentBankroll * stakePercentages[this.riskLevel];

  // Set high water mark
  if (this.currentBankroll > this.highWaterMark) {
    this.highWaterMark = this.currentBankroll;
  }

  next();
});

// Instance method: Get today's performance
strategySchema.methods.getTodayRecord = function () {
  const today = moment().startOf('day').toDate();
  return this.dailyRecords.find(r =>
    moment(r.date).isSame(today, 'day')
  ) || null;
};

// Instance method: Check if stop-loss triggered today
strategySchema.methods.checkStopLoss = function () {
  const todayRecord = this.getTodayRecord();
  if (!todayRecord) return { triggered: false };

  const stopLossAmount = this.currentBankroll * (this.stopLossPercentage / 100);
  const dailyLoss = Math.abs(Math.min(todayRecord.profitLoss, 0));

  if (dailyLoss >= stopLossAmount) {
    return {
      triggered: true,
      currentLoss: dailyLoss,
      threshold: stopLossAmount,
      message: `🛑 STOP-LOSS TRIGGERED! Daily loss (₹${dailyLoss.toFixed(2)}) reached ${this.stopLossPercentage}% limit. Stop betting for today.`,
    };
  }

  return {
    triggered: false,
    currentLoss: dailyLoss,
    threshold: stopLossAmount,
    remaining: stopLossAmount - dailyLoss,
  };
};

// Instance method: Check if stop-profit triggered today
strategySchema.methods.checkStopProfit = function () {
  const todayRecord = this.getTodayRecord();
  if (!todayRecord) return { triggered: false };

  const stopProfitAmount = this.currentBankroll * (this.stopProfitPercentage / 100);
  const dailyProfit = Math.max(todayRecord.profitLoss, 0);

  if (dailyProfit >= stopProfitAmount) {
    return {
      triggered: true,
      currentProfit: dailyProfit,
      threshold: stopProfitAmount,
      message: `🎯 STOP-PROFIT REACHED! Daily profit (₹${dailyProfit.toFixed(2)}) hit ${this.stopProfitPercentage}% target. Lock in gains!`,
    };
  }

  return {
    triggered: false,
    currentProfit: dailyProfit,
    threshold: stopProfitAmount,
    remaining: stopProfitAmount - dailyProfit,
  };
};

// Instance method: Calculate Kelly Criterion stake
strategySchema.methods.calculateKellyCriterion = async function (winRate, averageOdds) {
  // Kelly Criterion: f = (bp - q) / b
  // f = fraction of bankroll to bet
  // b = odds - 1 (decimal odds)
  // p = probability of winning (win rate)
  // q = probability of losing (1 - p)

  const p = winRate / 100;
  const q = 1 - p;
  const b = averageOdds - 1;

  const kellyPercentage = ((b * p) - q) / b;

  // Use fractional Kelly (25% of full Kelly for safety)
  const fractionalKelly = Math.max(0, kellyPercentage * 0.25);

  return {
    fullKelly: kellyPercentage * 100,
    recommendedKelly: fractionalKelly * 100,
    recommendedStake: this.currentBankroll * fractionalKelly,
  };
};

// Instance method: Get stake recommendation
strategySchema.methods.getStakeRecommendation = async function (winRate, averageOdds, currentDayPL) {
  const kelly = await this.calculateKellyCriterion(winRate, averageOdds);
  const todayRecord = this.getTodayRecord();
  const consecutiveLosses = todayRecord?.consecutiveLosses || 0;

  let recommendedStake = kelly.recommendedStake;
  let reasoning = [];

  // Adjust based on win rate
  if (winRate < 50) {
    recommendedStake *= 0.5;
    reasoning.push('⚠️ Win rate below 50% - reduced stake by 50%');
  }

  // Adjust based on consecutive losses
  if (consecutiveLosses >= 3) {
    recommendedStake *= 0.3;
    reasoning.push(`🔴 ${consecutiveLosses} consecutive losses - stake reduced to 30%`);
  } else if (consecutiveLosses >= 2) {
    recommendedStake *= 0.6;
    reasoning.push('⚠️ 2 consecutive losses - stake reduced to 60%');
  }

  // Check today's performance
  const stopLossCheck = this.checkStopLoss();
  const stopProfitCheck = this.checkStopProfit();

  if (stopLossCheck.triggered) {
    return {
      recommended: 0,
      min: 0,
      max: 0,
      message: stopLossCheck.message,
      shouldStop: true,
      reasoning: ['🛑 Stop-loss triggered - NO MORE BETS TODAY'],
    };
  }

  if (stopProfitCheck.triggered) {
    return {
      recommended: 0,
      min: 0,
      max: 0,
      message: stopProfitCheck.message,
      shouldStop: true,
      reasoning: ['🎯 Stop-profit reached - Consider locking in profits'],
    };
  }

  // Cap at daily max stake
  recommendedStake = Math.min(recommendedStake, this.dailyMaxStake);

  return {
    recommended: Math.round(recommendedStake),
    min: Math.round(recommendedStake * 0.5),
    max: Math.round(recommendedStake * 1.5),
    message: `Based on ${winRate.toFixed(1)}% win rate and ₹${this.currentBankroll.toFixed(0)} bankroll`,
    shouldStop: false,
    reasoning: reasoning.length > 0 ? reasoning : ['✅ Normal conditions - follow Kelly Criterion'],
    kellyInfo: kelly,
  };
};

// Static method: Get active strategy for user
strategySchema.statics.getActiveStrategy = async function () {
  return this.findOne({ isActive: true }).sort({ createdAt: -1 });
};

// Virtual: Days elapsed
strategySchema.virtual('daysElapsed').get(function () {
  return moment().diff(moment(this.strategyStartDate), 'days');
});

// Virtual: Days remaining
strategySchema.virtual('daysRemaining').get(function () {
  return Math.max(0, 90 - this.daysElapsed);
});

// Virtual: Current ROI
strategySchema.virtual('currentROI').get(function () {
  return ((this.currentBankroll - this.initialBankroll) / this.initialBankroll) * 100;
});

// Virtual: Target ROI (90 days)
strategySchema.virtual('targetROI').get(function () {
  return ((this.ninetyDayTargetAmount - this.initialBankroll) / this.initialBankroll) * 100;
});

// Virtual: On track percentage
strategySchema.virtual('onTrackPercentage').get(function () {
  const expectedBankroll = this.initialBankroll * Math.pow(
    1 + (this.dailyTargetPercentage / 100),
    this.daysElapsed
  );
  return (this.currentBankroll / expectedBankroll) * 100;
});

strategySchema.set('toJSON', { virtuals: true });
strategySchema.set('toObject', { virtuals: true });

// Indexes
strategySchema.index({ isActive: 1, createdAt: -1 });
strategySchema.index({ 'dailyRecords.date': 1 });

module.exports = mongoose.model('Strategy', strategySchema);
