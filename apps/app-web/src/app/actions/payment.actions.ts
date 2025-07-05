'use server';

import { stripe, createLineItems } from '@/lib/stripe-server';
import { hitpayClient } from '@/lib/hitpay-server';
import { formatAmount } from '@/lib/hitpay';
import { getCurrentUserAction } from './auth.actions';
import { headers } from 'next/headers';
import type Stripe from 'stripe';

interface CreateCheckoutSessionParams {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    productId: string; // documentId for Strapi 5
    image?: string;
  }>;
  orderId?: string;
  successUrl?: string;
  cancelUrl?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  paymentProvider?: 'stripe' | 'hitpay';
}

/**
 * Server action to create a Stripe checkout session
 */
export async function createStripeCheckoutSession(params: CreateCheckoutSessionParams) {
  try {
    // Get current user
    const userResult = await getCurrentUserAction();
    if (!userResult.success || !userResult.user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const user = userResult.user;
    
    // Get the raw user data to access numeric ID for relations
    const { serverApiGet } = await import('@/lib/server-api');
    const rawUserResult = await serverApiGet('/users/me');
    const numericUserId = rawUserResult.data?.id?.toString() || '1';
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    // Create line items for Stripe with product metadata
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map(item => ({
      price_data: {
        currency: 'sgd',
        product_data: {
          name: item.name,
          ...(item.image && { images: [item.image] }),
          metadata: {
            productId: item.productId, // Already a string
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Calculate total amount
    const totalAmount = params.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paynow', 'grabpay'], // Singapore payment methods
      line_items: lineItems,
      mode: 'payment',
      success_url: params.successUrl || `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl || `${baseUrl}/payment/cancel`,
      customer_email: user.email,
      metadata: {
        userId: numericUserId, // Store numeric ID for user relations
        orderId: params.orderId || '',
        // Add product IDs for reference
        productIds: params.items.map(item => item.productId).join(','),
        // Store shipping info in metadata for order creation
        shippingAddress: params.shippingAddress || '',
        billingAddress: params.billingAddress || params.shippingAddress || '',
        notes: params.notes || '',
      },
      // Optional: Enable automatic tax calculation
      // automatic_tax: { enabled: true },
      
      // Optional: Collect shipping address
      shipping_address_collection: {
        allowed_countries: ['SG'], // Singapore only for now
      },
      
      // Optional: Enable promotional codes
      allow_promotion_codes: true,
      
      // Set payment intent data
      payment_intent_data: {
        metadata: {
          userId: numericUserId, // Use numeric ID for user relations
          orderId: params.orderId || '',
        },
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return {
      success: false,
      error: error.message || 'Failed to create checkout session',
    };
  }
}

/**
 * Server action to verify payment status
 */
export async function verifyStripePayment(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });

    return {
      success: true,
      paid: session.payment_status === 'paid',
      amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
      currency: session.currency,
      customerEmail: session.customer_details?.email,
      orderId: session.metadata?.orderId,
      paymentIntentId: typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id,
      shippingDetails: session.shipping_details,
    };
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment',
    };
  }
}

/**
 * Server action to handle successful payment
 * Creates order and updates payment details
 */
export async function handlePaymentSuccess(sessionId: string) {
  try {
    // Get the full session details with line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product', 'payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return {
        success: false,
        error: 'Payment not completed',
      };
    }

    // Extract metadata
    const metadata = session.metadata || {};
    const userId = metadata.userId; // This is the numeric user ID
    const shippingAddress = metadata.shippingAddress || session.shipping_details?.address 
      ? `${session.shipping_details.address.line1}, ${session.shipping_details.address.city} ${session.shipping_details.address.postal_code}`
      : '';
    const billingAddress = metadata.billingAddress || shippingAddress;
    const notes = metadata.notes || '';

    // If order already exists (from metadata), just return it
    if (metadata.orderId) {
      return {
        success: true,
        orderId: metadata.orderId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        paymentIntentId: typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id,
      };
    }

    // Create order from session data
    const { createOrderAction } = await import('./order.actions');
    
    // Parse product IDs and quantities from line items
    const productIds = metadata.productIds?.split(',') || [];
    
    const items = session.line_items?.data.map((lineItem: any, index: number) => {
      // Get product ID from the metadata array or from product metadata
      let productId = productIds[index] || '1';
      
      // Try to get from product metadata if available
      if (lineItem.price?.product?.metadata?.productId) {
        productId = lineItem.price.product.metadata.productId;
      }
      
      return {
        productId,
        quantity: lineItem.quantity || 1,
        price: lineItem.price?.unit_amount ? lineItem.price.unit_amount / 100 : 0,
        pvPoints: 0,
      };
    }) || [];

    // Calculate totals
    const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0;
    const total = session.amount_total ? session.amount_total / 100 : 0;
    const tax = (session.total_details?.amount_tax || 0) / 100;
    const discount = (session.total_details?.amount_discount || 0) / 100;

    // Create the order
    const orderResult = await createOrderAction({
      userId: userId || '1', // Now userId is already the numeric ID
      items,
      total,
      subtotal,
      discount,
      tax,
      status: 'PROCESSING', // Set to PROCESSING since payment is confirmed
      paymentStatus: 'PAID',
      paymentMethod: 'stripe',
      shippingAddress,
      billingAddress,
      notes,
    });

    if (!orderResult.success) {
      // Log error but still return success since payment was completed
      console.error('Failed to create order after payment:', orderResult.error);
      return {
        success: true,
        amount: total,
        paymentIntentId: typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id,
        warning: 'Payment successful but order creation failed. Please contact support.',
      };
    }

    // Update the order with payment details
    const orderId = orderResult.order.documentId; // Use documentId for Strapi 5
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;

    // TODO: Update order with paymentIntentId if your schema supports it

    return {
      success: true,
      orderId: orderId, // Already a string
      amount: total,
      paymentIntentId,
    };
  } catch (error: any) {
    console.error('Error handling payment success:', error);
    return {
      success: false,
      error: error.message || 'Failed to process payment success',
    };
  }
}

/**
 * Server action to get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata,
      },
    };
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: error.message || 'Failed to retrieve payment details',
    };
  }
}

/**
 * Server action to create a HitPay payment request
 */
export async function createHitPayCheckoutSession(params: CreateCheckoutSessionParams) {
  try {
    // Get current user
    const userResult = await getCurrentUserAction();
    if (!userResult.success || !userResult.user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const user = userResult.user;
    
    // Get the raw user data to access numeric ID for relations
    const { serverApiGet } = await import('@/lib/server-api');
    const rawUserResult = await serverApiGet('/users/me');
    const numericUserId = rawUserResult.data?.id?.toString() || '1';
    
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    // HitPay doesn't accept localhost URLs, use the public domain for redirect
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `${protocol}://${host}`
      : 'https://grabhealth.ai'; // Use production URL for HitPay redirects in development

    // Calculate total amount
    const totalAmount = params.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Generate order reference
    const orderReference = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Log the request details for debugging
    console.log('Creating HitPay payment request:', {
      amount: totalAmount.toFixed(2), // HitPay expects amount as string in dollars (not cents)
      currency: 'SGD',
      email: user.email,
      baseUrl,
    });

    // Create HitPay payment request
    const paymentRequest = await hitpayClient.createPaymentRequest({
      amount: totalAmount.toFixed(2), // HitPay expects amount as string in dollars, not cents
      currency: 'SGD',
      purpose: `Order from ${user.name || user.email}`,
      email: user.email,
      name: user.name || undefined,
      redirect_url: params.successUrl || `${baseUrl}/payment/success?payment_request_id={payment_request_id}&reference_number=${orderReference}`,
      webhook: process.env.NODE_ENV === 'production' 
        ? `${baseUrl}/api/webhooks/hitpay`
        : 'https://grabhealth.ai/api/webhooks/hitpay', // Use production URL for webhooks in development
      reference_number: orderReference,
      allow_repeated_payments: false,
    });

    // Store metadata in session or cache for webhook processing
    // For now, we'll encode it in the reference number
    const metadata = {
      userId: numericUserId,
      orderId: params.orderId || '',
      productIds: params.items.map(item => item.productId).join(','),
      shippingAddress: params.shippingAddress || '',
      billingAddress: params.billingAddress || params.shippingAddress || '',
      notes: params.notes || '',
      items: params.items,
    };

    // Store metadata temporarily (you might want to use Redis or database)
    // For MVP, we'll use the reference number to retrieve order details later

    return {
      success: true,
      paymentRequestId: paymentRequest.id,
      url: paymentRequest.url,
      reference: orderReference,
    };
  } catch (error: any) {
    console.error('Error creating HitPay payment request:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment request',
    };
  }
}

/**
 * Server action to verify HitPay payment status
 */
export async function verifyHitPayPayment(paymentRequestId: string) {
  try {
    const paymentStatus = await hitpayClient.getPaymentStatus(paymentRequestId);

    return {
      success: true,
      paid: paymentStatus.status === 'completed',
      amount: parseFloat(paymentStatus.amount),
      currency: paymentStatus.currency,
      customerEmail: paymentStatus.email,
      reference: paymentStatus.reference_number,
      paymentMethod: paymentStatus.payment_methods?.[0] || 'hitpay',
    };
  } catch (error: any) {
    console.error('Error verifying HitPay payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment',
    };
  }
}

/**
 * Server action to create a checkout session based on payment provider
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const provider = params.paymentProvider || 'stripe';
  
  if (provider === 'hitpay') {
    return createHitPayCheckoutSession(params);
  } else {
    return createStripeCheckoutSession(params);
  }
}