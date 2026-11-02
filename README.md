# 🎲 BetTracker Pro

A professional, full-featured gambling and betting records tracker built with Node.js, Express, MongoDB, and Tailwind CSS.

## ✨ Features

- **Full CRUD** — Add, view, edit, and delete betting entries
- **Real-time Stats** — Win rate, ROI, total P&L, biggest win/loss, average stake
- **Interactive Charts** — Line (cumulative P&L), pie (bet types), donut (results), bar (platforms)
- **Advanced Filtering** — Filter by date range, platform, bet type, result, and free-text search
- **Export** — Download all records as CSV or PDF
- **Live P&L Calculator** — See estimated profit/loss as you type in the form
- **Pagination** — Handles large datasets efficiently
- **Responsive UI** — Works on mobile, tablet, and desktop
- **Flash Notifications** — Success/error messages with auto-dismiss


## 🆕 NEW FEATURES (v2.0)

### 💰 Bankroll Management & Strategy System
- **90-Day Strategy Tracking** — Set daily target percentages (1-8%) and track progress
- **Stop-Loss & Stop-Profit Controls** — Automatic alerts when limits are hit
- **Kelly Criterion Integration** — AI-powered stake recommendations based on win rate
- **Risk Level Management** — Conservative (2%), Moderate (5%), Aggressive (10%) modes
- **Smart Recommendations** — Suggests lower stakes after losses, warns on consecutive losses
- **Daily Performance Tracking** — Calendar heatmap of last 90 days

### 💳 Personal Finance Management
- **Income/Expense/Liability Tracking** — Comprehensive personal finance dashboard
- **Category Breakdown** — Pie charts showing expense distribution
- **Monthly Cash Flow Analysis** — Bar charts with income vs expenses
- **Recurring Transactions** — Track subscriptions, monthly bills, salary
- **Net Worth Calculator** — Combines betting profits with finance balance
- **CSV Export** — Export all financial data

### 📊 Enhanced Dashboard Analytics
- **Weekly Progress Charts** — Last 12 weeks performance with win rate overlay
- **Comparison Cards** — This week vs last week, this month vs last month
- **Cumulative P&L Tracking** — See your growth trajectory
- **Time Range Filters** — 7 days, 30 days, 90 days, 1 year, all time
- **Responsive Charts** — Optimized for mobile, tablet, desktop

