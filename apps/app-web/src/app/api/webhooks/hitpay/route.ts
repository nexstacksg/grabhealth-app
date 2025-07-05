import { NextRequest, NextResponse } from 'next/server';
import { hitpayClient } from '@/lib/hitpay-server';
import { headers } from 'next/headers';

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
        // Create the order using the stored data
        const { createOrderAction } = await import('@/app/actions/order.actions');
        
        console.log('Creating order from webhook with data:', {
          userId: pendingOrder.userId,
          itemCount: pendingOrder.items.length,
          total: parseFloat(payload.amount),
          reference: reference,
        });
        
        const orderResult = await createOrderAction({
          userId: pendingOrder.userId,
          items: pendingOrder.items,
          total: parseFloat(payload.amount), // Use actual paid amount from HitPay
          subtotal: pendingOrder.subtotal,
          discount: pendingOrder.discount,
          tax: pendingOrder.tax,
          status: 'PROCESSING', // Order is paid and processing
          paymentStatus: 'PAID',
          paymentMethod: 'hitpay',
          shippingAddress: pendingOrder.shippingAddress,
          billingAddress: pendingOrder.billingAddress,
          notes: pendingOrder.notes,
        });

        if (orderResult.success) {
          console.log('Order created successfully:', {
            orderId: orderResult.order.documentId,
            orderNumber: orderResult.order.orderNumber,
            reference: reference,
            userId: pendingOrder.userId,
          });
          
          // Delete the pending order data
          deletePendingOrder(reference);
        } else {
          console.error('Failed to create order:', {
            error: orderResult.error,
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