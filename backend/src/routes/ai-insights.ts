import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";
import { generateBusinessInsights, generatePerformanceAnalysis, generateMarketIntelligence } from "../services/gemini";

const router = express.Router();
const prisma = new PrismaClient();

// Get AI-powered insights for a tenant
router.get("/:tenantId", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    // Fetch all necessary data
    const [orders, customers, products] = await Promise.all([
      prisma.order.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.customer.findMany({
        where: { tenantId },
        include: {
          orders: {
            select: {
              totalAmount: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.product.findMany({
        where: { tenantId },
      }),
    ]);

    // Calculate revenue data
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const dailyRevenue = orders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += order.totalAmount;
      return acc;
    }, {});
    
    const revenueArray = Object.entries(dailyRevenue).map(([date, amount]) => ({
      date,
      amount: amount as number,
    }));

    // Calculate trend
    const halfPoint = Math.floor(revenueArray.length / 2);
    const firstHalf = revenueArray.slice(0, halfPoint);
    const secondHalf = revenueArray.slice(halfPoint);
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.amount, 0) / firstHalf.length || 0;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.amount, 0) / secondHalf.length || 0;
    const revenueTrend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    // Calculate customer metrics
    const activeCustomers = customers.filter(c => {
      const lastOrder = c.orders[0];
      if (!lastOrder) return false;
      const daysSince = Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince < 30;
    }).length;

    const vipCustomers = customers.filter(c => {
      const totalSpent = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return totalSpent > 5000;
    }).length;

    const churnRiskCustomers = customers.filter(c => {
      const lastOrder = c.orders[0];
      if (!lastOrder) return false;
      const daysSince = Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const totalSpent = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return daysSince > 45 && totalSpent > 1000;
    }).length;

    // Calculate product metrics
    const lowStockProducts = products.filter(p => p.inventory > 0 && p.inventory <= 10).length;
    const outOfStockProducts = products.filter(p => p.inventory === 0).length;

    const topSellers = products
      .map(p => ({
        name: p.title,
        sold: 0,
        revenue: p.price * p.inventory,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Prepare data for AI
    const businessData = {
      revenue: {
        total: totalRevenue,
        trend: revenueTrend,
        daily: revenueArray,
      },
      orders: {
        total: orders.length,
        pending: orders.filter(o => o.financialStatus === "pending").length,
        processing: orders.filter(o => o.financialStatus === "processing").length,
        fulfilled: orders.filter(o => o.fulfillmentStatus === "fulfilled").length,
      },
      customers: {
        total: customers.length,
        active: activeCustomers,
        vip: vipCustomers,
        churnRisk: churnRiskCustomers,
      },
      products: {
        total: products.length,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        topSellers,
      },
    };

    // Generate AI insights
    const [insights, performance, market] = await Promise.all([
      generateBusinessInsights(businessData),
      generatePerformanceAnalysis(businessData),
      generateMarketIntelligence(businessData),
    ]);

    res.json({
      ...insights,
      performance,
      market,
    });
  } catch (error) {
    console.error("Error generating AI insights:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

export default router;
