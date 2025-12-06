# 🚀 Deployment Steps - Visual Guide

## Overview
```
Local Code → GitHub → Render (Backend) + Vercel (Frontend) → Live App
```

---

## 📦 Part 1: GitHub Setup (5 minutes)

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `xeno-fde-assignment`
   - **Description:** `Multi-Tenant Shopify Analytics - Xeno FDE 2025`
   - **Visibility:** ✅ Public
   - ❌ Don't add README (we have one)
3. Click **"Create repository"**

### Step 2: Push Your Code
Open terminal in your project folder:

```bash
# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Final submission: Xeno FDE Assignment 2025"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/xeno-fde-assignment.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ **Verify:** Visit your GitHub repo - you should see all files!

---

## 🗄️ Part 2: Render Database (5 minutes)

### Step 1: Create Account
1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub
4. Authorize Render

### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Settings:
   ```
   Name: xeno-fde-db
   Database: xeno_fde
   Region: Oregon (US West) or closest to you
   PostgreSQL Version: 16
   Plan: Free
   ```
3. Click **"Create Database"**
4. Wait 2-3 minutes for creation
5. **IMPORTANT:** Copy the **"Internal Database URL"**
   - It looks like: `postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/xeno_fde`
   - Save this - you'll need it!

✅ **Verify:** Database status shows "Available"

---

## 🔧 Part 3: Render Backend (10 minutes)

### Step 1: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"**
3. Click **"Connect account"** (if needed)
4. Find and click **"Connect"** next to your `xeno-fde-assignment` repo

### Step 2: Configure Service
Fill in these settings:

```
Name: xeno-fde-backend
Region: Same as database (Oregon)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build && npx prisma generate
Start Command: npm start
Instance Type: Free
```

### Step 3: Add Environment Variables
Click **"Advanced"** → Scroll to **"Environment Variables"**

Add these one by one (click "+ Add Environment Variable"):

```
DATABASE_URL = [Paste your Internal Database URL from Part 2]
JWT_SECRET = [Generate below]
SHOPIFY_WEBHOOK_SECRET = [Generate below]
BACKEND_URL = https://xeno-fde-backend.onrender.com/api
FRONTEND_URL = https://localhost:3000
GEMINI_API_KEY = AIzaSyAeAyWzLDY0l1iOKf_Sz_ehLfPphYGP_AM
NODE_ENV = production
ENABLE_SCHEDULER = true
PORT = 4000
```

**To generate secrets, run in your local terminal:**
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SHOPIFY_WEBHOOK_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Watch the logs - should end with "Deploy succeeded"

### Step 5: Run Database Migrations
1. Go to your service page
2. Click **"Shell"** tab (top right)
3. Run this command:
   ```bash
   npx prisma migrate deploy
   ```
4. Wait for "All migrations have been successfully applied"

### Step 6: Create Test User
In the same Shell, run:
```bash
npx ts-node -e "const { PrismaClient } = require('@prisma/client'); const bcrypt = require('bcryptjs'); const prisma = new PrismaClient(); async function createUser() { const hashedPassword = await bcrypt.hash('password123', 10); const user = await prisma.user.create({ data: { email: 'test@example.com', password: hashedPassword, name: 'Test User' } }); console.log('User created:', user.email); await prisma.\$disconnect(); } createUser();"
```

### Step 7: Test Backend
```bash
# In your local terminal
curl https://xeno-fde-backend.onrender.com/health
```

Should return: `{"status":"ok","timestamp":"..."}`

✅ **Verify:** Backend is live and responding!

---

## 🎨 Part 4: Vercel Frontend (5 minutes)

### Step 1: Create Account
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find `xeno-fde-assignment` in the list
3. Click **"Import"**

### Step 3: Configure Project
```
Framework Preset: Next.js (auto-detected)
Root Directory: frontend
Build Command: npm run build (auto-filled)
Output Directory: .next (auto-filled)
Install Command: npm install (auto-filled)
```

### Step 4: Add Environment Variable
Click **"Environment Variables"** section:

```
Key: NEXT_PUBLIC_API_URL
Value: https://xeno-fde-backend.onrender.com/api
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll see "Congratulations!" when done
4. Click **"Continue to Dashboard"**
5. **Copy your deployment URL** (e.g., `https://xeno-fde-assignment.vercel.app`)

