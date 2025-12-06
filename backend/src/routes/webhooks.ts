import express from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify Shopify webhook signature
const verifyShopifyWebhook = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
  const shopDomain = req.get("X-Shopify-Shop-Domain");
  
  if (!hmacHeader || !shopDomain) {
    console.error("Missing webhook headers");
    return res.status(401).json({ error: "Unauthorized - Missing headers" });
  }

  // Get raw body for verification
  const body = (req as any).rawBody || JSON.stringify(req.body);
  
  // Calculate HMAC
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET || "")
    .update(body, "utf8")
    .digest("base64");

  if (hash !== hmacHeader) {
    console.error("Webhook signature verification failed");
    return res.status(401).json({ error: "Unauthorized - Invalid signature" });
  }

  // Attach shop domain to request for later use
  (req as any).shopDomain = shopDomain;
  next();
};

// Helper function to find tenant by shop domain
async function findTenantByDomain(shopDomain: string) {
  return await prisma.tenant.findUnique({
    where: { shopifyDomain: shopDomain },
  });
}

// Cart Abandoned Webhook
router.post("/carts/abandoned", verifyShopifyWebhook, async (req, res) => {
  try {
    const shopDomain = (req as any).shopDomain;
    const cartData = req.body;

    const tenant = await findTenantByDomain(shopDomain);
    if (!tenant) {
      console.error(`Tenant not found for domain: ${shopDomain}`);
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Find or create customer
    let customer = null;
    if (cartData.customer) {
      customer = await prisma.customer.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: cartData.customer.id.toString(),
          },
        },
        update: {
          email: cartData.customer.email,
          firstName: cartData.customer.first_name,
          lastName: cartData.customer.last_name,
          updatedAt: new Date(),
        },
        create: {
          tenantId: tenant.id,
          shopifyId: cartData.customer.id.toString(),
          email: cartData.customer.email || `customer-${cartData.customer.id}@unknown.com`,
          firstName: cartData.customer.first_name,
          lastName: cartData.customer.last_name,
          totalSpend: 0,
          ordersCount: 0,
        },
      });
    }

    // Calculate cart value
    const cartValue = cartData.line_items?.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0) || 0;

    // Create event record
    const event = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        eventType: "CART_ABANDONED",
        customerId: customer?.shopifyId || null,
        metadata: {
          cartToken: cartData.token,
          cartId: cartData.id,
          abandonedCheckoutUrl: cartData.abandoned_checkout_url,
          email: cartData.email,
          cartValue: cartValue,
          currency: cartData.currency,
          itemCount: cartData.line_items?.length || 0,
          lineItems: cartData.line_items?.map((item: any) => ({
            productId: item.product_id,
            variantId: item.variant_id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
          createdAt: cartData.created_at,
          updatedAt: cartData.updated_at,
        },
      },
    });

    console.log(`✅ Cart abandoned event recorded for tenant ${tenant.name}:`, {
      eventId: event.id,
      cartValue,
      email: cartData.email,
    });

    res.status(200).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Error processing cart abandoned webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Checkout Started Webhook
router.post("/checkouts/create", verifyShopifyWebhook, async (req, res) => {
  try {
    const shopDomain = (req as any).shopDomain;
    const checkoutData = req.body;

    const tenant = await findTenantByDomain(shopDomain);
    if (!tenant) {
      console.error(`Tenant not found for domain: ${shopDomain}`);
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Find or create customer
    let customer = null;
    if (checkoutData.customer) {
      customer = await prisma.customer.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: checkoutData.customer.id.toString(),
          },
        },
        update: {
          email: checkoutData.customer.email,
          firstName: checkoutData.customer.first_name,
          lastName: checkoutData.customer.last_name,
          updatedAt: new Date(),
        },
        create: {
          tenantId: tenant.id,
          shopifyId: checkoutData.customer.id.toString(),
          email: checkoutData.customer.email || `customer-${checkoutData.customer.id}@unknown.com`,
          firstName: checkoutData.customer.first_name,
          lastName: checkoutData.customer.last_name,
          totalSpend: 0,
          ordersCount: 0,
        },
      });
    }

    // Create event record
    const event = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        eventType: "CHECKOUT_STARTED",
        customerId: customer?.shopifyId || null,
        metadata: {
          checkoutToken: checkoutData.token,
          checkoutId: checkoutData.id,
          email: checkoutData.email,
          totalPrice: checkoutData.total_price,
          subtotalPrice: checkoutData.subtotal_price,
          totalTax: checkoutData.total_tax,
          currency: checkoutData.currency,
          itemCount: checkoutData.line_items?.length || 0,
          lineItems: checkoutData.line_items?.map((item: any) => ({
            productId: item.product_id,
            variantId: item.variant_id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: checkoutData.shipping_address,
          billingAddress: checkoutData.billing_address,
          createdAt: checkoutData.created_at,
          updatedAt: checkoutData.updated_at,
        },
      },
    });

    console.log(`✅ Checkout started event recorded for tenant ${tenant.name}:`, {
      eventId: event.id,
      totalPrice: checkoutData.total_price,
      email: checkoutData.email,
    });

    res.status(200).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Error processing checkout started webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Checkout Updated Webhook
