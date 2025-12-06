import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get all products for a tenant
router.get("/:tenantId", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { category, status } = req.query;
    
    const where: any = { tenantId };

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const enrichedProducts = products.map((product) => {
      // Determine stock status
      let stockStatus = "in-stock";
      const inventory = product.inventory;
      if (inventory === 0) {
        stockStatus = "out-of-stock";
      } else if (inventory < 10) {
        stockStatus = "low-stock";
      }

      // Simple trend calculation based on status
      let trend = "stable";
      if (product.status === "active" && inventory > 20) trend = "up";
      else if (inventory < 5) trend = "down";

      return {
        id: product.id,
        name: product.title,
        sku: `SKU-${product.id.slice(0, 8)}`,
        category: "General",
        price: product.price,
        stock: inventory,
        sold: 0, // Would need order line items to calculate
        revenue: 0, // Would need order line items to calculate
        status: stockStatus,
        trend,
        image: null,
      };
    });

    // Apply status filter if provided
    let filteredProducts = enrichedProducts;
    if (status && status !== "all") {
      filteredProducts = enrichedProducts.filter(p => p.status === status);
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get product details
router.get("/:tenantId/:productId", authMiddleware, async (req, res) => {
  try {
    const { tenantId, productId } = req.params;
    
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        tenantId 
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

// Get product statistics
router.get("/:tenantId/stats/summary", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const products = await prisma.product.findMany({
      where: { tenantId },
    });

    const stats = {
      total: products.length,
      inStock: products.filter(p => p.inventory > 10).length,
      lowStock: products.filter(p => p.inventory > 0 && p.inventory <= 10).length,
      outOfStock: products.filter(p => p.inventory === 0).length,
      totalRevenue: 0, // Would need order line items
      totalSold: 0, // Would need order line items
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res.status(500).json({ error: "Failed to fetch product statistics" });
  }
});

export default router;
