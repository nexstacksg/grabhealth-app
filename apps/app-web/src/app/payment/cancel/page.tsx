'use client';

import { XCircle, ShoppingCart, HelpCircle } from 'lucide-react';
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

export default function PaymentCancelPage() {
  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <XCircle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled and no charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <ShoppingCart className="h-4 w-4" />
            <AlertDescription>
              Your items are still in your cart. You can complete your purchase whenever you're ready.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h4 className="font-medium">Why was my payment cancelled?</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Your payment may have been cancelled for one of these reasons:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You clicked the cancel or back button during checkout</li>
                <li>The payment session expired (usually after 30 minutes)</li>
                <li>There was an issue with the payment method</li>
                <li>You closed the payment window</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Need help?</p>
                <p className="text-gray-600">
                  If you're experiencing issues with payment, our support team is here to help.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/support">Contact Support</Link>
          </Button>
          <Button asChild>
            <Link href="/cart">Return to Cart</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}