import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { IngestionService } from "../services/ingestionService";
import { ShopifyService } from "../services/shopifyService";

const prisma = new PrismaClient();
const router = Router();

// Webhook endpoint for Shopify events
router.post("/webhooks/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;
    const topic = req.headers["x-shopify-topic"] as string;
    const hmac = req.headers["x-shopify-hmac-sha256"] as string;

    // Verify webhook authenticity
    // In production, you should verify the HMAC
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    console.log(`Received webhook: ${topic} for tenant ${tenantId}`);

    // Handle different webhook topics
    switch (topic) {
      case "customers/create":
      case "customers/update":
        await handleCustomerWebhook(req.body, tenantId);
        break;
      case "orders/create":
      case "orders/updated":
        await handleOrderWebhook(req.body, tenantId);
        break;
      case "products/create":
      case "products/update":
        await handleProductWebhook(req.body, tenantId);
        break;
      case "checkouts/create":
      case "checkouts/update":
        await handleCheckoutWebhook(req.body, tenantId);
        break;
      case "carts/create":
      case "carts/update":
        await handleCartWebhook(req.body, tenantId);
        break;
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

async function handleCustomerWebhook(data: any, tenantId: string) {
  await prisma.customer.upsert({
    where: {
      tenantId_shopifyId: {
        tenantId,
        shopifyId: data.id.toString(),
      },
    },
    update: {
      email: data.email || `customer-${data.id}@unknown.com`,
      firstName: data.first_name,
      lastName: data.last_name,
      totalSpend: parseFloat(data.total_spent || "0"),
      ordersCount: data.orders_count || 0,
      updatedAt: new Date(),
    },
    create: {
      tenantId,
      shopifyId: data.id.toString(),
      email: data.email || `customer-${data.id}@unknown.com`,
      firstName: data.first_name,
      lastName: data.last_name,
      totalSpend: parseFloat(data.total_spent || "0"),
      ordersCount: data.orders_count || 0,
      createdAt: new Date(data.created_at),
    },
  });
}

async function handleOrderWebhook(data: any, tenantId: string) {
  // Ensure customer exists
  let customer = await prisma.customer.findFirst({
    where: {
      tenantId,
      shopifyId: data.customer?.id?.toString() || "0",
    },
  });

  if (!customer && data.customer) {
    customer = await prisma.customer.create({
      data: {
        tenantId,
        shopifyId: data.customer.id.toString(),
        email: data.customer.email || `customer-${data.customer.id}@unknown.com`,
        firstName: data.customer.first_name,
        lastName: data.customer.last_name,
        totalSpend: parseFloat(data.customer.total_spent || "0"),
        ordersCount: data.customer.orders_count || 0,
        createdAt: new Date(data.customer.created_at),
      },
    });
  }

  if (customer) {
    await prisma.order.upsert({
      where: {
        tenantId_shopifyId: {
          tenantId,
          shopifyId: data.id.toString(),
        },
      },
      update: {
        orderNumber: data.order_number?.toString() || data.name,
        totalAmount: parseFloat(data.total_price || "0"),
        currency: data.currency || "USD",
        financialStatus: data.financial_status,
        fulfillmentStatus: data.fulfillment_status,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        customerId: customer.id,
        shopifyId: data.id.toString(),
        orderNumber: data.order_number?.toString() || data.name,
        totalAmount: parseFloat(data.total_price || "0"),
        currency: data.currency || "USD",
        financialStatus: data.financial_status,
        fulfillmentStatus: data.fulfillment_status,
        createdAt: new Date(data.created_at),
      },
    });
  }
}

async function handleProductWebhook(data: any, tenantId: string) {
  const variant = data.variants?.[0];
  await prisma.product.upsert({
    where: {
      tenantId_shopifyId: {
        tenantId,
        shopifyId: data.id.toString(),
      },
    },
    update: {
      title: data.title,
      price: parseFloat(variant?.price || "0"),
      inventory: variant?.inventory_quantity || 0,
      status: data.status || "active",
      updatedAt: new Date(),
    },
    create: {
      tenantId,
      shopifyId: data.id.toString(),
      title: data.title,
      price: parseFloat(variant?.price || "0"),
      inventory: variant?.inventory_quantity || 0,
      status: data.status || "active",
      createdAt: new Date(data.created_at),
    },
  });
}

async function handleCheckoutWebhook(data: any, tenantId: string) {
  await prisma.event.create({
    data: {
      tenantId,
      eventType: "checkout_started",
      customerId: data.customer?.id?.toString(),
      metadata: data,
    },
  });
}

async function handleCartWebhook(data: any, tenantId: string) {
  await prisma.event.create({
    data: {
      tenantId,
      eventType: data.abandoned ? "cart_abandoned" : "cart_updated",
      customerId: data.customer?.id?.toString(),
      metadata: data,
    },
  });
}

export default router;
