import axios from "axios";
import { ShopifyConfig } from "./shopifyService";

export interface WebhookTopic {
  topic: string;
  address: string;
}

export class WebhookService {
  private baseUrl: string;
  private headers: any;

  constructor(config: ShopifyConfig) {
    this.baseUrl = `https://${config.shopifyDomain}/admin/api/2024-01`;
    this.headers = {
      "X-Shopify-Access-Token": config.accessToken,
      "Content-Type": "application/json",
    };
  }

  /**
   * Register a webhook with Shopify
   */
  async registerWebhook(topic: string, address: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhooks.json`,
        {
          webhook: {
            topic,
            address,
            format: "json",
          },
        },
        { headers: this.headers }
      );
      return response.data.webhook;
    } catch (error: any) {
      if (error.response?.status === 422) {
        // Webhook might already exist
        console.log(`Webhook for ${topic} might already exist`);
        return null;
      }
      console.error(`Error registering webhook ${topic}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get all registered webhooks
   */
  async getWebhooks(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/webhooks.json`, {
        headers: this.headers,
      });
      return response.data.webhooks || [];
    } catch (error: any) {
      console.error("Error fetching webhooks:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/webhooks/${webhookId}.json`, {
        headers: this.headers,
      });
    } catch (error: any) {
      console.error(`Error deleting webhook ${webhookId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Register all required webhooks for the application
   */
  async registerAllWebhooks(baseWebhookUrl: string): Promise<any[]> {
    const webhookTopics = [
      { topic: "carts/create", endpoint: "/webhooks/carts/abandoned" },
      { topic: "carts/update", endpoint: "/webhooks/carts/abandoned" },
      { topic: "checkouts/create", endpoint: "/webhooks/checkouts/create" },
      { topic: "checkouts/update", endpoint: "/webhooks/checkouts/update" },
      { topic: "orders/create", endpoint: "/webhooks/orders/create" },
      { topic: "orders/updated", endpoint: "/webhooks/orders/create" },
      { topic: "customers/create", endpoint: "/webhooks/customers/create" },
      { topic: "customers/update", endpoint: "/webhooks/customers/create" },
      { topic: "products/create", endpoint: "/webhooks/products/create" },
      { topic: "products/update", endpoint: "/webhooks/products/create" },
    ];

    const results = [];
    for (const { topic, endpoint } of webhookTopics) {
      try {
        const webhook = await this.registerWebhook(topic, `${baseWebhookUrl}${endpoint}`);
        if (webhook) {
          results.push({ topic, status: "registered", id: webhook.id });
          console.log(`✅ Registered webhook: ${topic}`);
        } else {
          results.push({ topic, status: "already_exists" });
          console.log(`ℹ️  Webhook already exists: ${topic}`);
        }
      } catch (error: any) {
        results.push({ topic, status: "failed", error: error.message });
        console.error(`❌ Failed to register webhook: ${topic}`);
      }
    }

    return results;
  }

  /**
   * Unregister all webhooks
   */
  async unregisterAllWebhooks(): Promise<void> {
    try {
      const webhooks = await this.getWebhooks();
      for (const webhook of webhooks) {
        await this.deleteWebhook(webhook.id);
        console.log(`✅ Deleted webhook: ${webhook.topic}`);
      }
    } catch (error) {
      console.error("Error unregistering webhooks:", error);
      throw error;
    }
  }

  /**
   * Check webhook health (verify they're still registered)
   */
  async checkWebhookHealth(): Promise<any> {
    try {
      const webhooks = await this.getWebhooks();
      return {
        total: webhooks.length,
        webhooks: webhooks.map((w) => ({
          id: w.id,
          topic: w.topic,
          address: w.address,
          createdAt: w.created_at,
        })),
      };
    } catch (error) {
      console.error("Error checking webhook health:", error);
      throw error;
    }
  }
}
