/**
 * Bet Controller
 * Handles all CRUD operations for betting entries
 */

const Bet = require('../models/Bet');
const { validationResult } = require('express-validator');
const moment = require('moment');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// @desc    Get all bets with filtering/pagination
// @route   GET /bets
const getBets = async (req, res) => {
  try {
    const { page = 1, limit = 15, startDate, endDate, platform, betType, result, search } = req.query;

    const filter = {};

    // Date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Platform filter
    if (platform && platform !== 'all') filter.platform = platform;

    // Bet type filter
    if (betType && betType !== 'all') filter.betType = betType;

    // Result filter
    if (result && result !== 'all') filter.result = result;

    // Text search on event or notes
    if (search) {
      filter.$or = [
        { event: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { selection: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalBets = await Bet.countDocuments(filter);
    const totalPages = Math.ceil(totalBets / parseInt(limit));

    const bets = await Bet.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Stats for filtered results
    const stats = await Bet.getStats(filter);

    // Get unique platforms and bet types for filter dropdowns
    const platforms = await Bet.distinct('platform');
    const betTypes = await Bet.distinct('betType');

    res.render('bets/index', {
      title: 'All Bets',
      bets,
      stats,
      currentPage: parseInt(page),
      totalPages,
      totalBets,
      filters: { startDate, endDate, platform, betType, result, search },
      platforms,
      betTypes,
      moment,
    });
  } catch (error) {
    console.error('Get Bets Error:', error);
    res.status(500).render('error', { message: 'Error loading bets' });
  }
};

// @desc    Show form to create new bet
// @route   GET /bets/new
const getNewBetForm = (req, res) => {
  res.render('bets/new', {
    title: 'Add New Bet',
    bet: {},
    errors: [],
    moment,
  });
};

// @desc    Create new bet
// @route   POST /bets
const createBet = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('bets/new', {
      title: 'Add New Bet',
      bet: req.body,
      errors: errors.array(),
      moment,
    });
  }

  try {
    const betData = {
      date: req.body.date,
      betType: req.body.betType,
      event: req.body.event,
      selection: req.body.selection,
      platform: req.body.platform,
      odds: parseFloat(req.body.odds),
      stake: parseFloat(req.body.stake),
      result: req.body.result,
      notes: req.body.notes,
      tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],
    };

    await Bet.create(betData);

    req.flash('success', '✅ Bet added successfully!');
    res.redirect('/bets');
  } catch (error) {
    console.error('Create Bet Error:', error);
    res.render('bets/new', {
      title: 'Add New Bet',
      bet: req.body,
      errors: [{ msg: 'Error creating bet. Please try again.' }],
      moment,
    });
  }
};

// @desc    Show single bet details
// @route   GET /bets/:id
const getBet = async (req, res) => {
  try {
    const bet = await Bet.findById(req.params.id).lean();

    if (!bet) {
      req.flash('error', 'Bet not found');
      return res.redirect('/bets');
    }

    bet.formattedDate = moment(bet.date).format('DD MMM YYYY');

    res.render('bets/show', {
      title: 'Bet Details',
      bet,
      moment,
    });
  } catch (error) {
    console.error('Get Bet Error:', error);
    res.redirect('/bets');
  }
};

// @desc    Show edit form
// @route   GET /bets/:id/edit
const getEditBetForm = async (req, res) => {
  try {
    const bet = await Bet.findById(req.params.id).lean();

    if (!bet) {
      req.flash('error', 'Bet not found');
      return res.redirect('/bets');
    }

    res.render('bets/edit', {
      title: 'Edit Bet',
      bet,
      errors: [],
      moment,
    });
  } catch (error) {
    console.error('Get Edit Form Error:', error);
    res.redirect('/bets');
  }
};

// @desc    Update bet
// @route   PUT /bets/:id
const updateBet = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const bet = await Bet.findById(req.params.id).lean();
    return res.render('bets/edit', {
      title: 'Edit Bet',
      bet: { ...bet, ...req.body },
      errors: errors.array(),
      moment,
    });
  }

  try {
    const betData = {
      date: req.body.date,
      betType: req.body.betType,
      event: req.body.event,
      selection: req.body.selection,
      platform: req.body.platform,
      odds: parseFloat(req.body.odds),
      stake: parseFloat(req.body.stake),
      result: req.body.result,
      notes: req.body.notes,
      tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],
    };

    // Calculate profit/loss based on result
    if (betData.result === 'Win') {
      betData.profitLoss = betData.stake * (betData.odds - 1);
    } else if (betData.result === 'Loss') {
      betData.profitLoss = -betData.stake;
    } else if (betData.result === 'Half Win') {
      betData.profitLoss = (betData.stake * (betData.odds - 1)) / 2;
    } else if (betData.result === 'Half Loss') {
      betData.profitLoss = -betData.stake / 2;
    } else {
      betData.profitLoss = 0;
    }

    await Bet.findByIdAndUpdate(req.params.id, betData, { runValidators: true });

    req.flash('success', '✅ Bet updated successfully!');
    res.redirect('/bets');
  } catch (error) {
    console.error('Update Bet Error:', error);
    res.redirect('/bets');
  }
};

