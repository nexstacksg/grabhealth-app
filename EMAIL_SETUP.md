# Email Confirmation Setup

This document explains how to set up and test the email confirmation feature for HitPay payments.

## Required Environment Variables

### Strapi Backend (apps/app-strapi/.env)
```env
# Mailgun Configuration
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_FROM_EMAIL=noreply@yourdomain.com

# API Token for internal calls
API_TOKEN=your-strapi-api-token
```

### Next.js Frontend (apps/app-web/.env.local)
```env
# Strapi API Configuration
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=same-token-as-strapi-api-token

# HitPay Configuration (already configured)
HITPAY_API_KEY=your-hitpay-api-key
HITPAY_SALT=your-hitpay-salt
HITPAY_WEBHOOK_SALT=your-hitpay-webhook-salt
```

## How It Works

1. **Order Creation**: When a user completes checkout, an order is created with `PENDING_PAYMENT` status
2. **Payment Processing**: User is redirected to HitPay for payment
3. **Webhook Notification**: HitPay sends a webhook to `/api/webhooks/hitpay` when payment completes
4. **Order Update**: The webhook updates the order to `PROCESSING` status with `PAID` payment status
5. **Email Trigger**: The webhook calls Strapi's API to send the confirmation email
6. **Email Delivery**: Strapi uses Mailgun to send the order confirmation email to the customer

## Testing

### 1. Check Strapi Email Configuration
```bash
cd apps/app-strapi
pnpm run dev
```

### 2. Test Email Sending Manually
You can test the email endpoint directly:
```bash
# Get an order ID from Strapi admin
# Then test the email endpoint
curl -X POST http://localhost:1337/api/orders/YOUR_ORDER_ID/send-confirmation-email \
  -H "Authorization: Bearer YOUR_STRAPI_API_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Test Complete Flow
1. Create a test order in your application
2. Complete payment with HitPay
3. Check the webhook logs in your terminal
4. Verify the email was sent (check Mailgun logs)

## Troubleshooting

### Email Not Sending
1. Check Mailgun credentials in Strapi `.env`
2. Verify Mailgun domain is configured and verified
3. Check Strapi logs for email errors

### Webhook Not Triggering Email
1. Ensure `STRAPI_API_TOKEN` is set in both Strapi and Next.js
2. Check webhook logs for error messages
3. Verify order has a valid user email address

### Common Errors
- "Order not found": The order ID doesn't exist in Strapi
- "No email address found for order": The order's user doesn't have an email
- "401 Unauthorized": API token is missing or incorrect

## Email Template

The confirmation email includes:
- Order number and date
- Customer name
- Order items with quantities and prices
- Total amount
- Payment method
- Order status

The template is responsive and styled for good readability across devices.