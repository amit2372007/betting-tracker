# 🚀 Complete Deployment Guide

## Step-by-Step: MongoDB Atlas + GitHub + Free Hosting

This guide will help you:
1. Migrate from local MongoDB to MongoDB Atlas (cloud)
2. Push your project to GitHub
3. Deploy for free on Render.com

---

## Part 1: MongoDB Atlas Setup (Cloud Database)

### Step 1.1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or Google account
3. Choose the **FREE** tier (M0 Sandbox)
4. Click "Create a Cluster"

### Step 1.2: Configure Your Cluster

1. **Cloud Provider**: Choose AWS, Google Cloud, or Azure (any is fine)
2. **Region**: Select the closest region to you (e.g., Mumbai for India)
3. **Cluster Tier**: Select **M0 Sandbox** (FREE forever)
4. **Cluster Name**: Leave default or name it `betting-tracker-cluster`
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 1.3: Create Database User

1. On the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `bettracker_user` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **COPY IT**
6. Database User Privileges: Select **"Read and write to any database"**
7. Click **"Add User"**

**⚠️ IMPORTANT: Save this password immediately — you won't see it again!**

### Step 1.4: Whitelist IP Addresses

1. On the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for deployment flexibility)
   - This adds `0.0.0.0/0` which allows all IPs
4. Click **"Confirm"**

### Step 1.5: Get Your Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://bettracker_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with the password you saved in Step 1.3
7. **Add database name** before the `?` — final string should look like:
   ```
   mongodb+srv://bettracker_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/betting_tracker?retryWrites=true&w=majority
   ```

---

## Part 2: Update Your Project for Atlas

### Step 2.1: Update `.env` File

Open your `.env` file and replace the MongoDB URI:

**Old (local):**
```env
MONGODB_URI=mongodb://localhost:27017/betting_tracker
```

**New (Atlas):**
```env
MONGODB_URI=mongodb+srv://bettracker_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/betting_tracker?retryWrites=true&w=majority
```

Also update the session secret:
```env
SESSION_SECRET=generate_a_random_long_string_here_abc123xyz789
```

### Step 2.2: Update `.env.example`

Open `.env.example` and update it (but don't include real credentials):

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/betting_tracker?retryWrites=true&w=majority
SESSION_SECRET=your_super_secret_session_key_change_this_in_production
NODE_ENV=production
```

### Step 2.3: Test Atlas Connection Locally

```bash
npm install
npm run seed
npm start
```

If it connects successfully, you'll see:
```
✅ MongoDB Connected: cluster0-shard-xxxxx.mongodb.net
🚀 Betting Tracker running on http://localhost:3000
```

---

## Part 3: Push to GitHub

### Step 3.1: Verify `.gitignore`

Make sure your `.gitignore` includes:
```
node_modules/
.env
*.log
npm-debug.log*
.DS_Store
```

**⚠️ Never commit `.env` — it contains your database password!**

### Step 3.2: Initialize Git (if not already done)

Open terminal in your project folder:

```bash
cd betting-tracker
git init
git add .
git commit -m "Initial commit - BetTracker Pro"
```

### Step 3.3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `betting-tracker` (or your choice)
3. Description: "Full-stack gambling tracker with MongoDB, Express, Node.js"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Step 3.4: Push to GitHub

Copy the commands from GitHub (looks like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/betting-tracker.git
git branch -M main
git push -u origin main
```

If prompted for credentials:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your account password)
  - Generate one at: https://github.com/settings/tokens
  - Give it `repo` scope

---

## Part 4: Deploy for Free on Render

### Step 4.1: Create Render Account

1. Go to https://render.com/
2. Sign up with your **GitHub account** (easiest way)
3. Authorize Render to access your repositories

### Step 4.2: Create New Web Service

1. On Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Find and select your `betting-tracker` repository
4. Click **"Connect"**

### Step 4.3: Configure Your Web Service

Fill in the following:

| Field | Value |
|---|---|
| **Name** | `betting-tracker` (or your choice) |
| **Region** | Choose closest to you (e.g., Singapore) |
| **Branch** | `main` |
| **Root Directory** | Leave blank |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** (select this!) |

### Step 4.4: Add Environment Variables

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**:

