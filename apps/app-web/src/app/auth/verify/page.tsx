'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VerificationForm } from '@/components/auth/verification-form';

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = (searchParams.get('type') || 'login') as
    | 'login'
    | 'registration'
    | 'password_reset';

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-muted-foreground">
            No email provided for verification
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <VerificationForm email={email} verificationType={type} />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
