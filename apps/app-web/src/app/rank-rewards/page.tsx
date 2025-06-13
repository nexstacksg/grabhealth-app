import React from 'react';
import { Metadata } from 'next';
import RankRewardsContent from '@/components/rank-rewards/rank-rewards-content';
import { requireAuth } from '@/lib/auth';
import { CommissionProvider } from '@/components/commission/commission-provider';

export const metadata: Metadata = {
  title: 'Rank & Rewards | GrabHealth',
  description:
    'View your rank, benefits, and rewards in the GrabHealth membership program',
};

export default async function RankRewardsPage() {
  // Ensure user is authenticated to access this page
  await requireAuth();

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
