import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers for a tenant
router.get("/:tenantId", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        orders: {
          select: {
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedCustomers = customers.map((customer) => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrder = customer.orders.length > 0 ? customer.orders[0].createdAt : null;
      
      // Determine status
      let status = "inactive";
      if (lastOrder) {
        const daysSinceLastOrder = Math.floor((Date.now() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24));
        if (totalSpent > 5000) {
          status = "vip";
        } else if (daysSinceLastOrder < 30) {
          status = "active";
        }
      }

      const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email;

      return {
        id: customer.id,
        name: customerName,
        email: customer.email,
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate: lastOrder,
        status,
        lifetimeValue: totalSpent * 1.1, // Simple LTV calculation
      };
    });

    res.json(enrichedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get customer details
router.get("/:tenantId/:customerId", authMiddleware, async (req, res) => {
  try {
    const { tenantId, customerId } = req.params;
    
    const customer = await prisma.customer.findFirst({
      where: { 
        id: customerId,
        tenantId 
      },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer details:", error);
    res.status(500).json({ error: "Failed to fetch customer details" });
  }
});

export default router;
