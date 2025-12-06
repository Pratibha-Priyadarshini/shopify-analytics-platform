# Deployment Guide - Nexus Analytics

Complete guide for deploying to Render (Backend) and Vercel (Frontend).

---

## 🎯 Deployment Overview

- **Backend**: Render (with PostgreSQL)
- **Frontend**: Vercel
- **Database**: Render PostgreSQL
- **Estimated Time**: 20-30 minutes

---

## 📦 Pre-Deployment Checklist

- [ ] Code pushed to GitHub repository
- [ ] All environment variables documented
- [ ] Database migrations tested locally
- [ ] Application tested end-to-end locally
- [ ] Gemini API key obtained (optional)
- [ ] Shopify store credentials ready

---

## 🔧 Part 1: Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repository

### Step 2: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `nexus-analytics-db`
   - **Database**: `nexus_analytics`
   - **User**: `nexus_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
3. Click **"Create Database"**
4. Wait for provisioning (2-3 minutes)
5. **Copy Internal Database URL** (starts with `postgresql://`)

### Step 3: Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `nexus-analytics-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: 
     ```bash
     npm install && npm run build && npx prisma generate
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Plan**: Free

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<paste-internal-database-url>
   JWT_SECRET=<generate-random-32-char-string>
   FRONTEND_URL=https://your-app.vercel.app
   GEMINI_API_KEY=<your-gemini-api-key>
   ENABLE_SCHEDULER=true
   SHOPIFY_WEBHOOK_SECRET=<random-string>
   ```

5. Click **"Create Web Service"**

### Step 4: Run Database Migrations

1. Go to your backend service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   ```
4. Verify tables created:
   ```bash
   npx prisma studio
   ```

### Step 5: Test Backend

1. Copy your backend URL: `https://nexus-analytics-backend.onrender.com`
2. Test health endpoint:
   ```bash
   curl https://nexus-analytics-backend.onrender.com/health
   ```
3. Should return: `{"status":"ok","timestamp":"..."}`

---

## 🌐 Part 2: Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy Frontend

```bash
cd frontend
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No
- **Project name**: `nexus-analytics`
- **Directory**: `./`
- **Override settings**: No

### Step 3: Configure Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   NEXT_PUBLIC_API_URL=https://nexus-analytics-backend.onrender.com/api
   ```
5. Redeploy:
   ```bash
   vercel --prod
   ```

### Step 4: Update Backend FRONTEND_URL

1. Go back to Render backend service
2. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://nexus-analytics.vercel.app
   ```
3. Service will auto-redeploy

---

## ✅ Post-Deployment Verification

### 1. Test Authentication
```bash
# Sign up
curl -X POST https://your-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 2. Test Frontend
1. Visit: `https://nexus-analytics.vercel.app`
2. Sign up / Login
3. Add Shopify store
4. Sync data
5. View dashboard

### 3. Test All Features
- [ ] Dashboard loads with data
- [ ] Orders page shows orders
- [ ] Customers page shows customers
- [ ] Products page shows products
- [ ] AI Insights generates predictions
- [ ] Recommendations can be applied
- [ ] Tasks are tracked

---

## 🐛 Troubleshooting Deployment

### Backend Issues

**Error: "Cannot connect to database"**
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure migrations ran successfully

**Error: "Port already in use"**
- Render handles this automatically
- Check `PORT` environment variable is set

**Error: "Module not found"**
- Verify build command includes `npm install`
- Check `package.json` dependencies

### Frontend Issues

**Error: "API calls failing"**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is deployed and running
- Verify CORS is configured correctly

**Error: "Environment variables not found"**
- Redeploy after adding environment variables
- Check variable names match exactly

### Database Issues

**Error: "Migrations failed"**
```bash
# Reset and re-run migrations
npx prisma migrate reset
npx prisma migrate deploy
```

**Error: "Connection timeout"**
- Use Internal Database URL (not External)
- Check database is in same region as backend

---

## 📊 Monitoring Production

### Render Monitoring
- **Logs**: Real-time logs in Render dashboard
- **Metrics**: CPU, Memory, Request count
- **Alerts**: Set up email alerts for downtime

### Vercel Monitoring
- **Analytics**: Built-in analytics dashboard
- **Logs**: Function logs and errors
- **Performance**: Core Web Vitals tracking

### Database Monitoring
- **Connections**: Monitor active connections
- **Query Performance**: Slow query log
- **Storage**: Monitor disk usage

---

## 🔐 Security Checklist

- [x] Environment variables not committed to Git
- [x] JWT secret is strong and random
- [x] Passwords hashed with bcrypt
- [x] CORS configured for specific origin
- [x] SQL injection prevented (Prisma ORM)
- [ ] Rate limiting implemented (TODO)
- [ ] HTTPS enforced (Render/Vercel default)
- [ ] API authentication required
- [ ] Input validation on all endpoints

---

## 💰 Cost Estimation

### Free Tier (Current)
- **Render**: Free (750 hours/month)
- **Vercel**: Free (100GB bandwidth)
- **PostgreSQL**: Free (1GB storage)
- **Gemini API**: Free (60 requests/min)
- **Total**: $0/month

### Production Tier (Recommended)
- **Render**: $7/month (Starter)
- **Vercel**: $20/month (Pro)
- **PostgreSQL**: $7/month (Starter)
- **Gemini API**: Free (sufficient for most use cases)
- **Total**: ~$34/month

---

## 🚀 Quick Deploy Commands

### Backend (Render)
```bash
# Already configured via render.yaml
# Just connect GitHub repo and deploy
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Database Migrations
```bash
# In Render Shell
npx prisma migrate deploy
```

---

## 📞 Support

If you encounter issues during deployment:

1. Check logs in Render/Vercel dashboard
2. Verify all environment variables
3. Test locally first
4. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Deployment Complete! 🎉**

Your Nexus Analytics platform is now live and ready for production use!
