import express from "express";
import cors from "cors";
import dotenv = require('dotenv');
import authRoutes from "./routes/auth";
import tenantRoutes from "./routes/tenants";
import shopifyRoutes from "./routes/shopify";
import insightsRoutes from "./routes/insights";
import ordersRoutes from "./routes/orders";
import customersRoutes from "./routes/customers";
import productsRoutes from "./routes/products";
import aiInsightsRoutes from "./routes/ai-insights";
import recommendationsRoutes from "./routes/recommendations";
import webhooksRoutes from "./routes/webhooks";
import eventsRoutes from "./routes/events";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// Special handling for webhooks - need raw body for signature verification
app.use("/api/webhooks", express.raw({ type: "application/json" }), (req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    (req as any).rawBody = req.body.toString("utf8");
    try {
      req.body = JSON.parse((req as any).rawBody);
    } catch (e) {
      req.body = {};
    }
  }
  next();
});

// Regular JSON parsing for other routes
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/ai-insights", aiInsightsRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/webhooks", webhooksRoutes);
app.use("/api/events", eventsRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  
  // Start the scheduler for periodic syncs
  if (process.env.ENABLE_SCHEDULER !== "false") {
    const { startScheduler } = require("./scheduler");
    startScheduler();
  }
});
