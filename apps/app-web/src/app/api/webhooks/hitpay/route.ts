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
      // Extract order metadata from reference number
      const reference = payload.reference_number || '';
      
      // For MVP, we're using the reference number to track the order
      // In production, you'd want to store this mapping in a database
      
      // Get the payment details to retrieve metadata
      const paymentDetails = await hitpayClient.getPaymentStatus(payload.payment_request_id);
      
      // Create order in Strapi
      // Since we can't store complex metadata in HitPay, we need to handle this differently
      // Option 1: Store pending order data in database before redirect
      // Option 2: Create order after webhook confirmation
      // For now, we'll log the successful payment
      
      console.log('Payment completed successfully:', {
        paymentId: payload.payment_id,
        requestId: payload.payment_request_id,
        amount: payload.amount,
        currency: payload.currency,
        reference: reference,
      });

      // TODO: Implement order creation based on reference number
      // This would require storing order data temporarily before payment
    } else if (payload.status === 'failed') {
      // Payment failed
      console.log('Payment failed:', {
        paymentId: payload.payment_id,
        requestId: payload.payment_request_id,
      });
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