/**
 * Dashboard Controller
 * Handles main statistics and overview
 */

const Bet = require('../models/Bet');
const moment = require('moment');

// @desc    Get dashboard with statistics
// @route   GET /
const getDashboard = async (req, res) => {
  try {
    // Date range filter
    const { startDate, endDate, platform, betType } = req.query;
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
    if (platform && platform !== 'all') filter.platform = platform;
    if (betType && betType !== 'all') filter.betType = betType;

    // Get overall stats
    const stats = await Bet.getStats(filter);

    // Recent bets
    const recentBets = await Bet.find(filter)
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Monthly profit/loss for line chart (last 12 months)
    const twelveMonthsAgo = moment().subtract(12, 'months').startOf('month').toDate();
    const monthlyData = await Bet.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo },
          result: { $nin: ['Pending', 'Void'] },
          ...filter,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalPL: { $sum: '$profitLoss' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly data for chart
    const months = [];
    const monthlyPL = [];
    const cumulativePL = [];
    let cumulative = 0;

    for (let i = 11; i >= 0; i--) {
      const m = moment().subtract(i, 'months');
      const found = monthlyData.find(
        (d) => d._id.year === m.year() && d._id.month === m.month() + 1
      );
      months.push(m.format('MMM YY'));
      const pl = found ? found.totalPL : 0;
      monthlyPL.push(pl.toFixed(2));
      cumulative += pl;
      cumulativePL.push(cumulative.toFixed(2));
    }

    // Bet type distribution for pie chart
    const betTypeData = await Bet.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$betType',
          count: { $sum: 1 },
          totalPL: { $sum: '$profitLoss' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Platform distribution
    const platformData = await Bet.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          totalPL: { $sum: '$profitLoss' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Win/Loss distribution
    const resultData = await Bet.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$result',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get unique platforms and bet types for filter dropdowns
    const platforms = await Bet.distinct('platform');
    const betTypes = await Bet.distinct('betType');

    res.render('dashboard', {
      title: 'Dashboard',
      stats,
      recentBets,
      chartData: {
        months: JSON.stringify(months),
        monthlyPL: JSON.stringify(monthlyPL),
        cumulativePL: JSON.stringify(cumulativePL),
        betTypeLabels: JSON.stringify(betTypeData.map((d) => d._id)),
        betTypeCounts: JSON.stringify(betTypeData.map((d) => d.count)),
        betTypePL: JSON.stringify(betTypeData.map((d) => d.totalPL.toFixed(2))),
        platformLabels: JSON.stringify(platformData.map((d) => d._id)),
        platformCounts: JSON.stringify(platformData.map((d) => d.count)),
        resultLabels: JSON.stringify(resultData.map((d) => d._id)),
        resultCounts: JSON.stringify(resultData.map((d) => d.count)),
      },
      filters: { startDate, endDate, platform, betType },
      platforms,
      betTypes,
      moment,
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).render('error', { message: 'Error loading dashboard' });
  }
};

module.exports = { getDashboard };
