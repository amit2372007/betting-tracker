/**
 * Database Seeder Script
 * Populates the database with sample betting data for testing
 *
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Bet = require('../models/Bet');
const connectDB = require('../config/db');

const sampleBets = [
  { date: new Date('2024-08-01'), betType: 'Cricket', event: 'CSK vs MI - IPL 2024', selection: 'CSK to win', platform: 'Betway', odds: 1.85, stake: 1000, result: 'Win', notes: 'Strong home advantage for CSK' },
  { date: new Date('2024-08-03'), betType: 'Football', event: 'Manchester City vs Arsenal', selection: 'Over 2.5 goals', platform: 'Bet365', odds: 1.72, stake: 500, result: 'Win', notes: 'Both teams in great form' },
  { date: new Date('2024-08-05'), betType: 'Football', event: 'Barcelona vs Real Madrid - El Clasico', selection: 'Real Madrid', platform: 'Betway', odds: 3.10, stake: 800, result: 'Loss', notes: 'Risky bet on Real Madrid away' },
  { date: new Date('2024-08-08'), betType: 'Tennis', event: 'Djokovic vs Alcaraz - Wimbledon Final', selection: 'Alcaraz to win', platform: 'Bet365', odds: 2.20, stake: 600, result: 'Win', notes: 'Alcaraz on fire this season' },
  { date: new Date('2024-08-10'), betType: 'Cricket', event: 'India vs Australia T20', selection: 'India', platform: 'Dream11', odds: 1.65, stake: 1500, result: 'Win' },
  { date: new Date('2024-08-12'), betType: 'Football', event: 'Chelsea vs Liverpool', selection: 'Draw', platform: 'Betway', odds: 3.50, stake: 300, result: 'Loss' },
  { date: new Date('2024-08-15'), betType: 'Basketball', event: 'Lakers vs Celtics NBA Finals', selection: 'Celtics', platform: 'Bet365', odds: 1.90, stake: 700, result: 'Win', notes: 'Celtics defensively superior' },
  { date: new Date('2024-08-18'), betType: 'Cricket', event: 'RCB vs KKR - IPL 2024', selection: 'KKR to win', platform: 'MPL', odds: 2.10, stake: 500, result: 'Win', notes: 'KKR strong batting lineup' },
  { date: new Date('2024-08-20'), betType: 'Sports', event: 'Murray vs Federer Exhibition', selection: 'Federer', platform: 'Betway', odds: 2.80, stake: 200, result: 'Loss' },
  { date: new Date('2024-08-22'), betType: 'Football', event: 'PSG vs Bayern Munich', selection: 'PSG', platform: 'Bet365', odds: 2.50, stake: 1000, result: 'Loss', notes: 'Bad night for PSG' },
  { date: new Date('2024-08-25'), betType: 'Cricket', event: 'Pakistan vs England ODI', selection: 'England', platform: 'My11Circle', odds: 1.80, stake: 800, result: 'Win' },
  { date: new Date('2024-08-28'), betType: 'Boxing', event: 'Fury vs Joshua Championship', selection: 'Fury to win by decision', platform: 'Betway', odds: 3.50, stake: 500, result: 'Pending', notes: 'Big fight coming up' },
  { date: new Date('2024-09-01'), betType: 'Tennis', event: 'US Open - Sinner vs Medvedev', selection: 'Sinner', platform: 'Bet365', odds: 1.75, stake: 900, result: 'Win', notes: 'Sinner in peak form' },
  { date: new Date('2024-09-05'), betType: 'Football', event: 'Bayern Munich vs Dortmund', selection: 'Bayern', platform: 'Betway', odds: 1.60, stake: 1200, result: 'Win' },
  { date: new Date('2024-09-08'), betType: 'Cricket', event: 'SA vs NZ Test Match Day 1', selection: 'SA to win match', platform: 'Dream11', odds: 2.30, stake: 400, result: 'Loss', notes: 'NZ surprising performance' },
  { date: new Date('2024-09-12'), betType: 'eSports', event: 'CS2 Major - NAVI vs FaZe', selection: 'NAVI', platform: 'Betway', odds: 1.95, stake: 300, result: 'Win', notes: 'S1mple at his best' },
  { date: new Date('2024-09-15'), betType: 'Cricket', event: 'India vs Sri Lanka ODI', selection: 'India to win by 50+ runs', platform: 'MPL', odds: 2.60, stake: 600, result: 'Win', notes: 'India dominant at home' },
  { date: new Date('2024-09-20'), betType: 'Football', event: 'Inter Milan vs AC Milan', selection: 'Inter Milan', platform: 'Bet365', odds: 2.10, stake: 750, result: 'Half Win', notes: 'Derby went to extra time' },
  { date: new Date('2024-09-25'), betType: 'UFC/MMA', event: 'UFC 307 - Pereira vs Rountree', selection: 'Pereira by KO', platform: 'Betway', odds: 2.00, stake: 500, result: 'Win', notes: 'Pereira is unstoppable' },
  { date: new Date('2024-10-01'), betType: 'Cricket', event: 'India vs Bangladesh T20', selection: 'India -20 runs handicap', platform: 'FanCode', odds: 1.90, stake: 1000, result: 'Win', notes: 'India crushing form vs Bangladesh' },
  { date: new Date('2024-10-05'), betType: 'Football', event: 'Atletico Madrid vs Valencia', selection: 'Under 2.5 goals', platform: 'Bet365', odds: 1.70, stake: 400, result: 'Win' },
  { date: new Date('2024-10-10'), betType: 'Horse Racing', event: 'Melbourne Cup 2024', selection: 'Without A Fight to podium', platform: 'Betway', odds: 4.50, stake: 200, result: 'Void', notes: 'Race abandoned due to weather' },
  { date: new Date('2024-10-14'), betType: 'Cricket', event: 'New Zealand vs Afghanistan T20', selection: 'NZ', platform: 'Dream11', odds: 1.55, stake: 800, result: 'Win' },
  { date: new Date('2024-10-18'), betType: 'Football', event: 'Liverpool vs Tottenham', selection: 'Liverpool', platform: 'Bet365', odds: 1.65, stake: 1000, result: 'Pending', notes: 'Current form favors Liverpool' },
];

const sampleStrategy = {
  initialBankroll: 10000,
  currentBankroll: 12450,
  dailyTargetPercentage: 3,
  stopLossPercentage: 5,
  stopProfitPercentage: 3,
  riskLevel: 'Moderate',
  strategyStartDate: new Date('2024-08-01'),
  isActive: true,
  dailyRecords: [
    { date: new Date('2024-10-15'), profitLoss: 300, bankrollSnapshot: 12150, stopTriggered: 'none', betCount: 5, consecutiveLosses: 0 },
    { date: new Date('2024-10-16'), profitLoss: -150, bankrollSnapshot: 12000, stopTriggered: 'none', betCount: 3, consecutiveLosses: 1 },
    { date: new Date('2024-10-17'), profitLoss: 450, bankrollSnapshot: 12450, stopTriggered: 'stop-profit', betCount: 4, consecutiveLosses: 0 },
  ],
  consecutiveLosses: 0,
};

const sampleTransactions = [
  { type: 'income', category: 'Salary', amount: 50000, description: 'Monthly salary', date: new Date('2024-10-01'), recurringType: 'Monthly' },
  { type: 'income', category: 'Freelance', amount: 15000, description: 'Web design project', date: new Date('2024-10-05'), recurringType: 'One-time' },
  { type: 'expense', category: 'Rent', amount: 12000, description: 'Monthly rent payment', date: new Date('2024-10-01'), recurringType: 'Monthly' },
  { type: 'expense', category: 'Groceries', amount: 3500, description: 'Weekly groceries', date: new Date('2024-10-07'), recurringType: 'Weekly' },
  { type: 'expense', category: 'Food & Dining', amount: 2200, description: 'Restaurants and cafes', date: new Date('2024-10-10'), recurringType: 'One-time' },
  { type: 'expense', category: 'Transportation', amount: 1500, description: 'Fuel and maintenance', date: new Date('2024-10-12'), recurringType: 'Monthly' },
  { type: 'expense', category: 'Utilities', amount: 2800, description: 'Electricity and internet', date: new Date('2024-10-05'), recurringType: 'Monthly' },
  { type: 'expense', category: 'Entertainment', amount: 1200, description: 'Movies and streaming', date: new Date('2024-10-14'), recurringType: 'One-time' },
  { type: 'liability', category: 'Credit Card Bill', amount: 8500, description: 'Last month balance', date: new Date('2024-10-03'), recurringType: 'Monthly' },
  { type: 'liability', category: 'Loan Payment', amount: 5000, description: 'Personal loan EMI', date: new Date('2024-10-05'), recurringType: 'Monthly' },
];

/**
 * Main seeding function
 * Clears and repopulates database with sample data
 */
