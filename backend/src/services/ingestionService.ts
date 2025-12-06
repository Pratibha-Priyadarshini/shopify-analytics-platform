import { PrismaClient } from "@prisma/client";
import { ShopifyService } from "./shopifyService";

const prisma = new PrismaClient();

export class IngestionService {
  private shopifyService: ShopifyService;
  private tenantId: string;

  constructor(shopifyService: ShopifyService, tenantId: string) {
    this.shopifyService = shopifyService;
    this.tenantId = tenantId;
  }

  async syncCustomers() {
    const customers = await this.shopifyService.getCustomers();
    const results = [];

    for (const shopifyCustomer of customers) {
      const customerData = {
        tenantId: this.tenantId,
        shopifyId: shopifyCustomer.id.toString(),
        email: shopifyCustomer.email || `customer-${shopifyCustomer.id}@unknown.com`,
        firstName: shopifyCustomer.first_name,
        lastName: shopifyCustomer.last_name,
        totalSpend: parseFloat(shopifyCustomer.total_spent || "0"),
        ordersCount: shopifyCustomer.orders_count || 0,
        updatedAt: new Date(),
      };

      const customer = await prisma.customer.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: this.tenantId,
            shopifyId: shopifyCustomer.id.toString(),
          },
        },
        update: customerData,
        create: {
          ...customerData,
          createdAt: new Date(shopifyCustomer.created_at),
        },
      });

      results.push(customer);
    }

    return results;
  }

  async syncOrders() {
    const orders = await this.shopifyService.getOrders();
    const results = [];

    for (const shopifyOrder of orders) {
      // First ensure customer exists
      let customer = await prisma.customer.findFirst({
        where: {
          tenantId: this.tenantId,
          shopifyId: shopifyOrder.customer?.id?.toString() || "0",
        },
      });

      // If customer doesn't exist, create a placeholder
      if (!customer && shopifyOrder.customer) {
        customer = await prisma.customer.create({
          data: {
            tenantId: this.tenantId,
            shopifyId: shopifyOrder.customer.id.toString(),
            email: shopifyOrder.customer.email || `customer-${shopifyOrder.customer.id}@unknown.com`,
            firstName: shopifyOrder.customer.first_name,
            lastName: shopifyOrder.customer.last_name,
            totalSpend: parseFloat(shopifyOrder.customer.total_spent || "0"),
            ordersCount: shopifyOrder.customer.orders_count || 0,
            createdAt: new Date(shopifyOrder.customer.created_at),
          },
        });
      }

      if (customer) {
        const orderData = {
          tenantId: this.tenantId,
          customerId: customer.id,
          shopifyId: shopifyOrder.id.toString(),
          orderNumber: shopifyOrder.order_number?.toString() || shopifyOrder.name,
          totalAmount: parseFloat(shopifyOrder.total_price || "0"),
          currency: shopifyOrder.currency || "USD",
          financialStatus: shopifyOrder.financial_status,
          fulfillmentStatus: shopifyOrder.fulfillment_status,
          createdAt: new Date(shopifyOrder.created_at),
          updatedAt: new Date(),
        };

        const order = await prisma.order.upsert({
          where: {
            tenantId_shopifyId: {
              tenantId: this.tenantId,
              shopifyId: shopifyOrder.id.toString(),
            },
          },
          update: orderData,
          create: orderData,
        });

        results.push(order);
      }
    }

    return results;
  }

  async syncProducts() {
    const products = await this.shopifyService.getProducts();
    const results = [];

    for (const shopifyProduct of products) {
      const variant = shopifyProduct.variants?.[0];
      const productData = {
        tenantId: this.tenantId,
        shopifyId: shopifyProduct.id.toString(),
        title: shopifyProduct.title,
        price: parseFloat(variant?.price || "0"),
        inventory: variant?.inventory_quantity || 0,
        status: shopifyProduct.status || "active",
        createdAt: new Date(shopifyProduct.created_at),
        updatedAt: new Date(),
      };

      const product = await prisma.product.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: this.tenantId,
            shopifyId: shopifyProduct.id.toString(),
          },
        },
        update: productData,
        create: productData,
      });

      results.push(product);
    }

    return results;
  }

  async syncAll() {
    console.log(`Starting full sync for tenant ${this.tenantId}`);
    
    const customers = await this.syncCustomers();
    console.log(`Synced ${customers.length} customers`);
    
    const orders = await this.syncOrders();
    console.log(`Synced ${orders.length} orders`);
    
    const products = await this.syncProducts();
    console.log(`Synced ${products.length} products`);

    // Update last sync time
    await prisma.tenant.update({
      where: { id: this.tenantId },
      data: { lastSyncAt: new Date() },
    });

    return {
      customers: customers.length,
      orders: orders.length,
      products: products.length,
    };
  }
}
