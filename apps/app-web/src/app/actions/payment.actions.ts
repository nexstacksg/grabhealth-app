'use server';

import { hitpayClient } from '@/lib/hitpay-server';
import { getCurrentUserAction } from './auth.actions';
import { createOrderAction } from './order.actions';

interface CreateCheckoutSessionParams {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    productId: string;
    image?: string;
    discount?: number;
  }>;
  orderId?: string;
  successUrl?: string;
  cancelUrl?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
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
    const userDocumentId = user.documentId;
    
    console.log('Creating checkout session for user:', {
      email: user.email,
      documentId: userDocumentId,
      itemCount: params.items.length,
      total: params.total,
    });
    
    // Step 1: Create order in database with PENDING_PAYMENT status
    const orderResult = await createOrderAction({
      userId: userDocumentId,
      items: params.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
      })),
      total: params.total,
      subtotal: params.subtotal,
      discount: params.discount,
      tax: params.tax,
      paymentMethod: '', // Will be updated after payment
      shippingAddress: params.shippingAddress || '',
      billingAddress: params.billingAddress || params.shippingAddress || '',
      notes: params.notes || '',
    });

    if (!orderResult.success || !orderResult.order) {
      console.error('Failed to create order:', orderResult.error);
      return {
        success: false,
        error: orderResult.error || 'Failed to create order',
      };
    }

    const order = orderResult.order;
    console.log('Order created successfully:', {
      orderId: order.documentId,
      orderNumber: order.orderNumber,
    });
    
    // Step 2: Create HitPay payment request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://grabhealth.ai';
    const redirectUrl = params.successUrl || `${baseUrl}/payment/success?orderId=${order.documentId}`;
    const webhookUrl = `${baseUrl}/api/webhooks/hitpay`;
      
    console.log('Creating HitPay payment request:', {
      amount: params.total.toFixed(2),
      currency: 'SGD',
      orderNumber: order.orderNumber,
      redirectUrl,
      webhookUrl,
    });

    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim() 
      : undefined;
    
    const paymentRequest = await hitpayClient.createPaymentRequest({
      amount: params.total.toFixed(2), // HitPay expects amount as string in dollars
      currency: 'SGD',
      purpose: `Order ${order.orderNumber}`,
      email: user.email,
      name: fullName,
      redirect_url: redirectUrl,
      webhook: webhookUrl,
      reference_number: order.orderNumber, // Use actual order number as reference
      allow_repeated_payments: false,
    });

    console.log('HitPay payment request created:', {
      paymentRequestId: paymentRequest.id,
      orderNumber: order.orderNumber,
    });

    return {
      success: true,
      paymentRequestId: paymentRequest.id,
      url: paymentRequest.url,
      orderId: order.documentId,
      orderNumber: order.orderNumber,
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error.message || 'Failed to create checkout session',
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