✅ **Verify:** Visit your Vercel URL - you should see the login page!

---

## 🔗 Part 5: Connect Frontend & Backend (2 minutes)

### Update Backend Environment
1. Go back to **Render Dashboard**
2. Open your **xeno-fde-backend** service
3. Click **"Environment"** in left sidebar
4. Find **FRONTEND_URL**
5. Click **"Edit"**
6. Change value to: `https://xeno-fde-assignment.vercel.app`
7. Click **"Save Changes"**
8. Wait for automatic redeploy (2-3 minutes)

✅ **Verify:** Both services are now connected!

---

## 🧪 Part 6: Test Everything (5 minutes)

### Test 1: Login
1. Visit your Vercel URL
2. Login with:
   ```
   Email: test@example.com
   Password: password123
   ```
3. Should see dashboard

### Test 2: Add Shopify Store
1. Click **"Add Store"** or go to **Tenants**
2. Enter:
   ```
   Store Name: KookiePookie (or your store name)
   Shopify Domain: yourstore.myshopify.com
   Access Token: shpat_xxxxx (your token)
   ```
3. Click **"Add Store"**

### Test 3: Sync Data
1. Click **"Sync Now"**
2. Wait for sync to complete
3. Go to **Dashboard**
4. Should see customers, orders, revenue

### Test 4: Check All Pages
- ✅ Dashboard - Shows metrics
- ✅ Customers - Shows customer list
- ✅ Orders - Shows order list
- ✅ Products - Shows product list
- ✅ Insights - Shows AI insights
- ✅ Events - Shows event tracking

✅ **Success!** Everything is working!

---

## 📝 Part 7: Update Documentation (3 minutes)

### Update README.md
Add your deployment URLs:

```markdown
## 🚀 Live Demo

- **Frontend:** https://xeno-fde-assignment.vercel.app
- **Backend API:** https://xeno-fde-backend.onrender.com/api

## 🔑 Test Credentials

Email: test@example.com
Password: password123
```

### Push to GitHub
```bash
git add README.md
git commit -m "Add deployment URLs"
git push origin main
```

---

## 🎥 Part 8: Record Demo Video

### Requirements
- **Duration:** Max 7 minutes
- **Format:** Your voice and video
- **Platform:** YouTube, Loom, or Google Drive

### Topics to Cover (7 minutes)
1. **Introduction** (30 sec)
   - Your name
   - Assignment overview

2. **Features Demo** (3 min)
   - Login
   - Add Shopify store
   - Sync data
   - Dashboard metrics
   - AI insights
   - Event tracking

3. **Architecture** (2 min)
   - Show README architecture diagram
   - Explain multi-tenancy
   - Database schema
   - API structure

4. **Code Walkthrough** (1 min)
   - Backend structure
   - Frontend components
   - Key implementations

5. **Trade-offs** (30 sec)
   - Technology choices
   - Design decisions

### Upload & Link
1. Upload video to YouTube/Loom/Drive
2. Get shareable link
3. Add to README.md:
   ```markdown
   ## 🎥 Demo Video
   
   [Watch Demo Video](YOUR_VIDEO_LINK) (7 minutes)
   ```
4. Push to GitHub

---

## ✅ Final Checklist

Before submission:
- [ ] GitHub repository is public
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Test login works
- [ ] Data sync works
- [ ] All pages accessible
- [ ] README has deployment URLs
- [ ] Demo video recorded
- [ ] Demo video linked in README
- [ ] All features working

---

## 🎉 You're Done!

Your application is live and ready for submission!

**Your Submission Includes:**
✅ Public GitHub repository
✅ Deployed backend (Render)
✅ Deployed frontend (Vercel)
✅ Demo video
✅ Complete documentation

**Submission Links:**
- GitHub: `https://github.com/YOUR_USERNAME/xeno-fde-assignment`
- Live App: `https://xeno-fde-assignment.vercel.app`
- Demo Video: `[Your video link]`

**Good luck with your submission! 🚀**
