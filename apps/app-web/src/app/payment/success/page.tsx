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
import { verifyStripePayment, handlePaymentSuccess } from '@/app/actions';
import { formatPrice } from '@/lib/utils';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session_id') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    orderId?: string;
    amount?: number;
    customerEmail?: string;
    warning?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setError('No payment session found');
        setIsLoading(false);
        return;
      }

      try {
        // Verify the payment
        const verificationResult = await verifyStripePayment(sessionId);
        
        if (!verificationResult.success || !verificationResult.paid) {
          throw new Error(verificationResult.error || 'Payment verification failed');
        }

        // Handle successful payment (update order status, etc.)
        const successResult = await handlePaymentSuccess(sessionId);
        
        if (successResult.success) {
          setPaymentDetails({
            orderId: successResult.orderId,
            amount: verificationResult.amount || successResult.amount,
            customerEmail: verificationResult.customerEmail || undefined,
            warning: successResult.warning,
          });
        } else {
          // Payment was successful but order update failed
          // Still show success but with a note
          setPaymentDetails({
            amount: verificationResult.amount,
            customerEmail: verificationResult.customerEmail || undefined,
            warning: 'Payment successful but order creation failed. Please contact support.',
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError(error instanceof Error ? error.message : 'Failed to verify payment');
      } finally {
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId]);

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
              <h3 className="font-semibold text-lg mb-3">Order Details</h3>
              
              {paymentDetails.orderId && (
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium break-all">
                    #{paymentDetails.orderId}
                  </span>
                </div>
              )}
              
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
            </div>
          )}

          {paymentDetails?.warning ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {paymentDetails.warning}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                A confirmation email has been sent to your registered email address with order details and tracking information.
              </AlertDescription>
            </Alert>
          )}

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
          {paymentDetails?.orderId ? (
            <Button asChild>
              <Link href={`/orders/${paymentDetails.orderId}`}>View Order</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/orders">View Orders</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}