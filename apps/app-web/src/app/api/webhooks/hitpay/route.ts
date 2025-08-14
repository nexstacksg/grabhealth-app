import { NextRequest, NextResponse } from 'next/server';
import { hitpayClient } from '@/lib/hitpay-server';
import { headers } from 'next/headers';
import { getOrderByOrderNumberAction, updateOrderStatusAction } from '@/app/actions/order.actions';
import { OrderStatus, PaymentStatus } from '@app/shared-types';
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
    const headersList = await headers();
    const contentType = headersList.get('content-type') || '';
    
    // Read raw body first
    const rawBody = await request.text();
    
    let payload: HitPayWebhookPayload;
    let jsonData: any;
    
    // Check if this is an Event Webhook (has Hitpay-Signature header)
    const eventSignature = headersList.get('hitpay-signature');
    const isEventWebhook = !!eventSignature;
    
    // Parse the body based on content type
    if (contentType.includes('application/json')) {
      jsonData = JSON.parse(rawBody);
      
      // Check if this is the full payment object or just webhook fields
      if (jsonData.payment_request) {
        // Full payment object from HitPay Event Webhook
        payload = {
          payment_id: jsonData.id,
          payment_request_id: jsonData.payment_request.id,
          phone: jsonData.phone || undefined,
          amount: jsonData.amount,
          currency: jsonData.currency,
          status: jsonData.status,
          reference_number: jsonData.payment_request.reference_number || undefined,
          hmac: jsonData.hmac || undefined,
        };
      } else {
        // Standard webhook payload
        payload = jsonData as HitPayWebhookPayload;
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(rawBody);
      payload = {
        payment_id: params.get('payment_id') || '',
        payment_request_id: params.get('payment_request_id') || '',
        phone: params.get('phone') || undefined,
        amount: params.get('amount') || '',
        currency: params.get('currency') || '',
        status: params.get('status') || '',
        reference_number: params.get('reference_number') || undefined,
        hmac: params.get('hmac') || undefined,
      };
    } else {
      console.error('Unsupported content type:', contentType);
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }
    
    console.log('=== HitPay Webhook Debug ===');
    console.log('Content-Type:', contentType);
    console.log('Webhook Type:', isEventWebhook ? 'Event Webhook' : 'Payment Request Webhook');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Event Signature (Hitpay-Signature):', eventSignature);
    console.log('Payment Request Signature (hmac):', payload.hmac);
    console.log('Event Type:', headersList.get('hitpay-event-type'));
    console.log('Event Object:', headersList.get('hitpay-event-object'));
    console.log('===========================');

    // Get webhook salt
    const HITPAY_WEBHOOK_SALT = process.env.HITPAY_WEBHOOK_SALT;
    if (!HITPAY_WEBHOOK_SALT) {
      console.error('HITPAY_WEBHOOK_SALT not configured');
      return NextResponse.json(
        { error: 'Webhook salt not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature based on webhook type
    let isValid = false;
    
    if (isEventWebhook) {
      // Event Webhook: Use Hitpay-Signature header with raw JSON body
      const computedSignature = crypto
        .createHmac('sha256', HITPAY_WEBHOOK_SALT)
        .update(rawBody)
        .digest('hex');
      
      isValid = computedSignature === eventSignature;
      
      console.log('Event Webhook Verification:');
      console.log('Computed signature:', computedSignature);
      console.log('Received signature:', eventSignature);
    } else {
      // Payment Request Webhook: Use hmac field in payload
      const signature = payload.hmac || '';
      isValid = hitpayClient.verifyWebhookSignature(payload, signature);
    }
    
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
        currentStatus: order.orderStatus,
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
          // Note: paymentId is not stored in Strapi order schema
        });
        
        if (updateResult.success) {
          console.log('=== WEBHOOK: Order updated successfully ===', {
            orderId: order.documentId,
            orderNumber: order.orderNumber,
            newStatus: OrderStatus.PROCESSING,
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: paymentMethod,
          });

          // Send order confirmation email
          try {
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders/${order.documentId}/send-confirmation-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
              },
            });

            if (emailResponse.ok) {
              console.log('=== WEBHOOK: Confirmation email sent successfully ===', {
                orderId: order.documentId,
                orderNumber: order.orderNumber,
              });
            } else {
              const errorData = await emailResponse.text();
              console.error('=== WEBHOOK ERROR: Failed to send confirmation email ===', {
                orderId: order.documentId,
                status: emailResponse.status,
                error: errorData,
              });
            }
          } catch (emailError) {
            console.error('=== WEBHOOK ERROR: Exception sending confirmation email ===', {
              orderId: order.documentId,
              error: emailError instanceof Error ? emailError.message : emailError,
            });
          }
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