const seedDB = async () => {
  try {
    await connectDB();

    // Load models after DB connection
    const Strategy = require('../models/Strategy');
    const Transaction = require('../models/Transaction');

    // Clear existing data
    await Bet.deleteMany({});
    console.log('🗑️  Cleared existing bets');

    // Insert sample bets
    await Bet.insertMany(sampleBets);
    console.log(`✅ Inserted ${sampleBets.length} sample bets`);

    // Calculate bet stats
    const stats = await Bet.getStats();
    console.log('\n📊 Sample Betting Stats:');
    console.log(`   Total Bets: ${stats.totalBets}`);
    console.log(`   Win Rate:   ${stats.winRate}%`);
    console.log(`   Total P&L:  ₹${stats.totalProfitLoss.toFixed(2)}`);
    console.log(`   ROI:        ${stats.roi}%`);

    // Clear and seed strategy
    await Strategy.deleteMany({});
    await Strategy.create(sampleStrategy);
    console.log('\n✅ Created sample strategy');

    // Clear and seed transactions
    await Transaction.deleteMany({});
    await Transaction.insertMany(sampleTransactions);
    console.log(`✅ Inserted ${sampleTransactions.length} sample transactions`);

    // Calculate finance stats
    const financeSummary = await Transaction.getFinanceSummary();
    console.log('\n💰 Sample Finance Stats:');
    console.log(`   Income:      ₹${financeSummary.totalIncome.toFixed(2)}`);
    console.log(`   Expenses:    ₹${financeSummary.totalExpenses.toFixed(2)}`);
    console.log(`   Liabilities: ₹${financeSummary.totalLiabilities.toFixed(2)}`);
    console.log(`   Net Balance: ₹${financeSummary.netBalance.toFixed(2)}`);

    console.log('\n🎲 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
