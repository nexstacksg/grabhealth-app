'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { toast } from 'sonner';
import services from '@/lib/services';
import { useAuth } from './AuthContext';
import {
  IMembership,
  ServiceMembershipTier,
  MembershipStatus,
  MembershipContextState,
  MembershipContextType,
} from '@app/shared-types';

const MembershipContext = createContext<MembershipContextType | undefined>(
  undefined
);

export const MembershipProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [membership, setMembership] = useState<MembershipContextState | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Use service for business logic calculations
  // Convert context state back to IMembership format for service
  const membershipForService: IMembership | null = membership
    ? {
        id: membership.id,
        userId: user?.id || '',
        tierId: 1, // Default tier ID
        status: MembershipStatus.ACTIVE,
        startDate: new Date(membership.created_at),
        endDate: undefined,
        autoRenew: true,
        createdAt: new Date(membership.created_at),
        updatedAt: new Date(membership.updated_at),
        tier: membership.tier,
        points: membership.points,
        user: {
          firstName: membership.name.split(' ')[0] || '',
          lastName: membership.name.split(' ')[1] || '',
          email: membership.email,
        },
      }
    : null;

  const membershipAnalysis =
    services.membership.getMembershipAnalysis(membershipForService);

  const { tierDiscount, pointsToNextTier, isEligibleForUpgrade, nextTier } =
    membershipAnalysis;

  // Fetch membership data
  const fetchMembership = async () => {
    // Skip if user is not authenticated
    if (!user) {
      setMembership(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const membershipData = await services.membership.getCurrentMembership();

      if (membershipData) {
        // Convert IMembership to MembershipContextState for UI
        setMembership({
          id: membershipData.id,
          tier: membershipData.tier as ServiceMembershipTier,
          points: membershipData.points || 0,
          created_at: membershipData.createdAt
            ? membershipData.createdAt.toString()
            : new Date().toISOString(),
          updated_at: membershipData.updatedAt
            ? membershipData.updatedAt.toString()
            : new Date().toISOString(),
          name:
            membershipData.user?.firstName && membershipData.user?.lastName
              ? `${membershipData.user.firstName} ${membershipData.user.lastName}`
              : '',
          email: membershipData.user?.email || '',
        });
      } else {
        setMembership(null);
      }
    } catch (error: any) {
      // Don't show error for PENDING_VERIFICATION users or 403 errors
      if (error?.response?.status === 403) {
        // User doesn't have access to membership yet (PENDING_VERIFICATION)
        setMembership(null);
      } else {
        console.error('Error fetching membership:', error);
        setMembership(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh membership data
  const refreshMembership = async () => {
    await fetchMembership();
  };

  // Add points to membership
  const addPoints = async (points: number) => {
    if (!membership) return;

    try {
      const newPoints = membership.points + points;

      // Points system is not active - users are automatically members
      console.log('Points system is not active', points);
      toast.info('Thank you for your activity!');
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to update membership points');
    }
  };

  // Fetch membership on component mount (only in browser)
  useEffect(() => {
    // Delay initial fetch to ensure client-side only execution
    const timer = setTimeout(() => {
      fetchMembership();

      // Listen for auth state changes
      const handleAuthChange = () => {
        fetchMembership();
      };

      window.addEventListener('auth-state-change', handleAuthChange);

      return () => {
        window.removeEventListener('auth-state-change', handleAuthChange);
      };
    }, 0);

    return () => clearTimeout(timer);
  }, [user]); // Re-fetch when user changes

  return (
    <MembershipContext.Provider
      value={{
        membership,
        isLoading,
        tierDiscount,
        pointsToNextTier,
        isEligibleForUpgrade,
        nextTier,
        addPoints,
        refreshMembership,
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
};

export const useMembership = () => {
  const context = useContext(MembershipContext);

  if (context === undefined) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }

  return context;
};
