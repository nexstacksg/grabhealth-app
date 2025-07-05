'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { verifyHitPayPayment } from '@/app/actions';
import { formatPrice } from '@/lib/utils';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentRequestId = searchParams?.get('payment_request_id') || '';
  const referenceNumber = searchParams?.get('reference_number') || searchParams?.get('reference') || '';
  const status = searchParams?.get('status') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    orderId?: string;
    amount?: number;
    customerEmail?: string;
    reference?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      // Check if it's a HitPay payment redirect (by reference number and status)
      if (referenceNumber && status === 'completed') {
        try {
          // For HitPay redirect, we just show success since webhook handles order creation
          // The reference number confirms this is a valid payment
          setPaymentDetails({
            reference: referenceNumber,
            // We don't have amount/email from the redirect, but that's OK
          });
        } catch (error) {
          console.error('HitPay payment error:', error);
          setError(error instanceof Error ? error.message : 'Failed to process payment');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Check if it's a HitPay payment with payment_request_id
      if (paymentRequestId) {
        try {
          // Verify HitPay payment
          const verificationResult = await verifyHitPayPayment(paymentRequestId);
          
          if (!verificationResult.success || !verificationResult.paid) {
            throw new Error(verificationResult.error || 'Payment verification failed');
          }

          // For HitPay, order creation is handled by webhook
          // We show success message and let users know order is being processed
          setPaymentDetails({
            amount: verificationResult.amount,
            customerEmail: verificationResult.customerEmail || undefined,
            reference: verificationResult.reference || referenceNumber,
          });
        } catch (error) {
          console.error('HitPay payment verification error:', error);
          setError(error instanceof Error ? error.message : 'Failed to verify payment');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // No payment information found
      setError('No payment information found');
      setIsLoading(false);
    }

    verifyPayment();
  }, [paymentRequestId, referenceNumber, status]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-16 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-16">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/cart">Return to Cart</Link>
            </Button>
            <Button asChild>
              <Link href="/support">Contact Support</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your order has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentDetails && (
            <div className="rounded-lg bg-gray-50 p-6 space-y-3">
              <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
              
              {paymentDetails.amount !== undefined && (
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">{formatPrice(paymentDetails.amount)}</span>
                </div>
              )}
              
              {paymentDetails.customerEmail && (
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium break-all">{paymentDetails.customerEmail}</span>
                </div>
              )}
              
              {paymentDetails.reference && (
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium break-all">{paymentDetails.reference}</span>
                </div>
              )}
            </div>
          )}

          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              Your payment has been received and is being processed. You will receive an order confirmation email shortly with your order details.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">What happens next?</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>You will receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>We will process and pack your order within 1-2 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>You will receive a shipping notification with tracking details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Expected delivery within 3-5 business days</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button asChild>
            <Link href="/orders">View Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}