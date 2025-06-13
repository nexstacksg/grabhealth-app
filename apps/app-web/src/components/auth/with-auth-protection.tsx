'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Higher-order component to protect routes that require authentication
export function withAuthProtection<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Add effect to handle initial load
    useEffect(() => {
      // Set a small delay to allow the auth state to be properly initialized
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 500);

      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      // Only redirect if initial load is complete, not loading, and no user found
      if (initialLoadComplete && !isLoading && !user) {
        router.push(
          '/auth/login?redirect=' + encodeURIComponent(window.location.pathname)
        );
      }
    }, [initialLoadComplete, isLoading, user, router]);

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Checking authentication...</span>
        </div>
      );
    }

    // If no user and not loading, don't render the component
    if (!user) {
      return (
        <div className="flex items-center justify-center h-64">
          <span>Redirecting to login...</span>
        </div>
      );
    }

    // If authenticated, render the component
    return <Component {...props} />;
  };
}
