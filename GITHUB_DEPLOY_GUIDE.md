# 🚀 GitHub & Deployment Guide

## Step 1: Push to GitHub

### 1.1 Remove Sensitive Files from Git (if tracked)
```bash
# Remove .env files if accidentally tracked
git rm --cached backend/.env
git rm --cached frontend/.env.local

# Commit the removal
git commit -m "Remove sensitive files"
```

### 1.2 Initialize Git (if not already done)
```bash
# Check if git is initialized
git status

# If not initialized:
git init
git add .
git commit -m "Initial commit: Xeno FDE Assignment 2025"
```

### 1.3 Connect to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/xeno-fde-assignment.git

# Verify remote
git remote -v
```

### 1.4 Push to GitHub
```bash
# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.2 Create PostgreSQL Database

1. **Click "New +" → "PostgreSQL"**
2. **Settings:**
   ```
   Name: xeno-fde-db
   Database: xeno_fde
   User: (auto-generated)
   Region: Choose closest to you
   Plan: Free
   ```
3. **Click "Create Database"**
4. **Copy the Internal Database URL** (starts with `postgresql://`)

### 2.3 Deploy Backend Service

1. **Click "New +" → "Web Service"**
2. **Connect Repository:**
   - Select your `xeno-fde-assignment` repository
   - Click "Connect"

3. **Settings:**
   ```
   Name: xeno-fde-backend
   Region: Same as database
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build && npx prisma generate
   Start Command: npm start
   Plan: Free
   ```

4. **Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   ```
   DATABASE_URL = [Paste Internal Database URL from step 2.2]
   JWT_SECRET = [Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
   SHOPIFY_WEBHOOK_SECRET = [Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
   BACKEND_URL = https://xeno-fde-backend.onrender.com/api
   FRONTEND_URL = [Will add after Vercel deployment]
   GEMINI_API_KEY = AIzaSyAeAyWzLDY0l1iOKf_Sz_ehLfPphYGP_AM
   NODE_ENV = production
   ENABLE_SCHEDULER = true
   PORT = 4000
   ```

5. **Click "Create Web Service"**

6. **Wait for deployment** (5-10 minutes)

7. **Run Database Migrations:**
   - Go to your service → "Shell" tab
   - Run: `npx prisma migrate deploy`

### 2.4 Test Backend
```bash
# Test health endpoint
curl https://xeno-fde-backend.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### 3.2 Deploy Frontend

1. **Click "Add New..." → "Project"**
2. **Import Repository:**
   - Select `xeno-fde-assignment`
   - Click "Import"

3. **Configure Project:**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables:**
   Add this variable:
   ```
   NEXT_PUBLIC_API_URL = https://xeno-fde-backend.onrender.com/api
   ```

5. **Click "Deploy"**

6. **Wait for deployment** (2-3 minutes)

7. **Copy your Vercel URL** (e.g., `https://xeno-fde-assignment.vercel.app`)

### 3.3 Update Backend Environment

1. **Go back to Render**
2. **Open your backend service**
3. **Environment → Edit**
4. **Update FRONTEND_URL:**
   ```
   FRONTEND_URL = https://xeno-fde-assignment.vercel.app
   ```
5. **Save Changes** (will trigger redeploy)

---

## Step 4: Create Test User

### 4.1 Access Render Shell
1. Go to Render → Your backend service
2. Click "Shell" tab
3. Run this command:

```bash
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUser() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });
  console.log('User created:', user.email);
  await prisma.\$disconnect();
}

createUser();
"
```

---

## Step 5: Test Your Deployment

### 5.1 Test Frontend
1. Visit your Vercel URL
2. Login with:
   ```
   Email: test@example.com
   Password: password123
   ```

### 5.2 Add Shopify Store
1. Click "Add Store" or go to Tenants
2. Enter your Shopify credentials:
   ```
   Store Name: Your Store Name
   Shopify Domain: yourstore.myshopify.com
   Access Token: shpat_xxxxx
   ```

### 5.3 Sync Data
1. Click "Sync Now"
2. Wait for sync to complete
3. Check dashboard for data

### 5.4 Register Webhooks (Optional)
```bash
# Get your JWT token after login (from browser DevTools → Application → localStorage)
# Get your tenant ID (from URL or API)

curl -X POST "https://xeno-fde-backend.onrender.com/api/tenants/TENANT_ID/webhooks/register" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Step 6: Update README

Update your README.md with deployment URLs:

```markdown
## 🚀 Live Demo

- **Frontend:** https://xeno-fde-assignment.vercel.app
- **Backend API:** https://xeno-fde-backend.onrender.com/api
- **Demo Video:** [Add your video link]

## 🔑 Test Credentials

```
Email: test@example.com
Password: password123
```
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Build fails on Render
```bash
# Solution: Check build logs
# Common issues:
# 1. Missing dependencies → Check package.json
# 2. TypeScript errors → Run npm run build locally first
# 3. Prisma errors → Ensure DATABASE_URL is set
```

**Problem:** Database connection fails
```bash
# Solution: Use Internal Database URL (not External)
# Format: postgresql://user:pass@host:5432/dbname
```

**Problem:** Migrations fail
```bash
# Solution: Run manually in Render Shell
npx prisma migrate deploy
npx prisma generate
```

### Frontend Issues

**Problem:** API calls fail
```bash
# Solution: Check NEXT_PUBLIC_API_URL
# Must include /api at the end
# Example: https://your-backend.onrender.com/api
```

**Problem:** Build fails
```bash
# Solution: Check build logs
# Common issues:
# 1. Missing environment variable
# 2. TypeScript errors
# 3. Import errors
```

### Webhook Issues

**Problem:** Webhooks not working
```bash
# Solution:
# 1. Ensure SHOPIFY_WEBHOOK_SECRET is set
# 2. Backend must be publicly accessible
# 3. Register webhooks after deployment
```

---

## 📊 Monitoring

### Render Monitoring
- Go to your service → "Metrics"
- Check CPU, Memory, Response time
- View logs in "Logs" tab

### Vercel Monitoring
- Go to your project → "Analytics"
- Check page views, performance
- View logs in "Deployments" → Click deployment → "Logs"

---

## 🔄 Redeployment

### Backend (Render)
```bash
# Automatic: Push to GitHub
git add .
git commit -m "Update backend"
git push origin main

# Manual: Render Dashboard
# Go to service → "Manual Deploy" → "Deploy latest commit"
```

### Frontend (Vercel)
```bash
# Automatic: Push to GitHub
git add .
git commit -m "Update frontend"
git push origin main

# Manual: Vercel Dashboard
# Go to project → "Deployments" → "Redeploy"
```

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and public
- [ ] Code pushed to GitHub
- [ ] Render PostgreSQL database created
- [ ] Backend deployed to Render
- [ ] Database migrations run
- [ ] Test user created
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] Backend and frontend connected
- [ ] Test login works
- [ ] Shopify store can be added
- [ ] Data sync works
- [ ] Dashboard displays data
- [ ] README updated with URLs
- [ ] Demo video recorded and linked

---

## 🎉 Success!

Your application is now live and ready for submission!

**Next Steps:**
1. Record demo video (max 7 minutes)
2. Upload to YouTube/Loom/Drive
3. Add video link to README
4. Submit assignment

**Good luck! 🚀**
