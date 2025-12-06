# Nexus Analytics - Multi-Tenant Shopify Data Ingestion & Insights Service

> **Xeno FDE Internship Assignment 2025**  
> A production-ready, AI-powered analytics platform for Shopify stores with multi-tenant support, real-time data synchronization, and intelligent business insights.

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://shopify-analytics-platform-gamma.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Live-blue)](https://shopify-analytics-backend-l14y.onrender.com)

---

## 🚀 Quick Start

### Try the Live Demo
1. Visit: https://shopify-analytics-platform-gamma.vercel.app
2. Sign up with your email or use test account
3. Connect your Shopify store (or use the demo store)
4. Click "Sync Now" to import data
5. Explore analytics, AI insights, and custom events!

### Local Development
```bash
# Clone repository
git clone https://github.com/Pratibha-Priyadarshini/shopify-analytics-platform.git
cd shopify-analytics-platform

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migrate
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local
npm run dev
```

Visit `http://localhost:3000` to see the app!

---

## 📋 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Setup Instructions](#-setup-instructions)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Assumptions & Trade-offs](#-assumptions--trade-offs)
- [Next Steps to Production](#-next-steps-to-production)

---

## ✨ Features

### ✅ Assignment Requirements Completed

#### 1. **Shopify Store Setup**
- ✅ Development store created with dummy data
- ✅ Products, customers, and orders populated
- ✅ Shopify Admin API integration configured

#### 2. **Data Ingestion Service**
- ✅ **Multi-tenant architecture** with tenant isolation
- ✅ Ingests: Customers, Orders, Products
- ✅ **Automated scheduler** (syncs every 6 hours)
- ✅ **Manual sync** option via UI
- ✅ PostgreSQL database with Prisma ORM
- ✅ Tenant-based data isolation

#### 3. **Insights Dashboard**
- ✅ **Email authentication** (JWT-based)
- ✅ **Real-time metrics**: Total customers, orders, revenue
- ✅ **Date range filtering** for orders
- ✅ **Top 5 customers** by spend
- ✅ **Multiple chart types**: Line, Bar, Area
- ✅ **Responsive design** for all devices

#### 4. **Bonus Features Implemented**
- 🤖 **AI-Powered Insights** using Google Gemini 2.5 Flash
- 📊 **Advanced Analytics**: Revenue trends, customer growth, product performance
- 💡 **Smart Recommendations** with real Shopify actions
- 📋 **Task Tracking** for applied recommendations
- 🎨 **Modern UI** with glass-morphism design
- ⚡ **Real-time sync** with status indicators
- 🔔 **Webhook Integration**: Real-time event tracking
- 🛒 **Cart Abandonment Tracking**: Monitor and recover lost sales
- 💳 **Checkout Funnel Analytics**: Conversion rate optimization
- 📡 **Custom Events**: Complete event tracking system

---

## 🏗️ Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js 14)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │Customers │  │ Orders   │  │ Products │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       └─────────────┴─────────────┴─────────────┘               │
│                         │                                        │
│                    REST API Calls                                │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Express.js + TypeScript)             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes                                               │  │
│  │  • /auth (signup, login)                                  │  │
│  │  • /tenants (CRUD, sync)                                  │  │
│  │  • /customers, /orders, /products                         │  │
│  │  • /insights (analytics)                                  │  │
│  │  • /ai-insights (Gemini AI)                               │  │
│  │  • /recommendations (actions)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                       │
│  ┌──────────────────────┼────────────────────────────────┐     │
│  │  Services            │                                 │     │
│  │  • Shopify Service ──┼─► Shopify Admin API            │     │
│  │  • Ingestion Service │                                 │     │
│  │  • Gemini AI Service ─┼─► Google Gemini API           │     │
│  │  • Scheduler (6hrs)  │                                 │     │
│  └──────────────────────┼────────────────────────────────┘     │
│                          │                                       │
│                    Prisma ORM                                    │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Users   │  │ Tenants  │  │Customers │  │  Orders  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐                                    │
│  │ Products │  │  Events  │  (Multi-tenant isolation)          │
│  └──────────┘  └──────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication**: User signs up/logs in → JWT token issued
2. **Tenant Onboarding**: User adds Shopify store credentials
3. **Data Ingestion**: 
   - Manual: User clicks "Sync Now"
   - Automatic: Scheduler runs every 6 hours
   - Shopify API → Backend Service → PostgreSQL
