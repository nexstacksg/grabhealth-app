'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const authChecked = useRef(false);

  useEffect(() => {
    // Prevent the effect from running on every render
    if (authChecked.current) return;

    // Only proceed when auth state is determined (not loading)
    if (!isLoading) {
      authChecked.current = true;

      // If no user, redirect to login
      if (!user) {
        router.push('/auth/login');
      }
    }
  }, [isLoading, user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-96 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-64 w-full bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  // If we're not loading and we've reached this point, either:
  // 1. User is authenticated, or
  // 2. Redirect is in progress
  // In either case, we can render children
  return <>{children}</>;
}
