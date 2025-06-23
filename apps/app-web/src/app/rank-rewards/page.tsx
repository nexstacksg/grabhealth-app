'use client';

import React, { useState, useEffect } from 'react';
import RankRewardsContent from '@/components/rank-rewards/rank-rewards-content';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function RankRewardsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
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
        router.push('/auth/login?redirect=/rank-rewards');
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
        <h1 className="text-2xl font-bold">Rank & Rewards</h1>
        <p className="text-gray-600 mt-1">
          Track your progress, view your benefits, and earn rewards with your
          membership
        </p>
      </div>

      <RankRewardsContent />
    </div>
  );
}
