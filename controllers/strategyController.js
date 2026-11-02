/**
 * Strategy Controller
 * Handles bankroll management and daily earning strategies
 */

const Strategy = require('../models/Strategy');
const Bet = require('../models/Bet');
const { validationResult } = require('express-validator');
const moment = require('moment');

// @desc    Get strategy dashboard
// @route   GET /strategy
const getStrategyDashboard = async (req, res) => {
  try {
    const strategy = await Strategy.getActiveStrategy();

    if (!strategy) {
      return res.render('strategy/create', {
        title: 'Create Strategy',
        strategy: {},
        errors: [],
      });
    }

    // Get today's bets
    const today = moment().startOf('day').toDate();
    const todayBets = await Bet.find({
      date: { $gte: today },
    }).lean();

    const todayPL = todayBets.reduce((sum, bet) => sum + bet.profitLoss, 0);

    // Get overall stats for recommendations
    const allBets = await Bet.find({}).lean();
    const stats = await Bet.getStats();

    // Calculate average odds
    const avgOdds = allBets.length > 0
      ? allBets.reduce((sum, bet) => sum + bet.odds, 0) / allBets.length
      : 2.0;

    // Get stake recommendation
    const recommendation = await strategy.getStakeRecommendation(
      parseFloat(stats.winRate) || 50,
      avgOdds,
      todayPL
    );

    // Check stop-loss and stop-profit
    const stopLossCheck = strategy.checkStopLoss();
    const stopProfitCheck = strategy.checkStopProfit();

    // Calculate daily projections for next 90 days
    const projections = [];
    let projectedBankroll = strategy.currentBankroll;
    for (let day = 0; day <= strategy.daysRemaining; day++) {
      projectedBankroll *= (1 + (strategy.dailyTargetPercentage / 100));
      projections.push({
        day: strategy.daysElapsed + day,
        amount: projectedBankroll,
      });
    }

    // Get last 90 days actual performance
    const ninetyDaysAgo = moment().subtract(90, 'days').toDate();
    const recentBets = await Bet.aggregate([
      { $match: { date: { $gte: ninetyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          dailyPL: { $sum: '$profitLoss' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.render('strategy/dashboard', {
      title: 'Strategy Dashboard',
      strategy,
      todayPL,
      recommendation,
      stopLossCheck,
      stopProfitCheck,
      stats,
      projections: JSON.stringify(projections),
      recentBets: JSON.stringify(recentBets),
      moment,
    });
  } catch (error) {
    console.error('Strategy Dashboard Error:', error);
    res.status(500).render('error', { message: 'Error loading strategy dashboard' });
  }
};

// @desc    Show create strategy form
// @route   GET /strategy/create
const getCreateStrategyForm = (req, res) => {
  res.render('strategy/create', {
    title: 'Create Strategy',
    strategy: {},
    errors: [],
  });
};

// @desc    Create new strategy
// @route   POST /strategy/create
const createStrategy = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('strategy/create', {
      title: 'Create Strategy',
      strategy: req.body,
      errors: errors.array(),
    });
  }

  try {
    // Deactivate any existing active strategy
    await Strategy.updateMany({ isActive: true }, { isActive: false });

    const initialBankroll = parseFloat(req.body.initialBankroll);
    const dailyTargetPercentage = parseFloat(req.body.dailyTargetPercentage);
    const riskLevel = req.body.riskLevel;

    // Calculate derived fields
    const dailyGrowthRate = 1 + (dailyTargetPercentage / 100);
    const ninetyDayTargetAmount = initialBankroll * Math.pow(dailyGrowthRate, 90);

    const stakePercentages = {
      'Conservative': 0.02,
      'Moderate': 0.05,
      'Aggressive': 0.10,
    };
    const dailyMaxStake = initialBankroll * stakePercentages[riskLevel];

    const strategyData = {
      initialBankroll: initialBankroll,
      currentBankroll: initialBankroll,
      dailyTargetPercentage: dailyTargetPercentage,
      stopLossPercentage: parseFloat(req.body.stopLossPercentage),
      stopProfitPercentage: parseFloat(req.body.stopProfitPercentage),
      riskLevel: riskLevel,
      strategyStartDate: new Date(),
      isActive: true,
      dailyRecords: [],
      highWaterMark: initialBankroll,
      ninetyDayTargetAmount: ninetyDayTargetAmount,
      dailyMaxStake: dailyMaxStake,
    };

    await Strategy.create(strategyData);

    req.flash('success', '🎯 Strategy created successfully! Your 90-day journey begins now.');
    res.redirect('/strategy');
  } catch (error) {
    console.error('Create Strategy Error:', error);
    res.render('strategy/create', {
      title: 'Create Strategy',
      strategy: req.body,
      errors: [{ msg: 'Error creating strategy. Please try again.' }],
    });
  }
};

// @desc    Update strategy settings
// @route   PUT /strategy/:id
const updateStrategy = async (req, res) => {
  try {
    const updates = {
      dailyTargetPercentage: parseFloat(req.body.dailyTargetPercentage),
      stopLossPercentage: parseFloat(req.body.stopLossPercentage),
      stopProfitPercentage: parseFloat(req.body.stopProfitPercentage),
      riskLevel: req.body.riskLevel,
    };

    await Strategy.findByIdAndUpdate(req.params.id, updates, { runValidators: true });

    req.flash('success', '✅ Strategy settings updated successfully!');
    res.redirect('/strategy');
  } catch (error) {
    console.error('Update Strategy Error:', error);
    req.flash('error', 'Error updating strategy');
    res.redirect('/strategy');
  }
};

// @desc    Update daily bankroll after bet
// @route   Internal function
const updateDailyBankroll = async (strategy, betProfitLoss) => {
  try {
    strategy.currentBankroll += betProfitLoss;

    const today = moment().startOf('day').toDate();
    let todayRecord = strategy.dailyRecords.find(r =>
      moment(r.date).isSame(today, 'day')
    );

    if (!todayRecord) {
      todayRecord = {
        date: today,
        profitLoss: betProfitLoss,
        bankrollSnapshot: strategy.currentBankroll,
        stopTriggered: 'none',
        betCount: 1,
        consecutiveLosses: betProfitLoss < 0 ? 1 : 0,
      };
      strategy.dailyRecords.push(todayRecord);
    } else {
      todayRecord.profitLoss += betProfitLoss;
      todayRecord.bankrollSnapshot = strategy.currentBankroll;
      todayRecord.betCount += 1;

      if (betProfitLoss < 0) {
        todayRecord.consecutiveLosses += 1;
      } else {
        todayRecord.consecutiveLosses = 0;
      }
    }

    // Check for stop triggers
    const stopLossCheck = strategy.checkStopLoss();
    const stopProfitCheck = strategy.checkStopProfit();

    if (stopLossCheck.triggered) {
      todayRecord.stopTriggered = 'stop-loss';
    } else if (stopProfitCheck.triggered) {
      todayRecord.stopTriggered = 'stop-profit';
    }

    await strategy.save();
    return strategy;
  } catch (error) {
    console.error('Update Bankroll Error:', error);
    throw error;
  }
};

// @desc    Get performance analysis
// @route   GET /strategy/analysis
const getAnalysis = async (req, res) => {
  try {
    const strategy = await Strategy.getActiveStrategy();
    if (!strategy) {
      req.flash('error', 'No active strategy found');
      return res.redirect('/strategy/create');
    }

    const stats = await Bet.getStats();

    // Calculate weekly performance
    const weeklyData = [];
    for (let week = 0; week < 12; week++) {
      const weekStart = moment().subtract(week, 'weeks').startOf('week').toDate();
      const weekEnd = moment().subtract(week, 'weeks').endOf('week').toDate();

      const weekBets = await Bet.find({
        date: { $gte: weekStart, $lte: weekEnd },
      });

      const weekPL = weekBets.reduce((sum, bet) => sum + bet.profitLoss, 0);
      weeklyData.unshift({
        week: `Week ${12 - week}`,
        profitLoss: weekPL,
        betCount: weekBets.length,
      });
    }

    res.render('strategy/analysis', {
      title: 'Performance Analysis',
      strategy,
      stats,
      weeklyData: JSON.stringify(weeklyData),
      moment,
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).render('error', { message: 'Error loading analysis' });
  }
};

module.exports = {
  getStrategyDashboard,
  getCreateStrategyForm,
  createStrategy,
  updateStrategy,
  updateDailyBankroll,
  getAnalysis,
};
