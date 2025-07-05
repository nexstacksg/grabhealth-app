'use server';

import { hitpayClient } from '@/lib/hitpay-server';
import { getCurrentUserAction } from './auth.actions';
import { headers } from 'next/headers';

interface CreateCheckoutSessionParams {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    productId: string;
    image?: string;
  }>;
  orderId?: string;
  successUrl?: string;
  cancelUrl?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
}

/**
 * Server action to create a HitPay payment request
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
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
    
    // Use environment variable for base URL, fallback to production domain
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://grabhealth.ai';

    // Calculate total amount
    const totalAmount = params.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Generate order reference
    const orderReference = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Log the request details for debugging
    const redirectUrl = params.successUrl || `${baseUrl}/payment/success`;
    const webhookUrl = `${baseUrl}/api/webhooks/hitpay`;
      
    console.log('Creating HitPay payment request:', {
      amount: totalAmount.toFixed(2),
      currency: 'SGD',
      email: user.email,
      baseUrl,
      redirectUrl,
      webhookUrl,
    });

    // Create HitPay payment request
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim() 
      : undefined;
    
    const paymentRequest = await hitpayClient.createPaymentRequest({
      amount: totalAmount.toFixed(2), // HitPay expects amount as string in dollars
      currency: 'SGD',
      purpose: `Order from ${fullName || user.email}`,
      email: user.email,
      name: fullName,
      redirect_url: redirectUrl,
      webhook: webhookUrl,
      reference_number: orderReference,
      allow_repeated_payments: false,
    });

    // Store pending order data for webhook processing
    const { storePendingOrder } = await import('@/lib/pending-orders');
    
    storePendingOrder({
      referenceNumber: orderReference,
      userId: numericUserId,
      items: params.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        pvPoints: 0,
      })),
      total: totalAmount,
      subtotal: totalAmount,
      discount: 0,
      tax: 0,
      shippingAddress: params.shippingAddress || '',
      billingAddress: params.billingAddress || params.shippingAddress || '',
      notes: params.notes || '',
      createdAt: new Date(),
    });

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