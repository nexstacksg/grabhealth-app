import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SearchParamsWrapper from './search-params-wrapper';

export const metadata: Metadata = {
  title: 'Create Account - GrabHealth AI',
  description: 'Join GrabHealth AI today and unlock exclusive health benefits, discounts on wellness products, and access to partner health services.',
  openGraph: {
    title: 'Create Account - GrabHealth AI',
    description: 'Join GrabHealth AI today and unlock exclusive health benefits, discounts on wellness products, and access to partner health services.',
    type: 'website',
    url: '/auth/register',
    siteName: 'GrabHealth AI',
    images: [
      {
        url: '/freepik__background__83849 2.svg',
        width: 1200,
        height: 630,
        alt: 'Join GrabHealth AI - Your Health Membership Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Account - GrabHealth AI',
    description: 'Join GrabHealth AI today and unlock exclusive health benefits, discounts on wellness products, and access to partner health services.',
    images: ['/freepik__background__83849 2.svg'],
  },
};

export default function RegisterPage() {
  return (
    <div className="container max-w-md py-16 mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create a GrabHealth account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="p-4 text-center">
                Loading registration form...
              </div>
            }
          >
            <SearchParamsWrapper />
          </Suspense>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-emerald-500 hover:text-emerald-600"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
