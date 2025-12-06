import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// Get summary statistics
router.get("/:tenantId/summary", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verify tenant belongs to user
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, userId: req.userId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const [
      totalCustomers,
      totalOrders,
      totalProducts,
      orders,
      recentOrders,
    ] = await Promise.all([
      prisma.customer.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.product.count({ where: { tenantId } }),
      prisma.order.findMany({ 
        where: { tenantId },
        select: { totalAmount: true, createdAt: true }
      }),
      prisma.order.findMany({
        where: { tenantId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalCustomers,
      totalOrders,
      totalProducts,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      recentOrders,
    });
  } catch (error: any) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ 
      error: "Failed to fetch summary",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get orders by date range
router.get("/:tenantId/orders-by-date", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    const { startDate, endDate } = req.query;

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, userId: req.userId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const whereClause: any = { tenantId };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        createdAt: true,
        financialStatus: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Group by date
    const ordersByDate = orders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, revenue: 0, orders: [] };
      }
      acc[date].count++;
      acc[date].revenue += order.totalAmount;
      acc[date].orders.push(order);
      return acc;
    }, {});

    res.json(Object.values(ordersByDate));
  } catch (error) {
    console.error("Error fetching orders by date:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get top customers by spend
router.get("/:tenantId/top-customers", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, userId: req.userId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const topCustomers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { totalSpend: "desc" },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalSpend: true,
        ordersCount: true,
      },
    });

    res.json(topCustomers);
  } catch (error) {
    console.error("Error fetching top customers:", error);
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
});

// Get revenue trend (daily for last 30 days)
router.get("/:tenantId/revenue-trend", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, userId: req.userId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const revenueByDate = orders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.totalAmount;
      acc[date].orders++;
      return acc;
    }, {});

    res.json(Object.values(revenueByDate));
  } catch (error: any) {
    console.error("Error fetching revenue trend:", error);
    res.status(500).json({ 
      error: "Failed to fetch revenue trend",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get customer growth trend
router.get("/:tenantId/customer-growth", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, userId: req.userId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date and calculate cumulative
    const customersByDate = customers.reduce((acc: any, customer) => {
      const date = customer.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, newCustomers: 0 };
      }
      acc[date].newCustomers++;
      return acc;
    }, {});

    res.json(Object.values(customersByDate));
  } catch (error) {
    console.error("Error fetching customer growth:", error);
    res.status(500).json({ error: "Failed to fetch customer growth" });
  }
});

// Get product performance
router.get("/:tenantId/product-performance", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, userId: req.userId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const products = await prisma.product.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        price: true,
        inventory: true,
        status: true,
      },
      orderBy: { inventory: "desc" },
      take: 10,
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching product performance:", error);
    res.status(500).json({ error: "Failed to fetch product performance" });
  }
});

export default router;