### 📱 Fully Responsive Design
- **Mobile (320-767px)** — Single column, collapsible sidebar, touch-optimized
- **Tablet (768-1023px)** — Two-column grid, persistent sidebar toggle
- **Desktop (1024px+)** — Full multi-column, expanded sidebar, larger charts
- **Touch Targets** — Minimum 44px for mobile usability
- **Horizontal Scroll Tables** — Sticky first column on mobile
```

---

## 🎯 FINAL INTEGRATION CHECKLIST

### ✅ Files to Create (Copy-paste from above)
- [x] `controllers/financeController.js`
- [x] `routes/finance.js`
- [x] `middleware/financeValidation.js`
- [x] `views/strategy/dashboard.ejs`
- [x] `views/strategy/create.ejs`
- [x] `views/finance/dashboard.ejs`
- [x] `views/finance/transactions.ejs`
- [x] `views/finance/add.ejs`

### ✅ Files to Update (Follow instructions above)
- [x] `server.js` — Add 2 route imports
- [x] `controllers/betController.js` — Add strategy integration
- [x] `controllers/dashboardController.js` — Add weekly analytics
- [x] `views/dashboard.ejs` — Add weekly chart and comparison cards
- [x] `public/css/style.css` — Add responsive utilities
- [x] `public/js/main.js` — Add responsive handlers
- [x] `scripts/seed.js` — Add sample strategy/finance data
- [x] `README.md` — Document new features

### 🚀 Testing Steps

1. **Install & Seed**
   ```bash
   npm install
   npm run seed
   npm start
   ```

2. **Test Strategy**
   - Visit http://localhost:3000/strategy
   - Create a new 90-day strategy
   - Add a bet and see bankroll auto-update
   - Check stop-loss/stop-profit alerts

3. **Test Finance**
   - Visit http://localhost:3000/finance
   - Add income/expense/liability transactions
   - View charts and net worth calculation

4. **Test Dashboard**
   - Visit http://localhost:3000/
   - See weekly progress chart
   - Check comparison cards (this week vs last week)

5. **Test Responsive**
   - Open Chrome DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test on iPhone SE, iPad, Desktop sizes
   - Check sidebar toggle, tables scroll, charts resize


## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (local) |
| ODM | Mongoose |
| Template Engine | EJS + express-ejs-layouts |
| Styling | Tailwind CSS (CDN) |
| Charts | Chart.js |
| Validation | express-validator |
| Export | json2csv, pdfkit |

## 📁 Project Structure

```
betting-tracker/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── dashboardController.js # Dashboard stats & charts
│   └── betController.js       # CRUD + export
├── middleware/
│   └── validation.js          # Input validation rules
├── models/
│   └── Bet.js                 # Mongoose schema + statics
├── public/
│   ├── css/style.css          # Custom styles
│   └── js/main.js             # Client-side JS
├── routes/
│   ├── dashboard.js           # GET /
│   └── bets.js                # /bets CRUD routes
├── scripts/
│   └── seed.js                # Sample data seeder
├── views/
│   ├── layouts/main.ejs       # Master layout (sidebar + nav)
│   ├── dashboard.ejs          # Main dashboard
│   ├── error.ejs              # Error page
│   └── bets/
│       ├── index.ejs          # All bets with filters
│       ├── new.ejs            # Add new bet form
│       ├── edit.ejs           # Edit bet form
│       └── show.ejs           # Bet detail view
├── .env                       # Environment variables (create this)
├── .env.example               # Template for .env
├── package.json
└── server.js                  # App entry point
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB running locally

### 1. Install MongoDB (if not installed)

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install and run MongoDB as a service

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt install mongodb
sudo systemctl start mongodb
```

### 2. Clone & Install

```bash
cd betting-tracker
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Your `.env` file (defaults should work):
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/betting_tracker
SESSION_SECRET=your_super_secret_session_key_change_this_in_production
NODE_ENV=development
```

### 4. Seed Sample Data (Optional)

```bash
npm run seed
```

This loads 24 realistic sample bets so you can explore the app immediately.

### 5. Start the Application

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Open your browser at: **http://localhost:3000**

## 📊 Usage Guide

### Dashboard
- View all-time statistics at a glance
- Use filters to analyze specific date ranges, platforms, or bet types
- Charts update based on your filter selection

### Adding a Bet
1. Click **"Add Bet"** in the sidebar or header
2. Fill in: date, bet type, event, selection, platform, odds, stake, result
3. The form shows a **live P&L preview** as you fill in odds/stake/result
4. Add notes and tags for future reference
5. Click **"Record Bet"**

### Managing Bets
- **View**: Click any bet in the table to see full details
- **Edit**: Use the ✏️ button on the table row or in the detail view
- **Delete**: Use the 🗑️ button (requires confirmation)

### Exporting Data
- **CSV**: Clean spreadsheet export compatible with Excel/Google Sheets
- **PDF**: Formatted report with summary stats + full bet history

## 🎯 Supported Bet Types
Sports, Casino, Poker, Horse Racing, Football, Basketball, Tennis, Cricket, Boxing, UFC/MMA, eSports, Other

## 🏣 Supported Platforms
Betway, Bet365, Dream11, MPL, My11Circle, FanCode, Parimatch, RummyCircle, Other

## ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| Ctrl+N | New bet |
| Ctrl+D | Dashboard |
| Esc | Close mobile sidebar |

## 🔒 Security Notes
- Input sanitization via express-validator
- Method override for secure PUT/DELETE from forms
- Session-based flash messages
- MongoDB injection safe via Mongoose

---

Built with ❤️ for smart bettors
