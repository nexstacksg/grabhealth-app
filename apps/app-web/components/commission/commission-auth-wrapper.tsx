'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface CommissionAuthWrapperProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export default function CommissionAuthWrapper({
  children,
  isAuthenticated,
}: CommissionAuthWrapperProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If server-side check says not authenticated AND client-side check confirms not authenticated
    // AND we're not still loading, then redirect to login
    if (!isAuthenticated && !user && !isLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  // If we're still loading OR we have a user, show the content
  // This prevents the flash of redirect when user is actually authenticated
  if (user || isAuthenticated) {
    return <>{children}</>;
  }

  // Show a loading state while checking authentication
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