4. **Analytics**: Frontend requests insights → Backend queries DB → Returns aggregated data
5. **AI Insights**: Backend sends data to Gemini API → Receives predictions/recommendations
6. **Actions**: User applies recommendation → Backend executes Shopify API calls → Tracks results

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma (multi-tenant support)
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **API Integration**: Axios (Shopify & Gemini APIs)
- **Scheduler**: node-cron

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **UI Components**: Custom components with shadcn/ui patterns
- **State Management**: React Hooks

### AI & Analytics
- **AI Model**: Google Gemini 2.5 Flash
- **Analytics**: Custom aggregation queries
- **Insights**: Real-time trend analysis

### DevOps
- **Version Control**: Git
- **Deployment**: 
  - Frontend: Vercel
  - Backend: Render
  - Database: Render PostgreSQL
- **Environment**: dotenv

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Shopify Development Store
- Google Gemini API Key (optional, for AI features)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd xeno-fde-assignment
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (random secret key)
# - GEMINI_API_KEY (from Google AI Studio)

# Run database migrations
npm run migrate

# Generate Prisma Client
npm run generate

# Start development server
npm run dev
```

Backend will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Shopify Store Setup

1. Create a Shopify Development Store at [partners.shopify.com](https://partners.shopify.com)
2. Add dummy products, customers, and orders
3. Create a Custom App:
   - Go to Settings → Apps and sales channels → Develop apps
   - Create app with scopes: `read_customers`, `read_orders`, `read_products`
   - Install app and copy Admin API access token
4. In the application, add your store:
   - Store Name: Your store name
   - Shopify Domain: `your-store.myshopify.com`
   - Access Token: Your Admin API token

### 5. Get Gemini API Key (Optional)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Add to `backend/.env`: `GEMINI_API_KEY="your-key"`

### 6. Setup Webhooks (For Custom Events)

**Note:** Webhooks require a publicly accessible backend URL (not localhost).

1. **Deploy backend** to Render, Heroku, or similar service
2. **Set environment variables**:
   ```env
   SHOPIFY_WEBHOOK_SECRET="your-webhook-secret"
   BACKEND_URL="https://your-backend.onrender.com/api"
   ```
3. **Register webhooks** via API:
   ```bash
   # After logging in and adding a store
   curl -X POST "https://your-backend.com/api/tenants/{TENANT_ID}/webhooks/register" \
     -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
   ```
4. **Verify webhooks** in Shopify Admin:
   - Settings → Notifications → Webhooks
   - Should see registered webhooks for carts, checkouts, orders, etc.

For detailed instructions, see [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:4000/api
Production: https://shopify-analytics-backend-l14y.onrender.com/api
```

### Authentication Endpoints

#### POST `/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com"
}
```

#### POST `/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### Tenant Endpoints

#### GET `/tenants`
Get all tenants for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "tenant-uuid",
    "name": "My Store",
    "shopifyDomain": "mystore.myshopify.com",
    "lastSyncAt": "2025-11-30T10:00:00Z"
  }
]
```

#### POST `/tenants`
Create a new tenant (Shopify store connection).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "My Store",
  "shopifyDomain": "mystore.myshopify.com",
  "accessToken": "shpat_xxxxx"
}
```

