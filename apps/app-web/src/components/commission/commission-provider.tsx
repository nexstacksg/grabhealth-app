'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import services from '@/lib/services';
import { ICommission } from '@app/shared-types';

// Types for commission context
type UserRelationship = {
  id: number;
  user_id: number;
  upline_id: number | null;
  relationship_level: number;
  created_at: string;
  updated_at: string;
  name?: string;
  email?: string;
};

type Commission = {
  id: number;
  order_id: number;
  user_id: number;
  recipient_id: number;
  amount: number;
  commission_rate: number;
  relationship_level: number;
  status: string;
  created_at: string;
  updated_at: string;
  order_total?: number;
  buyer_name?: string;
};

type CommissionContextType = {
  upline: UserRelationship | null;
  downlines: UserRelationship[];
  commissions: ICommission[];
  points: number;
  referralLink: string;
  totalEarnings: number;
  isLoading: boolean;
  error: string | null;
  refreshCommissionData: () => Promise<void>;
};

const CommissionContext = createContext<CommissionContextType | undefined>(
  undefined
);

export function CommissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the global auth context instead of fetching user separately
  const { user, isLoading: authLoading } = useAuth();

  // State for commission data
  const [upline, setUpline] = useState<UserRelationship | null>(null);
  const [downlines, setDownlines] = useState<UserRelationship[]>([]);
  const [commissions, setCommissions] = useState<ICommission[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [referralLink, setReferralLink] = useState<string>('');
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  // Function to fetch commission data
  const fetchCommissionData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to initialize the commission system first
      try {
        await services.commission.initializeCommissionSystem();
      } catch (initError) {
        console.error(
          'Error initializing commission system, but continuing:',
          initError
        );
        // Continue despite initialization error
      }

      // Then fetch the commission data
      try {
        const data = await services.commission.getCommissionData();

        // Use data with fallbacks
        setUpline(data.upline || null);
        setDownlines(data.downlines || []);
        setCommissions(data.commissions || []);
        setPoints(data.points || 0);
        setReferralLink(
          data.referralLink ||
            `${window.location.origin}/auth/register?referrer=${user.id || 'user'}`
        );

        // Use total earnings from service or calculate if not provided
        const earnings = typeof data.totalEarnings === 'number' 
          ? data.totalEarnings 
          : (data.commissions || []).reduce(
              (sum: number, commission: ICommission) => {
                return sum + (commission.amount || 0);
              },
              0
            );
        setTotalEarnings(earnings);
      } catch (fetchError: any) {
        // Don't log error for PENDING_VERIFICATION users
        if (fetchError?.response?.status !== 403) {
          console.error('Error fetching commission data:', fetchError);
        }
        // Set default values to allow UI to render
        setUpline(null);
        setDownlines([]);
        setCommissions([]);
        setPoints(0);
        setReferralLink(
          `${window.location.origin}/auth/register?referrer=${user.id || 'user'}`
        );
        setTotalEarnings(0);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      console.error('Error in commission data flow:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch commission data when auth loading is complete and user changes
  useEffect(() => {
    // Only fetch data when auth loading is complete
    if (!authLoading) {
      if (user) {
        fetchCommissionData();
      } else {
        // Clear loading state if no user is authenticated
        setIsLoading(false);
      }
    }
  }, [user, authLoading]);

  // Context value
  const value = {
    upline,
    downlines,
    commissions,
    points,
    referralLink,
    totalEarnings,
    isLoading,
    error,
    refreshCommissionData: fetchCommissionData,
  };

  return (
    <CommissionContext.Provider value={value}>
      {children}
    </CommissionContext.Provider>
  );
}

// Hook to use commission context
export function useCommission() {
  const context = useContext(CommissionContext);

  if (context === undefined) {
    throw new Error('useCommission must be used within a CommissionProvider');
  }

  return context;
}
