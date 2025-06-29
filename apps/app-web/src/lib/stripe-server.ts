import Stripe from 'stripe';

// Initialize Stripe with the secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Helper function to create line items for Stripe Checkout
export function createLineItems(items: Array<{
  name: string;
  price: number;
  quantity: number;
  image?: string;
}>): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map(item => ({
    price_data: {
      currency: 'sgd',
      product_data: {
        name: item.name,
        ...(item.image && { images: [item.image] }),
      },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }));
}

// Helper to validate webhook signature
export async function validateWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  );
}