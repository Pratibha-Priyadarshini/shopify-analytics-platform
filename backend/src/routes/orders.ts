import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get all orders for a tenant
router.get("/:tenantId", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { status, startDate, endDate, limit } = req.query;
    
    const where: any = { tenantId };
    
    if (status && status !== "all") {
      where.financialStatus = status;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit as string) : undefined,
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || "Guest" : "Guest",
      customerEmail: order.customer?.email || "",
      date: order.createdAt,
      status: order.financialStatus || "pending",
      total: order.totalAmount,
      items: 1, // Default since we don't have line items in schema
      paymentMethod: "Credit Card",
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get order details
router.get("/:tenantId/:orderId", authMiddleware, async (req, res) => {
  try {
    const { tenantId, orderId } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        tenantId 
      },
      include: {
        customer: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Get order statistics
router.get("/:tenantId/stats/summary", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
    });

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.financialStatus === "pending").length,
      processing: orders.filter(o => o.financialStatus === "processing").length,
      shipped: orders.filter(o => o.fulfillmentStatus === "fulfilled").length,
      delivered: orders.filter(o => o.fulfillmentStatus === "fulfilled").length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ error: "Failed to fetch order statistics" });
  }
});

export default router;