#### POST `/tenants/:tenantId/sync`
Manually trigger data synchronization.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "customers": 6,
  "orders": 11,
  "products": 6
}
```

### Analytics Endpoints

#### GET `/insights/:tenantId/summary`
Get summary statistics.

**Response:**
```json
{
  "totalRevenue": 28122.00,
  "totalOrders": 11,
  "totalCustomers": 6,
  "averageOrderValue": 2556.55
}
```

#### GET `/insights/:tenantId/revenue-trend?days=30`
Get revenue trend data.

#### GET `/insights/:tenantId/top-customers?limit=5`
Get top customers by spend.

#### GET `/insights/:tenantId/customer-growth?days=30`
Get customer growth data.

#### GET `/insights/:tenantId/product-performance`
Get product performance metrics.

### AI Insights Endpoints

#### GET `/ai-insights/:tenantId?days=30`
Get AI-generated insights, predictions, and recommendations.

**Response:**
```json
{
  "predictions": [...],
  "trends": [...],
  "recommendations": [...],
  "performance": {...},
  "market": {...}
}
```

### Recommendation Endpoints

#### POST `/recommendations/:tenantId/apply`
Apply a recommendation (creates discount codes, segments customers, etc.).

**Request:**
```json
{
  "recommendationType": "flash_sale",
  "recommendationData": {
    "title": "Flash Sale",
    "discountPercentage": 15
  }
}
```

#### GET `/recommendations/:tenantId/tasks`
Get all applied recommendations/tasks.

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
User (1) ──────< (N) Tenant
                      │
                      ├──< (N) Customer
                      ├──< (N) Order
                      ├──< (N) Product
                      └──< (N) Event
```

### Tables

