import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'sgd', // Singapore Dollar
  locale: 'en-SG' as const,
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#10b981', // emerald-500
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px',
    },
  },
};

// Helper to format amount for Stripe (convert dollars to cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper to format amount from Stripe (convert cents to dollars)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}