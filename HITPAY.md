# HitPay Integration Guide

This document outlines the HitPay payment gateway integration for GrabHealth AI, implemented alongside the existing Stripe integration.

## Overview

HitPay is a Singapore-based payment gateway that provides comprehensive payment solutions for Southeast Asian markets. This integration allows customers to choose between Stripe and HitPay at checkout.

## Integration Architecture

### Payment Provider Selection
- Users can select their preferred payment provider at checkout
- Both Stripe and HitPay are available options
- Payment flow adapts based on selected provider

### File Structure
```
apps/app-web/src/
├── lib/
│   ├── hitpay.ts              # Client-side HitPay initialization
│   └── hitpay-server.ts       # Server-side HitPay operations
├── app/
│   ├── actions/
│   │   └── payment.actions.ts # Updated with HitPay methods
│   └── api/
│       └── webhooks/
│           └── hitpay/
│               └── route.ts   # HitPay webhook handler
```

## Environment Variables

Add these to your `.env.local`:

```bash
# HitPay Configuration
NEXT_PUBLIC_HITPAY_API_KEY=your_hitpay_api_key
HITPAY_API_KEY=your_hitpay_api_key
HITPAY_SALT=your_hitpay_salt
HITPAY_WEBHOOK_SALT=your_webhook_salt
NEXT_PUBLIC_HITPAY_MODE=sandbox # or 'live' for production
```

## API Integration

### 1. Create Payment Request

```typescript
// POST to https://api.sandbox.hit-pay.com/v1/payment-requests
{
  "amount": "99.99",
  "currency": "SGD",
  "purpose": "Order #12345",
  "email": "customer@example.com",
  "name": "Customer Name",
  "redirect_url": "https://yoursite.com/payment/success",
  "webhook": "https://yoursite.com/api/webhooks/hitpay",
  "reference_number": "ORDER-12345"
}
```

### 2. Handle Response

```typescript
// Response includes:
{
  "id": "payment_request_id",
  "url": "https://pay.hit-pay.com/...", // Redirect customer here
  "status": "pending"
}
```

### 3. Webhook Verification

HitPay sends webhook notifications for payment status updates. Verify the signature using HMAC-SHA256.

## Payment Flow

1. **Checkout Page**
   - User selects HitPay as payment provider
   - Server creates HitPay payment request
   - User redirected to HitPay hosted checkout

2. **HitPay Checkout**
   - Customer completes payment on HitPay
   - Supports: PayNow, Cards, GrabPay, AliPay, etc.

3. **Return to Site**
   - Success: Redirected to `/payment/success`
   - Cancel: Redirected to `/payment/cancel`

4. **Webhook Processing**
   - HitPay sends payment confirmation
   - Server verifies webhook signature
   - Order created/updated in database

## Supported Payment Methods

- **Cards**: Visa, Mastercard, American Express
- **E-Wallets**: GrabPay, AliPay, WeChat Pay
- **Bank Transfer**: PayNow (Singapore)
- **Digital Wallets**: Apple Pay, Google Pay
- **BNPL**: Atome, Grab PayLater

## Testing

### Sandbox Environment
- API URL: `https://api.sandbox.hit-pay.com`
- Dashboard: `https://dashboard.sandbox.hit-pay.com`
- Test cards available in HitPay documentation

### Test Payment Methods
- **PayNow**: Use sandbox QR codes
- **Cards**: Test card numbers from HitPay docs
- **E-Wallets**: Sandbox test accounts

## Security Considerations

1. **API Key Protection**
   - Never expose API keys in client-side code
   - Use server-side actions for payment creation

2. **Webhook Verification**
   - Always verify webhook signatures
   - Use webhook salt for HMAC validation

3. **HTTPS Required**
   - All API calls must use HTTPS
   - Redirect URLs must be HTTPS in production

## Error Handling

Common error codes:
- `400`: Invalid request parameters
- `401`: Invalid API key
- `422`: Validation errors
- `500`: Server errors

## Migration Notes

- Existing Stripe orders remain unchanged
- New orders can use either payment provider
- Both providers tracked in order payment_method field
- Unified order management in Strapi

## Support Resources

- API Documentation: https://docs.hitpayapp.com/apis
- Developer Portal: https://dashboard.hit-pay.com/developers
- Support Email: support@hit-pay.com