import { NextRequest, NextResponse } from 'next/server';
import { hitpayClient } from '@/lib/hitpay-server';
import { headers } from 'next/headers';
import { getOrderByOrderNumberAction, updateOrderStatusAction } from '@/app/actions/order.actions';
import { OrderStatus, PaymentStatus } from '@app/shared-types';

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
      const orderNumber = payload.reference_number || '';
      
      console.log('=== WEBHOOK: Payment completed ===', {
        paymentId: payload.payment_id,
        requestId: payload.payment_request_id,
        amount: payload.amount,
        currency: payload.currency,
        orderNumber: orderNumber,
      });

      // Get order by order number
      const orderResult = await getOrderByOrderNumberAction(orderNumber);
      
      if (!orderResult.success || !orderResult.order) {
        console.error('=== WEBHOOK ERROR: Order not found ===', {
          orderNumber: orderNumber,
          error: orderResult.error,
        });
        // Still return success to HitPay to prevent retries
        return NextResponse.json({ success: true });
      }
      
      const order = orderResult.order;
      
      console.log('=== WEBHOOK: Found order ===', {
        orderId: order.documentId,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        currentPaymentStatus: order.paymentStatus,
      });

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
        
        // Update order status
        const updateResult = await updateOrderStatusAction(order.documentId, {
          status: OrderStatus.PROCESSING,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: paymentMethod,
          paymentId: payload.payment_id,
        });
        
        if (updateResult.success) {
          console.log('=== WEBHOOK: Order updated successfully ===', {
            orderId: order.documentId,
            orderNumber: order.orderNumber,
            newStatus: OrderStatus.PROCESSING,
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: paymentMethod,
          });
        } else {
          console.error('=== WEBHOOK ERROR: Failed to update order ===', {
            orderId: order.documentId,
            error: updateResult.error,
          });
        }
      } catch (error) {
        console.error('Error updating order from webhook:', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          orderNumber: orderNumber,
        });
      }
    } else if (payload.status === 'failed') {
      // Payment failed
      console.log('Payment failed:', {
        paymentId: payload.payment_id,
        requestId: payload.payment_request_id,
      });
      
      // Update order status to cancelled
      if (payload.reference_number) {
        const orderResult = await getOrderByOrderNumberAction(payload.reference_number);
        if (orderResult.success && orderResult.order) {
          await updateOrderStatusAction(orderResult.order.documentId, {
            status: OrderStatus.CANCELLED,
            paymentStatus: PaymentStatus.FAILED,
          });
        }
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