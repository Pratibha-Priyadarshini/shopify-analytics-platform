import express from "express";
import cors from "cors";
import dotenv = require('dotenv');
import tenantRoutes from "./routes/tenants";
import shopifyRoutes from "./routes/shopify";
import insightsRoutes from "./routes/insights";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tenants", tenantRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/insights", insightsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
