import { NextRequest, NextResponse } from 'next/server';
import { hitpayClient } from '@/lib/hitpay-server';
import { headers } from 'next/headers';
import crypto from 'crypto';

interface HitPayWebhookPayload {
  payment_id: string;
  payment_request_id: string;
  phone?: string;
  amount: string;
  currency: string;
  status: string;
  reference_number?: string;
  hmac?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as HitPayWebhookPayload;
    const headersList = await headers();
    const signature = headersList.get('X-HitPay-Signature') || payload.hmac || '';

    // Verify webhook signature
    const isValid = hitpayClient.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      console.error('Invalid HitPay webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('HitPay webhook received:', {
      paymentRequestId: payload.payment_request_id,
      status: payload.status,
      amount: payload.amount,
      reference: payload.reference_number,
    });

    // Handle different payment statuses
    if (payload.status === 'completed') {
      // Payment successful
      const reference = payload.reference_number || '';
      
      console.log('Payment completed successfully:', {
        paymentId: payload.payment_id,
        requestId: payload.payment_request_id,
        amount: payload.amount,
        currency: payload.currency,
        reference: reference,
      });

      // Retrieve pending order data
      const { getPendingOrder, deletePendingOrder } = await import('@/lib/pending-orders');
      const pendingOrder = getPendingOrder(reference);

      if (!pendingOrder) {
        console.error('No pending order found for reference:', reference);
        // Still return success to HitPay to prevent retries
        return NextResponse.json({ success: true });
      }

      try {
        // Get full payment details from HitPay to retrieve payment method
        let paymentMethod = 'hitpay'; // Default fallback
        
        try {
          const paymentStatus = await hitpayClient.getPaymentStatus(payload.payment_request_id);
          console.log('HitPay payment details:', {
            paymentMethods: paymentStatus.payment_methods,
            status: paymentStatus.status,
          });
          
          // Use the actual payment method from HitPay (e.g., 'paynow', 'card', 'grabpay')
          if (paymentStatus.payment_methods && paymentStatus.payment_methods.length > 0) {
            paymentMethod = paymentStatus.payment_methods[0];
          }
        } catch (error) {
          console.error('Failed to get payment method details:', error);
          // Continue with default 'hitpay' if we can't get the specific method
        }
        
        // Create order using internal API endpoint (bypasses authentication)
        const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const internalSecret = process.env.INTERNAL_API_SECRET || 'dev-secret-change-in-production';
        const secret = crypto.createHash('sha256').update(internalSecret).digest('hex');
        
        console.log('Creating order from webhook with data:', {
          userId: pendingOrder.userId,
          itemCount: pendingOrder.items.length,
          total: parseFloat(payload.amount),
          reference: reference,
          paymentMethod: paymentMethod,
          orderNumber: orderNumber,
        });
        
        // Get the base URL for internal API call
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://grabhealth.ai';
        
        // Create order via internal API endpoint
        const orderResponse = await fetch(`${baseUrl}/api/internal/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: secret,
            userId: pendingOrder.userId,
            orderNumber: orderNumber,
            items: pendingOrder.items,
            total: parseFloat(payload.amount), // Use actual paid amount from HitPay
            subtotal: pendingOrder.subtotal,
            discount: pendingOrder.discount || 0,
            tax: pendingOrder.tax || 0,
            status: 'PROCESSING', // Order is paid and processing
            paymentStatus: 'PAID',
            paymentMethod: paymentMethod, // Use the actual payment method from HitPay
            shippingAddress: pendingOrder.shippingAddress,
            billingAddress: pendingOrder.billingAddress,
            notes: pendingOrder.notes || '',
          }),
        });
        
        const orderResult = await orderResponse.json();
        
        if (!orderResponse.ok) {
          console.error('Failed to create order via internal API:', {
            status: orderResponse.status,
            error: orderResult,
          });
          throw new Error(orderResult?.error || 'Failed to create order');
        }
        
        const createdOrder = orderResult.order;

        if (createdOrder) {
          console.log('Order created successfully:', {
            orderId: createdOrder.documentId,
            orderNumber: orderNumber,
            reference: reference,
            userId: pendingOrder.userId,
          });
          
          // Delete the pending order data
          deletePendingOrder(reference);
        } else {
          console.error('Failed to create order:', {
            error: 'No order data returned',
            userId: pendingOrder.userId,
            reference: reference,
          });
        }
      } catch (error) {
        console.error('Error creating order from webhook:', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          reference: reference,
        });
      }
    } else if (payload.status === 'failed') {
      // Payment failed
      console.log('Payment failed:', {
        paymentId: payload.payment_id,
        requestId: payload.payment_request_id,
      });
      
      // Clean up pending order
      const { deletePendingOrder } = await import('@/lib/pending-orders');
      if (payload.reference_number) {
        deletePendingOrder(payload.reference_number);
      }
    } else if (payload.status === 'pending') {
      // Payment is pending
      console.log('Payment pending:', {
        paymentId: payload.payment_id,
        requestId: payload.payment_request_id,
      });
    }

    // Return success response to HitPay
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('HitPay webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// HitPay sends GET requests to verify webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}