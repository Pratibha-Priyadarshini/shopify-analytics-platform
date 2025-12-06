# Shopify Webhook Setup Guide

This guide explains how to set up Shopify webhooks to enable real-time event tracking for cart abandonments, checkouts, and other custom events.

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Methods](#setup-methods)
- [Webhook Events](#webhook-events)
- [Testing Webhooks](#testing-webhooks)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Webhooks allow Shopify to send real-time notifications to your application when specific events occur in your store. This enables:

- **Cart Abandonment Tracking**: Know when customers leave items in their cart
- **Checkout Monitoring**: Track when customers start and complete checkouts
- **Real-time Data Sync**: Automatically update orders, customers, and products
- **Conversion Analytics**: Calculate checkout-to-order conversion rates

---

## ✅ Prerequisites

1. **Deployed Backend**: Your backend must be publicly accessible (not localhost)
   - Use Render, Heroku, Railway, or similar
   - Example: `https://your-app.onrender.com`

2. **Shopify Store**: Development or production store with Admin API access

3. **Environment Variables**: Set in your backend `.env`:
   ```env
   SHOPIFY_WEBHOOK_SECRET="your-webhook-secret-here"
   BACKEND_URL="https://your-backend-url.com/api"
   ```

4. **Webhook Secret**: Generate a random secret for webhook verification
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## 🚀 Setup Methods

### Method 1: Automatic Registration (Recommended)

Use the built-in API endpoint to register all webhooks automatically:

```bash
# 1. Get your tenant ID from the dashboard or API
TENANT_ID="your-tenant-id"
AUTH_TOKEN="your-jwt-token"

# 2. Register webhooks via API
curl -X POST "https://your-backend.com/api/tenants/${TENANT_ID}/webhooks/register" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Webhook registration completed",
  "results": [
    { "topic": "carts/create", "status": "registered", "id": "123456" },
    { "topic": "checkouts/create", "status": "registered", "id": "123457" },
    { "topic": "orders/create", "status": "registered", "id": "123458" }
  ],
  "webhookUrl": "https://your-backend.com/api"
}
```

### Method 2: Manual Registration via Shopify Admin

1. **Go to Shopify Admin**:
   - Settings → Notifications → Webhooks

2. **Create Webhook** for each event:
   - Click "Create webhook"
   - Select Event (e.g., "Cart creation")
   - Format: JSON
   - URL: `https://your-backend.com/api/webhooks/carts/abandoned`
   - Webhook API version: 2024-01

3. **Repeat for all events** (see list below)

### Method 3: Using Shopify CLI

```bash
# Install Shopify CLI
npm install -g @shopify/cli

# Login to your store
shopify login --store your-store.myshopify.com

# Create webhooks
shopify webhook create \
  --topic carts/create \
  --address https://your-backend.com/api/webhooks/carts/abandoned \
  --api-version 2024-01
```

---

## 📡 Webhook Events

### Registered Webhook Topics

| Event | Topic | Endpoint | Description |
|-------|-------|----------|-------------|
| **Cart Abandoned** | `carts/create`, `carts/update` | `/webhooks/carts/abandoned` | Triggered when a cart is created or updated (potential abandonment) |
| **Checkout Started** | `checkouts/create` | `/webhooks/checkouts/create` | Customer begins checkout process |
| **Checkout Updated** | `checkouts/update` | `/webhooks/checkouts/update` | Checkout information is modified |
| **Order Created** | `orders/create` | `/webhooks/orders/create` | New order is placed |
| **Order Updated** | `orders/updated` | `/webhooks/orders/create` | Order status changes |
| **Customer Created** | `customers/create` | `/webhooks/customers/create` | New customer account created |
| **Customer Updated** | `customers/update` | `/webhooks/customers/create` | Customer information updated |
| **Product Created** | `products/create` | `/webhooks/products/create` | New product added |
| **Product Updated** | `products/update` | `/webhooks/products/create` | Product information changed |

### Webhook Payload Examples

**Cart Abandoned:**
```json
{
  "id": 123456789,
  "token": "abc123",
  "email": "customer@example.com",
  "abandoned_checkout_url": "https://store.com/cart/abc123",
  "line_items": [
    {
      "product_id": 789,
      "variant_id": 456,
      "title": "Product Name",
      "quantity": 2,
      "price": "29.99"
    }
  ],
  "total_price": "59.98",
  "currency": "USD",
  "created_at": "2025-12-06T10:00:00Z"
}
```

**Checkout Started:**
```json
{
  "id": 987654321,
  "token": "xyz789",
  "email": "customer@example.com",
  "total_price": "149.99",
  "subtotal_price": "139.99",
  "total_tax": "10.00",
  "currency": "USD",
  "line_items": [...],
  "shipping_address": {...},
  "billing_address": {...},
  "created_at": "2025-12-06T10:05:00Z"
}
```

---

## 🧪 Testing Webhooks

### 1. Test with Shopify Admin

1. Go to Settings → Notifications → Webhooks
2. Click on a webhook
3. Click "Send test notification"
4. Check your backend logs for the event

### 2. Test with ngrok (Local Development)

```bash
# Install ngrok
npm install -g ngrok

# Start your backend locally
cd backend
npm run dev

# In another terminal, expose your local server
ngrok http 4000

# Use the ngrok URL for webhook registration
# Example: https://abc123.ngrok.io/api/webhooks/carts/abandoned
```

### 3. Verify Webhook Reception

Check your backend logs:
```bash
# You should see logs like:
✅ Cart abandoned event recorded for tenant My Store: {
  eventId: 'uuid-here',
  cartValue: 59.98,
  email: 'customer@example.com'
}
```

### 4. Check Database

```bash
# Connect to your database
psql $DATABASE_URL

# Query events
SELECT * FROM "Event" WHERE "eventType" = 'CART_ABANDONED' ORDER BY "createdAt" DESC LIMIT 10;
```

### 5. View in Dashboard

Navigate to `/events` in your frontend to see:
- Event statistics
- Recent abandoned carts
- Checkout funnel metrics
- Event log

---

## 🔍 Troubleshooting

### Webhooks Not Receiving Data

**Problem**: Webhooks registered but no events appearing

**Solutions**:
1. **Check webhook status** in Shopify Admin:
   - Settings → Notifications → Webhooks
   - Look for error messages or failed deliveries

2. **Verify webhook URL** is publicly accessible:
   ```bash
   curl https://your-backend.com/api/webhooks/carts/abandoned
   # Should return 401 (Unauthorized) not 404
   ```

3. **Check webhook secret** matches:
   ```bash
   # In backend/.env
   SHOPIFY_WEBHOOK_SECRET="same-secret-as-shopify"
   ```

4. **Review backend logs** for errors:
   ```bash
   # Look for webhook verification failures
   grep "webhook" backend.log
   ```

### Webhook Signature Verification Failed

**Problem**: `401 Unauthorized - Invalid signature`

**Solutions**:
1. Ensure `SHOPIFY_WEBHOOK_SECRET` is set correctly
2. Check that raw body is being captured (already handled in `index.ts`)
3. Verify Shopify is sending the `X-Shopify-Hmac-Sha256` header

### Events Not Showing in Dashboard

**Problem**: Webhooks received but not visible in UI

**Solutions**:
1. **Check tenant mapping**:
   - Webhook uses `shopifyDomain` to find tenant
   - Ensure domain matches exactly (e.g., `store.myshopify.com`)

2. **Verify database records**:
   ```sql
   SELECT COUNT(*) FROM "Event" WHERE "tenantId" = 'your-tenant-id';
   ```

3. **Check frontend API calls**:
   - Open browser DevTools → Network
   - Look for `/api/events/` requests
   - Check for errors

### Cart Abandonment Not Triggering

**Problem**: Carts created but no abandonment events

**Note**: Shopify considers a cart "abandoned" after a certain time period (typically 1 hour). The `carts/create` and `carts/update` webhooks fire immediately, but the cart is only marked as abandoned if:
- Customer added items to cart
- Customer provided email address
- Customer didn't complete checkout
- Sufficient time has passed

**To test immediately**:
1. Add items to cart
2. Enter email at checkout
3. Close browser without completing purchase
4. Wait 1 hour (or check Shopify's abandonment settings)

### Webhook Delivery Failures

**Problem**: Shopify shows failed webhook deliveries

**Common Causes**:
1. **Backend down**: Ensure your backend is running
2. **Timeout**: Webhook endpoint taking too long (>5 seconds)
3. **Error response**: Endpoint returning 500 errors

**Solutions**:
1. Return 200 OK quickly:
   ```typescript
   // Process webhook asynchronously
   res.status(200).json({ success: true });
   // Then process data
   ```

2. Add error handling:
   ```typescript
   try {
     await processWebhook(data);
   } catch (error) {
     console.error("Webhook processing error:", error);
     // Still return 200 to Shopify
   }
   ```

3. Monitor webhook health:
   ```bash
   curl -X GET "https://your-backend.com/api/tenants/${TENANT_ID}/webhooks" \
     -H "Authorization: Bearer ${AUTH_TOKEN}"
   ```

---

## 📊 Monitoring Webhooks

### Check Webhook Health

```bash
# Get all registered webhooks
curl -X GET "https://your-backend.com/api/tenants/${TENANT_ID}/webhooks" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

**Response:**
```json
{
  "total": 10,
  "webhooks": [
    {
      "id": "123456",
      "topic": "carts/create",
      "address": "https://your-backend.com/api/webhooks/carts/abandoned",
      "createdAt": "2025-12-06T10:00:00Z"
    }
  ]
}
```

### View Event Statistics

```bash
# Get event stats for last 30 days
curl -X GET "https://your-backend.com/api/events/${TENANT_ID}/stats?days=30" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Unregister Webhooks

```bash
# Remove all webhooks (useful for cleanup)
curl -X DELETE "https://your-backend.com/api/tenants/${TENANT_ID}/webhooks" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 🔐 Security Best Practices

1. **Always verify webhook signatures**:
   - Already implemented in `verifyShopifyWebhook` middleware
   - Never skip signature verification in production

2. **Use HTTPS only**:
   - Shopify requires HTTPS for webhook URLs
   - Use SSL certificates (Let's Encrypt is free)

3. **Keep webhook secret secure**:
   - Store in environment variables
   - Never commit to version control
   - Rotate periodically

4. **Rate limiting**:
   - Implement rate limiting on webhook endpoints
   - Prevent abuse and DoS attacks

5. **Idempotency**:
   - Handle duplicate webhook deliveries
   - Use unique IDs to prevent duplicate processing

---

## 📚 Additional Resources

- [Shopify Webhook Documentation](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook)
- [Webhook Best Practices](https://shopify.dev/docs/apps/webhooks/best-practices)
- [Testing Webhooks](https://shopify.dev/docs/apps/webhooks/testing)
- [Webhook Topics Reference](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook#event-topics)

---

## 🎉 Success Checklist

- [ ] Backend deployed and publicly accessible
- [ ] `SHOPIFY_WEBHOOK_SECRET` set in environment
- [ ] Webhooks registered via API or Shopify Admin
- [ ] Test webhook sent and received successfully
- [ ] Events appearing in database
- [ ] Events visible in `/events` dashboard
- [ ] Cart abandonment tracking working
- [ ] Checkout funnel metrics calculating correctly

---

**Need Help?** Check the troubleshooting section or review backend logs for detailed error messages.