Add these one by one:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your full Atlas connection string |
| `SESSION_SECRET` | A random long string |
| `PORT` | `3000` |

**Example:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://bettracker_user:MyPass123@cluster0.xxxxx.mongodb.net/betting_tracker?retryWrites=true&w=majority
SESSION_SECRET=my-super-secret-random-key-xyz789abc123
PORT=3000
```

### Step 4.5: Deploy

1. Click **"Create Web Service"** at the bottom
2. Render will start building and deploying (takes 2-3 minutes)
3. Watch the logs — you should see:
   ```
   ✅ MongoDB Connected: cluster0-shard-xxxxx.mongodb.net
   🚀 Betting Tracker running on http://localhost:3000
   ```

### Step 4.6: Seed Your Production Database (Optional)

Once deployed, go to the **Shell** tab in Render and run:

```bash
npm run seed
```

This will populate your Atlas database with sample data.

### Step 4.7: Access Your Live Site

Your app will be live at:
```
https://betting-tracker-XXXXX.onrender.com
```

(Render gives you a free subdomain)

---

## Part 5: Alternative Free Hosting Options

### Option B: Railway.app

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variables (same as Render)
6. Deploy automatically happens

**Railway Free Tier:** 500 hours/month, $5 credit

### Option C: Vercel (requires slight code changes)

Vercel is great but designed for serverless, so you'd need to adapt the Express app.

### Option D: Cyclic.sh

1. Go to https://www.cyclic.sh/
2. Sign in with GitHub
3. Click **"Link Your Own"**
4. Select repository
5. Add env vars
6. Deploy

**Cyclic Free Tier:** Unlimited apps, 10k requests/day per app

---

## Part 6: Post-Deployment

### Update Code and Redeploy

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Updated feature X"
   git push origin main
   ```
3. Render auto-deploys on every push to `main`

### Custom Domain (Optional)

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Render: Settings → Custom Domain
3. Add your domain and update DNS records

### Monitor Your App

- **Render Dashboard**: View logs, metrics, restarts
- **MongoDB Atlas**: Database → Metrics shows queries, connections
- Set up alerts for downtime in Render settings

---

## 🎯 Quick Reference: All Commands

```bash
# Initial setup
cd betting-tracker
npm install

# Test locally with Atlas
npm start

# Seed data
npm run seed

# Git setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/betting-tracker.git
git push -u origin main

# Future updates
git add .
git commit -m "Your message"
git push origin main
```

---

## ⚠️ Security Checklist

- [x] `.env` is in `.gitignore`
- [x] Never committed passwords to GitHub
- [x] MongoDB Atlas user has limited permissions
- [x] Environment variables set in Render (not hardcoded)
- [x] Session secret is random and strong

---

## 🐛 Troubleshooting

### Issue: "MongoServerError: bad auth"
**Fix:** Double-check your MongoDB Atlas password in the connection string. Make sure you replaced `<password>` with your actual password.

### Issue: Render build fails
**Fix:** Check logs in Render. Common causes:
- Missing `package.json`
- Wrong start command (should be `npm start`)
- Node version mismatch

### Issue: App crashes on Render
**Fix:** Check environment variables are set correctly. Missing `MONGODB_URI` will cause crash.

### Issue: "Cannot connect to MongoDB"
**Fix:** 
1. Check Network Access in Atlas (should allow 0.0.0.0/0)
2. Verify connection string format
3. Test locally first

### Issue: Changes not reflecting
**Fix:** 
1. Make sure you pushed to GitHub (`git push`)
2. Check Render logs to see if deployment succeeded
3. Hard refresh browser (Ctrl+Shift+R)

---

## 📞 Support Resources

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Render Docs**: https://render.com/docs
- **Express.js Guide**: https://expressjs.com/
- **GitHub Help**: https://docs.github.com/

---

## 🎉 Congratulations!

Your betting tracker is now:
✅ Using cloud database (MongoDB Atlas)
✅ Version controlled (GitHub)
✅ Deployed and accessible worldwide (Render)
✅ Auto-deploys on every code push

**Your live URL:** `https://your-app-name.onrender.com`

Share it, use it, and track your bets like a pro! 🎲
