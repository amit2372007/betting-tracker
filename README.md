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