#### `User`
```sql
- id: UUID (PK)
- email: String (Unique)
- password: String (Hashed)
- name: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

#### `Tenant`
```sql
- id: UUID (PK)
- name: String
- shopifyDomain: String (Unique)
- accessToken: String (Encrypted)
- userId: UUID (FK → User)
- lastSyncAt: DateTime (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

#### `Customer`
```sql
- id: UUID (PK)
- tenantId: UUID (FK → Tenant)
- shopifyId: String
- email: String
- firstName: String
- lastName: String
- totalSpend: Float
- ordersCount: Int
- createdAt: DateTime
- updatedAt: DateTime
- UNIQUE(tenantId, shopifyId)
```

#### `Order`
```sql
- id: UUID (PK)
- tenantId: UUID (FK → Tenant)
- customerId: UUID (FK → Customer)
- shopifyId: String
- orderNumber: String
- totalAmount: Float
- currency: String
- financialStatus: String
- fulfillmentStatus: String
- createdAt: DateTime
- updatedAt: DateTime
- UNIQUE(tenantId, shopifyId)
```

#### `Product`
```sql
- id: UUID (PK)
- tenantId: UUID (FK → Tenant)
- shopifyId: String
- title: String
- price: Float
- inventory: Int
- status: String
- createdAt: DateTime
- updatedAt: DateTime
- UNIQUE(tenantId, shopifyId)
```

#### `Event`
```sql
- id: UUID (PK)
- tenantId: UUID (FK → Tenant)
- eventType: String
- customerId: String (Optional)
- metadata: JSON
- createdAt: DateTime
```

### Multi-Tenancy Implementation

- **Tenant Isolation**: All data tables include `tenantId` foreign key
- **Row-Level Security**: Queries filtered by `tenantId`
- **Unique Constraints**: Composite unique indexes on `(tenantId, shopifyId)`
- **Cascading Deletes**: When tenant is deleted, all related data is removed

---

## 🚢 Deployment

### Live URLs

- **Frontend**: https://shopify-analytics-platform-gamma.vercel.app
- **Backend API**: https://shopify-analytics-backend-l14y.onrender.com/api
- **Database**: Supabase PostgreSQL (managed)

### Backend Deployment (Render)

1. **Create PostgreSQL Database**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - New → PostgreSQL
   - Copy Internal Database URL

2. **Deploy Backend**
   - New → Web Service
   - Connect GitHub repository
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install && npm run build && npx prisma generate`
     - Start Command: `npm start`
   - Environment Variables:
     ```
     DATABASE_URL=<your-postgres-url>
     JWT_SECRET=<random-secret>
     GEMINI_API_KEY=<your-gemini-key>
     FRONTEND_URL=<your-vercel-url>
     NODE_ENV=production
     ```
   - Deploy

3. **Run Migrations**
   ```bash
   # In Render Shell
   npx prisma migrate deploy
   ```

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   ```bash
   cd frontend
   vercel
   ```

2. **Configure Environment**
   - Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=<your-render-backend-url>/api`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Post-Deployment

1. Update `FRONTEND_URL` in Render backend environment
2. Test authentication flow
3. Add Shopify store and sync data
4. Verify all features work

---

## 🤔 Assumptions & Trade-offs

### Assumptions

1. **Shopify API Access**: Assumed read-only access is sufficient for MVP
2. **Data Sync Frequency**: 6-hour sync interval balances freshness vs API rate limits
3. **Single Currency**: Assumed USD for simplicity (can be extended)
4. **Authentication**: Email/password auth is sufficient (can add OAuth later)
5. **AI Features**: Gemini API availability and rate limits are acceptable
6. **Tenant Limit**: No hard limit on tenants per user (can add subscription tiers)

### Trade-offs

1. **Sync vs Webhooks**:
   - **Chosen**: Scheduled sync
   - **Why**: Simpler implementation, no webhook endpoint management
   - **Trade-off**: Slight data delay vs real-time updates

2. **Monolithic vs Microservices**:
   - **Chosen**: Monolithic backend
   - **Why**: Faster development, easier deployment for MVP
   - **Trade-off**: Scalability vs simplicity

3. **Client-side vs Server-side Rendering**:
   - **Chosen**: Mix (Next.js App Router with client components)
   - **Why**: Better UX for interactive dashboards
   - **Trade-off**: SEO vs interactivity

4. **SQL vs NoSQL**:
   - **Chosen**: PostgreSQL (SQL)
   - **Why**: Strong consistency, complex queries, multi-tenancy support
   - **Trade-off**: Schema flexibility vs data integrity

5. **AI Integration**:
   - **Chosen**: Google Gemini API
   - **Why**: Free tier, powerful, easy integration
   - **Trade-off**: External dependency vs custom ML models

---

## 🔮 Next Steps to Production

### Completed Features ✅

1. **Core Functionality**
   - ✅ Multi-tenant architecture with tenant isolation
   - ✅ Shopify data ingestion (customers, orders, products)
   - ✅ Automated scheduler (6-hour sync)
   - ✅ Manual sync via UI
   - ✅ JWT authentication
   - ✅ Real-time analytics dashboard
   - ✅ AI-powered insights with Google Gemini
   - ✅ Smart recommendations system
   - ✅ Webhook integration for real-time events
   - ✅ Cart abandonment tracking
   - ✅ Checkout funnel analytics
   - ✅ Custom events system
   - ✅ Production deployment (Vercel + Render + Supabase)

### Immediate (Week 1-2)

1. **Security Enhancements**
   - [ ] Rate limiting on API endpoints
   - [ ] Input validation and sanitization
   - [x] SQL injection prevention (Prisma handles this)
   - [ ] XSS protection
   - [x] CORS configuration

2. **Error Handling**
   - [x] Basic error handling
   - [ ] Structured logging (Winston/Pino)
   - [ ] Error tracking (Sentry)
   - [x] User-friendly error messages

3. **Testing**
   - [ ] Unit tests (Jest)
   - [ ] Integration tests (Supertest)
   - [ ] E2E tests (Playwright)
   - [ ] Load testing (k6)

### Short-term (Month 1)

4. **Performance Optimization**
   - [ ] Database indexing optimization
   - [ ] Query optimization
   - [ ] Caching layer (Redis)
   - [ ] CDN for static assets
   - [ ] Image optimization

5. **Monitoring & Observability**
   - [ ] Application monitoring (New Relic/Datadog)
   - [ ] Database monitoring
   - [ ] Uptime monitoring
   - [ ] Performance metrics dashboard
   - [ ] Alert system

6. **Webhooks Implementation**
   - [ ] Shopify webhook endpoints
   - [ ] Webhook verification
   - [ ] Event queue (RabbitMQ/SQS)
   - [ ] Retry mechanism

### Medium-term (Month 2-3)

7. **Feature Enhancements**
   - [ ] Custom event tracking (cart abandoned, checkout started)
   - [ ] Advanced filtering and search
   - [ ] Export functionality (CSV, PDF)
   - [ ] Email notifications
   - [ ] Scheduled reports

8. **Scalability**
   - [ ] Horizontal scaling setup
   - [ ] Load balancer configuration
   - [ ] Database read replicas
   - [ ] Microservices migration plan
   - [ ] Message queue for async tasks

9. **Compliance & Security**
   - [ ] GDPR compliance
   - [ ] Data encryption at rest
   - [ ] Audit logging
   - [ ] Backup and disaster recovery
   - [ ] Security audit

### Long-term (Month 4+)

10. **Advanced Features**
    - [ ] Machine learning models for predictions
    - [ ] A/B testing framework
    - [ ] Multi-language support
    - [ ] Mobile app
    - [ ] API marketplace

11. **Business Features**
    - [ ] Subscription tiers
    - [ ] Usage-based billing
    - [ ] White-label solution
    - [ ] Partner program
    - [ ] API rate limiting per tier

---

## 📚 Additional Documentation

- [Webhook Setup Guide](./WEBHOOK_SETUP.md) - Configure Shopify webhooks for real-time events
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions

---

## 🎥 Demo & Screenshots

### Live Demo
🔗 **[Try the Live Application](https://shopify-analytics-platform-gamma.vercel.app)**

**Test Credentials:**
- Email: `kookie@gmail.com`
- Password: `[Your password]`

**Demo Shopify Store:**
- Store: `kookiepookie.myshopify.com`
- Contains sample products, customers, and orders for testing

### Key Features Demo
1. **Dashboard**: Real-time metrics, revenue trends, customer growth
2. **AI Insights**: Gemini-powered predictions and recommendations
3. **Custom Events**: Cart abandonment tracking, checkout funnel analytics
4. **Multi-tenant**: Support for multiple Shopify stores per user
5. **Webhooks**: Real-time event tracking and notifications

---

## 📝 Known Limitations

1. **Shopify API Rate Limits**: 2 requests/second (handled with delays)
2. **Data Sync Delay**: Up to 6 hours for automatic sync (manual sync available)
3. **Single Currency**: Currently supports USD only
4. **Webhook Requirements**: Requires publicly accessible backend URL (not localhost)
5. **Free Tier Limitations**: 
   - Render: Backend may sleep after 15 minutes of inactivity
   - Supabase: Database connection limits on free tier
   - Gemini API: Rate limits on free tier

---

## 👨‍💻 Author

**Pratibha Priyadarshini**  
FDE Internship Candidate - Xeno 2025

- Email: pratibhapriyadarshini10@gmail.com
- GitHub: [@Pratibha-Priyadarshini](https://github.com/Pratibha-Priyadarshini)
- Project Repository: [shopify-analytics-platform](https://github.com/Pratibha-Priyadarshini/shopify-analytics-platform)

---

## 📄 License

This project is created for the Xeno FDE Internship Assignment 2025.

---

## 🙏 Acknowledgments

- Xeno team for the opportunity
- Shopify for comprehensive API documentation
- Google for Gemini AI API
- Open source community for amazing tools

---

**Built with ❤️ for Xeno FDE Internship 2025**
