'use client';

import React from 'react';
import RankRewardsContent from '@/components/rank-rewards/rank-rewards-content';
import { CommissionProvider } from '@/components/commission/commission-provider';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RankRewardsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 mb-16 flex justify-center items-center min-h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
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

      <CommissionProvider>
        <RankRewardsContent />
      </CommissionProvider>
    </div>
  );
}