// @desc    Delete bet
// @route   DELETE /bets/:id
const deleteBet = async (req, res) => {
  try {
    await Bet.findByIdAndDelete(req.params.id);
    req.flash('success', '🗑️ Bet deleted successfully!');
    res.redirect('/bets');
  } catch (error) {
    console.error('Delete Bet Error:', error);
    req.flash('error', 'Error deleting bet');
    res.redirect('/bets');
  }
};

// @desc    Export bets to CSV
// @route   GET /bets/export/csv
const exportCSV = async (req, res) => {
  try {
    const bets = await Bet.find({}).sort({ date: -1 }).lean();

    const fields = [
      { label: 'Date', value: (row) => moment(row.date).format('DD/MM/YYYY') },
      { label: 'Event', value: 'event' },
      { label: 'Selection', value: 'selection' },
      { label: 'Bet Type', value: 'betType' },
      { label: 'Platform', value: 'platform' },
      { label: 'Odds', value: 'odds' },
      { label: 'Stake (₹)', value: 'stake' },
      { label: 'Result', value: 'result' },
      { label: 'Profit/Loss (₹)', value: 'profitLoss' },
      { label: 'Notes', value: 'notes' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(bets);

    res.header('Content-Type', 'text/csv');
    res.attachment('betting_records.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV Export Error:', error);
    req.flash('error', 'Error exporting data');
    res.redirect('/bets');
  }
};

// @desc    Export bets to PDF
// @route   GET /bets/export/pdf
const exportPDF = async (req, res) => {
  try {
    const bets = await Bet.find({}).sort({ date: -1 }).lean();
    const stats = await Bet.getStats();

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

    res.header('Content-Type', 'application/pdf');
    res.attachment('betting_records.pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Betting Records Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated: ${moment().format('DD MMM YYYY, HH:mm')}`, { align: 'center' });
    doc.moveDown();

    // Stats summary
    doc.fontSize(12).font('Helvetica-Bold').text('Summary Statistics', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Bets: ${stats.totalBets}   |   Win Rate: ${stats.winRate}%   |   Total P&L: ₹${stats.totalProfitLoss.toFixed(2)}   |   ROI: ${stats.roi}%`);
    doc.moveDown();

    // Table headers
    const headers = ['Date', 'Event', 'Type', 'Platform', 'Odds', 'Stake', 'Result', 'P&L'];
    const colWidths = [70, 160, 65, 80, 45, 55, 60, 60];
    let x = 30;
    const headerY = doc.y;

    doc.font('Helvetica-Bold').fontSize(9);
    headers.forEach((header, i) => {
      doc.text(header, x, headerY, { width: colWidths[i] });
      x += colWidths[i];
    });

    doc.moveTo(30, doc.y + 2).lineTo(780, doc.y + 2).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font('Helvetica').fontSize(8);
    bets.forEach((bet, idx) => {
      if (doc.y > 510) {
        doc.addPage({ layout: 'landscape' });
        doc.moveDown();
      }
      const rowY = doc.y;
      x = 30;

      const rowData = [
        moment(bet.date).format('DD/MM/YY'),
        bet.event.substring(0, 30),
        bet.betType,
        bet.platform,
        bet.odds.toString(),
        `₹${bet.stake}`,
        bet.result,
        `₹${bet.profitLoss.toFixed(0)}`,
      ];

      rowData.forEach((val, i) => {
        const color = i === 7 ? (bet.profitLoss >= 0 ? '#16a34a' : '#dc2626') : '#000000';
        doc.fillColor(color).text(val, x, rowY, { width: colWidths[i] });
        x += colWidths[i];
      });

      doc.fillColor('#000000');
      doc.moveDown(0.4);
    });

    doc.end();
  } catch (error) {
    console.error('PDF Export Error:', error);
    res.redirect('/bets');
  }
};

module.exports = {
  getBets,
  getNewBetForm,
  createBet,
  getBet,
  getEditBetForm,
  updateBet,
  deleteBet,
  exportCSV,
  exportPDF,
};
