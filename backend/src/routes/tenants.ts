import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ShopifyService } from "../services/shopifyService";
import { IngestionService } from "../services/ingestionService";
import { WebhookService } from "../services/webhookService";

const prisma = new PrismaClient();
const router = Router();

// Create a new tenant (Shopify store connection)
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, shopifyDomain, accessToken } = req.body;
    
    if (!name || !shopifyDomain || !accessToken) {
      return res.status(400).json({ 
        error: "Name, shopifyDomain, and accessToken are required" 
      });
    }

    // Verify Shopify credentials by making a test API call
    const shopifyService = new ShopifyService({ shopifyDomain, accessToken });
    try {
      await shopifyService.getCustomers(1);
    } catch (error: any) {
      console.error("Shopify verification failed:", error.response?.data || error.message);
      return res.status(400).json({ 
        error: "Invalid Shopify credentials or domain. Please check your store domain and access token." 
      });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        shopifyDomain,
        accessToken,
        userId: req.userId!,
      },
    });

    res.status(201).json({
      id: tenant.id,
      name: tenant.name,
      shopifyDomain: tenant.shopifyDomain,
      createdAt: tenant.createdAt,
    });
  } catch (error: any) {
    console.error("Error creating tenant:", error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: "A store with this Shopify domain already exists. Please use a different domain or delete the existing store first." 
      });
    }
    
    res.status(500).json({ error: "Failed to create tenant" });
  }
});

// Get all tenants for the authenticated user
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        name: true,
        shopifyDomain: true,
        createdAt: true,
        lastSyncAt: true,
      },
    });
    res.json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
});

// Get a specific tenant
router.get("/:tenantId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        userId: req.userId,
      },
      select: {
        id: true,
        name: true,
        shopifyDomain: true,
        createdAt: true,
        lastSyncAt: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.json(tenant);
  } catch (error) {
    console.error("Error fetching tenant:", error);
    res.status(500).json({ error: "Failed to fetch tenant" });
  }
});

// Trigger manual sync for a tenant
router.post("/:tenantId/sync", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        userId: req.userId,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const shopifyService = new ShopifyService({
      shopifyDomain: tenant.shopifyDomain,
      accessToken: tenant.accessToken,
    });

    const ingestionService = new IngestionService(shopifyService, tenantId);
    const results = await ingestionService.syncAll();

    res.json({
      message: "Sync completed successfully",
      results,
    });
  } catch (error: any) {
    console.error("Error syncing tenant:", error);
    res.status(500).json({ 
      error: "Failed to sync tenant data",
      details: error.message 
    });
  }
});

// Delete a tenant
router.delete("/:tenantId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        userId: req.userId,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    res.json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    res.status(500).json({ error: "Failed to delete tenant" });
  }
});

// Register webhooks for a tenant
router.post("/:tenantId/webhooks/register", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        userId: req.userId,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const webhookService = new WebhookService({
      shopifyDomain: tenant.shopifyDomain,
      accessToken: tenant.accessToken,
    });

    // Get base webhook URL from environment or request
    const baseWebhookUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}/api`;
    
    const results = await webhookService.registerAllWebhooks(baseWebhookUrl);

    res.json({
      message: "Webhook registration completed",
      results,
      webhookUrl: baseWebhookUrl,
    });
  } catch (error: any) {
    console.error("Error registering webhooks:", error);
    res.status(500).json({ 
      error: "Failed to register webhooks",
      details: error.message 
    });
  }
});

// Get registered webhooks for a tenant
router.get("/:tenantId/webhooks", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        userId: req.userId,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const webhookService = new WebhookService({
      shopifyDomain: tenant.shopifyDomain,
      accessToken: tenant.accessToken,
    });

    const health = await webhookService.checkWebhookHealth();

    res.json(health);
  } catch (error: any) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({ 
      error: "Failed to fetch webhooks",
      details: error.message 
    });
  }
});

// Unregister all webhooks for a tenant
router.delete("/:tenantId/webhooks", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        userId: req.userId,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const webhookService = new WebhookService({
      shopifyDomain: tenant.shopifyDomain,
      accessToken: tenant.accessToken,
    });

    await webhookService.unregisterAllWebhooks();

    res.json({ message: "All webhooks unregistered successfully" });
  } catch (error: any) {
    console.error("Error unregistering webhooks:", error);
    res.status(500).json({ 
      error: "Failed to unregister webhooks",
      details: error.message 
    });
  }
});

export default router;