router.post("/checkouts/update", verifyShopifyWebhook, async (req, res) => {
  try {
    const shopDomain = (req as any).shopDomain;
    const checkoutData = req.body;

    const tenant = await findTenantByDomain(shopDomain);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    let customer = null;
    if (checkoutData.customer) {
      customer = await prisma.customer.findFirst({
        where: {
          tenantId: tenant.id,
          shopifyId: checkoutData.customer.id.toString(),
        },
      });
    }

    const event = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        eventType: "CHECKOUT_UPDATED",
        customerId: customer?.shopifyId || null,
        metadata: {
          checkoutToken: checkoutData.token,
          checkoutId: checkoutData.id,
          email: checkoutData.email,
          totalPrice: checkoutData.total_price,
          currency: checkoutData.currency,
          updatedAt: checkoutData.updated_at,
        },
      },
    });

    console.log(`✅ Checkout updated event recorded for tenant ${tenant.name}`);
    res.status(200).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Error processing checkout updated webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Order Created Webhook (for real-time order sync)
router.post("/orders/create", verifyShopifyWebhook, async (req, res) => {
  try {
    const shopDomain = (req as any).shopDomain;
    const orderData = req.body;

    const tenant = await findTenantByDomain(shopDomain);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Find or create customer
    let customer = null;
    if (orderData.customer) {
      customer = await prisma.customer.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: orderData.customer.id.toString(),
          },
        },
        update: {
          email: orderData.customer.email,
          firstName: orderData.customer.first_name,
          lastName: orderData.customer.last_name,
          totalSpend: parseFloat(orderData.customer.total_spent || "0"),
          ordersCount: orderData.customer.orders_count || 0,
          updatedAt: new Date(),
        },
        create: {
          tenantId: tenant.id,
          shopifyId: orderData.customer.id.toString(),
          email: orderData.customer.email || `customer-${orderData.customer.id}@unknown.com`,
          firstName: orderData.customer.first_name,
          lastName: orderData.customer.last_name,
          totalSpend: parseFloat(orderData.customer.total_spent || "0"),
          ordersCount: orderData.customer.orders_count || 0,
        },
      });
    }

    // Create or update order
    if (customer) {
      await prisma.order.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: orderData.id.toString(),
          },
        },
        update: {
          orderNumber: orderData.order_number?.toString() || orderData.name,
          totalAmount: parseFloat(orderData.total_price || "0"),
          currency: orderData.currency || "USD",
          financialStatus: orderData.financial_status,
          fulfillmentStatus: orderData.fulfillment_status,
          updatedAt: new Date(),
        },
        create: {
          tenantId: tenant.id,
          customerId: customer.id,
          shopifyId: orderData.id.toString(),
          orderNumber: orderData.order_number?.toString() || orderData.name,
          totalAmount: parseFloat(orderData.total_price || "0"),
          currency: orderData.currency || "USD",
          financialStatus: orderData.financial_status,
          fulfillmentStatus: orderData.fulfillment_status,
          createdAt: new Date(orderData.created_at),
        },
      });
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        eventType: "ORDER_CREATED",
        customerId: customer?.shopifyId || null,
        metadata: {
          orderId: orderData.id,
          orderNumber: orderData.order_number,
          totalPrice: orderData.total_price,
          currency: orderData.currency,
          financialStatus: orderData.financial_status,
          fulfillmentStatus: orderData.fulfillment_status,
        },
      },
    });

    console.log(`✅ Order created event recorded for tenant ${tenant.name}`);
    res.status(200).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Error processing order created webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Customer Created Webhook
router.post("/customers/create", verifyShopifyWebhook, async (req, res) => {
  try {
    const shopDomain = (req as any).shopDomain;
    const customerData = req.body;

    const tenant = await findTenantByDomain(shopDomain);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    await prisma.customer.upsert({
      where: {
        tenantId_shopifyId: {
          tenantId: tenant.id,
          shopifyId: customerData.id.toString(),
        },
      },
      update: {
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        totalSpend: parseFloat(customerData.total_spent || "0"),
        ordersCount: customerData.orders_count || 0,
        updatedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        shopifyId: customerData.id.toString(),
        email: customerData.email || `customer-${customerData.id}@unknown.com`,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        totalSpend: parseFloat(customerData.total_spent || "0"),
        ordersCount: customerData.orders_count || 0,
        createdAt: new Date(customerData.created_at),
      },
    });

    const event = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        eventType: "CUSTOMER_CREATED",
        customerId: customerData.id.toString(),
        metadata: {
          email: customerData.email,
          firstName: customerData.first_name,
          lastName: customerData.last_name,
        },
      },
    });

    console.log(`✅ Customer created event recorded for tenant ${tenant.name}`);
    res.status(200).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Error processing customer created webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Product Created/Updated Webhook
router.post("/products/create", verifyShopifyWebhook, async (req, res) => {
  try {
    const shopDomain = (req as any).shopDomain;
    const productData = req.body;

    const tenant = await findTenantByDomain(shopDomain);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const variant = productData.variants?.[0];
    await prisma.product.upsert({
      where: {
        tenantId_shopifyId: {
          tenantId: tenant.id,
          shopifyId: productData.id.toString(),
        },
      },
      update: {
        title: productData.title,
        price: parseFloat(variant?.price || "0"),
        inventory: variant?.inventory_quantity || 0,
        status: productData.status || "active",
        updatedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        shopifyId: productData.id.toString(),
        title: productData.title,
        price: parseFloat(variant?.price || "0"),
        inventory: variant?.inventory_quantity || 0,
        status: productData.status || "active",
        createdAt: new Date(productData.created_at),
      },
    });

    const event = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        eventType: "PRODUCT_CREATED",
        metadata: {
          productId: productData.id,
          title: productData.title,
          price: variant?.price,
          inventory: variant?.inventory_quantity,
        },
      },
    });

    console.log(`✅ Product created event recorded for tenant ${tenant.name}`);
    res.status(200).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Error processing product created webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
