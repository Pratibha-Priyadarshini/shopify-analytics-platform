import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get all events for a tenant
router.get("/:tenantId", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { eventType, limit = "50", offset = "0" } = req.query;

    const where: any = { tenantId };
    if (eventType) {
      where.eventType = eventType;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.event.count({ where });

    res.json({
      events,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get event statistics
router.get("/:tenantId/stats", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { days = "30" } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    // Get event counts by type
    const eventCounts = await prisma.event.groupBy({
      by: ["eventType"],
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Get cart abandonment stats
    const cartAbandoned = await prisma.event.findMany({
      where: {
        tenantId,
        eventType: "CART_ABANDONED",
        createdAt: { gte: startDate },
      },
      select: {
        metadata: true,
      },
    });

    const totalAbandonedValue = cartAbandoned.reduce((sum, event: any) => {
      return sum + (parseFloat(event.metadata?.cartValue) || 0);
    }, 0);

    // Get checkout stats
    const checkoutsStarted = await prisma.event.count({
      where: {
        tenantId,
        eventType: "CHECKOUT_STARTED",
        createdAt: { gte: startDate },
      },
    });

    const ordersCreated = await prisma.event.count({
      where: {
        tenantId,
        eventType: "ORDER_CREATED",
        createdAt: { gte: startDate },
      },
    });

    const conversionRate = checkoutsStarted > 0 
      ? ((ordersCreated / checkoutsStarted) * 100).toFixed(2)
      : "0.00";

    // Get recent abandoned carts with details
    const recentAbandonedCarts = await prisma.event.findMany({
      where: {
        tenantId,
        eventType: "CART_ABANDONED",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        customerId: true,
        metadata: true,
      },
    });

    res.json({
      eventCounts: eventCounts.map((ec) => ({
        type: ec.eventType,
        count: ec._count,
      })),
      cartAbandonment: {
        total: cartAbandoned.length,
        totalValue: totalAbandonedValue.toFixed(2),
        averageValue: cartAbandoned.length > 0 
          ? (totalAbandonedValue / cartAbandoned.length).toFixed(2)
          : "0.00",
      },
      checkoutFunnel: {
        checkoutsStarted,
        ordersCreated,
        conversionRate: `${conversionRate}%`,
        abandonmentRate: `${(100 - parseFloat(conversionRate)).toFixed(2)}%`,
      },
      recentAbandonedCarts: recentAbandonedCarts.map((cart: any) => ({
        id: cart.id,
        createdAt: cart.createdAt,
        email: cart.metadata?.email,
        cartValue: cart.metadata?.cartValue,
        itemCount: cart.metadata?.itemCount,
        abandonedCheckoutUrl: cart.metadata?.abandonedCheckoutUrl,
      })),
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    res.status(500).json({ error: "Failed to fetch event statistics" });
  }
});

// Get cart abandonment details
router.get("/:tenantId/abandoned-carts", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { limit = "20", offset = "0" } = req.query;

    const abandonedCarts = await prisma.event.findMany({
      where: {
        tenantId,
        eventType: "CART_ABANDONED",
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.event.count({
      where: {
        tenantId,
        eventType: "CART_ABANDONED",
      },
    });

    const formattedCarts = abandonedCarts.map((cart: any) => ({
      id: cart.id,
      createdAt: cart.createdAt,
      email: cart.metadata?.email,
      cartValue: cart.metadata?.cartValue,
      currency: cart.metadata?.currency,
      itemCount: cart.metadata?.itemCount,
      lineItems: cart.metadata?.lineItems,
      abandonedCheckoutUrl: cart.metadata?.abandonedCheckoutUrl,
      customerId: cart.customerId,
    }));

    res.json({
      abandonedCarts: formattedCarts,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error("Error fetching abandoned carts:", error);
    res.status(500).json({ error: "Failed to fetch abandoned carts" });
  }
});

// Get checkout funnel data
router.get("/:tenantId/checkout-funnel", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { days = "30" } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    // Get daily funnel data
    const checkouts = await prisma.event.findMany({
      where: {
        tenantId,
        eventType: { in: ["CHECKOUT_STARTED", "ORDER_CREATED"] },
        createdAt: { gte: startDate },
      },
      select: {
        eventType: true,
        createdAt: true,
        metadata: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const funnelByDate: any = {};
    checkouts.forEach((event) => {
      const date = event.createdAt.toISOString().split("T")[0];
      if (!funnelByDate[date]) {
        funnelByDate[date] = { checkoutsStarted: 0, ordersCreated: 0 };
      }
      if (event.eventType === "CHECKOUT_STARTED") {
        funnelByDate[date].checkoutsStarted++;
      } else if (event.eventType === "ORDER_CREATED") {
        funnelByDate[date].ordersCreated++;
      }
    });

    const funnelData = Object.entries(funnelByDate).map(([date, data]: [string, any]) => ({
      date,
      checkoutsStarted: data.checkoutsStarted,
      ordersCreated: data.ordersCreated,
      conversionRate: data.checkoutsStarted > 0
        ? ((data.ordersCreated / data.checkoutsStarted) * 100).toFixed(2)
        : "0.00",
    }));

    res.json({ funnelData });
  } catch (error) {
    console.error("Error fetching checkout funnel:", error);
    res.status(500).json({ error: "Failed to fetch checkout funnel data" });
  }
});

export default router;
