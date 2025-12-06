import axios from "axios";

export interface ShopifyConfig {
  shopifyDomain: string;
  accessToken: string;
}

export class ShopifyService {
  private baseUrl: string;
  private headers: any;

  constructor(config: ShopifyConfig) {
    this.baseUrl = `https://${config.shopifyDomain}/admin/api/2024-01`;
    this.headers = {
      "X-Shopify-Access-Token": config.accessToken,
      "Content-Type": "application/json",
    };
  }

  async getCustomers(limit = 250) {
    try {
      const response = await axios.get(`${this.baseUrl}/customers.json`, {
        headers: this.headers,
        params: { limit },
      });
      return response.data.customers;
    } catch (error: any) {
      console.error("Error fetching customers:", error.response?.data || error.message);
      throw error;
    }
  }

  async getOrders(limit = 250, status = "any") {
    try {
      const response = await axios.get(`${this.baseUrl}/orders.json`, {
        headers: this.headers,
        params: { limit, status },
      });
      return response.data.orders;
    } catch (error: any) {
      console.error("Error fetching orders:", error.response?.data || error.message);
      throw error;
    }
  }

  async getProducts(limit = 250) {
    try {
      const response = await axios.get(`${this.baseUrl}/products.json`, {
        headers: this.headers,
        params: { limit },
      });
      return response.data.products;
    } catch (error: any) {
      console.error("Error fetching products:", error.response?.data || error.message);
      throw error;
    }
  }

  async getCheckouts() {
    try {
      const response = await axios.get(`${this.baseUrl}/checkouts.json`, {
        headers: this.headers,
      });
      return response.data.checkouts || [];
    } catch (error: any) {
      // Checkouts endpoint might not be available in all plans
      console.warn("Checkouts not available:", error.response?.data || error.message);
      return [];
    }
  }

  async verifyWebhook(body: string, hmacHeader: string): Promise<boolean> {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET || "")
      .update(body, "utf8")
      .digest("base64");
    return hash === hmacHeader;
  }
}
