# HitPay Order Creation Debugging Guide

## Current Issue
Orders are not being created in Strapi after successful HitPay payments.

## Architecture Overview
1. User initiates payment → Redirected to HitPay
2. HitPay processes payment → Sends webhook to `/api/webhooks/hitpay`
3. Webhook retrieves pending order → Calls internal API `/api/internal/create-order`
4. Internal API uses Strapi API token → Creates order in Strapi

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Strapi API Token (you provided this)
STRAPI_API_TOKEN=4ac495ab5df2475eae91faa3f7f7646a2d34f25bf7c4a299d14f05d0e5c09cb871d807bd2705c650bfc257e406473a4d2b109e514dc1145f92694df7a1f0aeb971c2258b5ced788157022bc9455f97703ead54d7dc9b0ab3d242d106d1aa43c54c4be13a239e5389dd83e66f843dbc81db6d4131779519f165d9a53dbd01146f

# Internal API Security (generate a secure random string)
INTERNAL_API_SECRET=your-secure-random-string-here

# Webhook Base URL (for server-to-server calls)
WEBHOOK_BASE_URL=http://localhost:3000

# Strapi Backend URL
NEXT_PUBLIC_API_URL=http://localhost:1337
```

## Debugging Steps

### 1. Test the Internal API Directly

Run the test script:
```bash
node test-internal-api.js
```

Before running, update the script with:
- A real user documentId
- A real product documentId

### 2. Check Console Logs

Look for these log markers in your console:
- `=== WEBHOOK: Payment completed ===` - Webhook received payment
- `=== WEBHOOK: Found pending order ===` - Pending order data found
- `=== WEBHOOK: Creating order via internal API ===` - Calling internal API
- `=== INTERNAL API: Order creation request received ===` - Internal API received request
- `=== INTERNAL API: Sending to Strapi ===` - Sending to Strapi
- `=== INTERNAL API: Order created successfully ===` - Success

### 3. Common Issues & Solutions

#### Issue: "No pending order found"
- The reference number doesn't match
- Pending order expired or was already processed
- Check `getPendingOrder` function in `/lib/pending-orders.ts`

#### Issue: "Invalid internal API secret"
- `INTERNAL_API_SECRET` not set in environment
- Secret mismatch between webhook and internal API

#### Issue: "API token not configured"
- `STRAPI_API_TOKEN` not set in environment

#### Issue: "Failed to create order" (401 Unauthorized)
- API token is invalid or expired
- API token doesn't have permission to create orders

#### Issue: "Failed to create order" (400 Bad Request)
- User documentId is invalid
- Product documentId is invalid
- Required fields are missing

### 4. Verify Strapi API Token Permissions

In Strapi Admin Panel:
1. Go to Settings → API Tokens
2. Find your token
3. Ensure it has these permissions:
   - `api::order.order` - Create, Read
   - `api::order-item.order-item` - Create, Read
   - `plugin::users-permissions.user` - Read

### 5. Test HitPay Webhook Manually

You can simulate a HitPay webhook:

```bash
curl -X POST http://localhost:3000/api/webhooks/hitpay \
  -H "Content-Type: application/json" \
  -H "X-HitPay-Signature: your-signature" \
  -d '{
    "payment_id": "test-payment-id",
    "payment_request_id": "test-request-id",
    "amount": "100.00",
    "currency": "SGD",
    "status": "completed",
    "reference_number": "ORDER-xxxxx"
  }'
```

### 6. Check Pending Orders

Add this debug endpoint temporarily:

```typescript
// app/api/debug/pending-orders/route.ts
import { NextResponse } from 'next/server';
import { getAllPendingOrders } from '@/lib/pending-orders';

export async function GET() {
  const orders = getAllPendingOrders();
  return NextResponse.json({ orders });
}
```

### 7. Monitor Network Requests

Use Chrome DevTools Network tab or a tool like ngrok to see:
- What HitPay is actually sending
- Response from your webhook
- Internal API calls

## Next Steps if Still Not Working

1. **Check HitPay Webhook URL**: Ensure HitPay is configured to send webhooks to the correct URL
2. **Check Server Logs**: Look for any unhandled errors
3. **Verify User/Product IDs**: Make sure the documentIds in pending orders are valid
4. **Test with Postman**: Create orders directly via Strapi API to ensure it works
5. **Enable Strapi Debug Mode**: Set `DEBUG=*` to see all Strapi logs

## Alternative Solution

If the internal API approach doesn't work, consider:
1. Creating a Strapi plugin that exposes a public endpoint for webhooks
2. Using Strapi's built-in webhook functionality
3. Storing orders in a separate database table first, then syncing