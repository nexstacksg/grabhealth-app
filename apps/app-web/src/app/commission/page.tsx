'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CommissionDashboard from '@/components/commission/commission-dashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function CommissionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect after component is mounted and auth check is complete
    if (mounted && !authLoading && !user) {
      console.log('User not authenticated, redirecting to login');
      // Small delay to prevent race condition with cookie setting
      const timer = setTimeout(() => {
        router.push('/auth/login?redirect=/commission');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router, mounted]);

  // Show loading while auth is being checked or component is mounting
  if (!mounted || authLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 mb-16 flex justify-center items-center min-h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }

  // If no user after loading completes, show loading (will redirect soon)
  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 mb-16 flex justify-center items-center min-h-[50vh]">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 mb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commission Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage your multi-level commission network and track your earnings
        </p>
      </div>

      <CommissionDashboard />
    </div>
  );
}
