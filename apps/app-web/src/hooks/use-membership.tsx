'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { toast } from 'sonner';
import { membershipService } from '@/services/membership.service';
import { useAuth } from '@/contexts/AuthContext';

export interface Membership {
  id: number;
  tier:
    | 'level1'
    | 'level2'
    | 'level3'
    | 'level4'
    | 'level5'
    | 'level6'
    | 'level7';
  points: number;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
}

interface MembershipContextType {
  membership: Membership | null;
  isLoading: boolean;
  tierDiscount: number;
  pointsToNextTier: number;
  isEligibleForUpgrade: boolean;
  nextTier: string | null;
  addPoints: (points: number) => Promise<void>;
  refreshMembership: () => Promise<void>;
}

const MembershipContext = createContext<MembershipContextType | undefined>(
  undefined
);

export const MembershipProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate tier discount based on level
  const getTierDiscount = (tier: string | undefined) => {
    switch (tier) {
      case 'level1':
        return 0.3; // 30% discount
      case 'level2':
        return 0.1; // 10% discount
      case 'level3':
        return 0.05; // 5% discount
      default:
        return 0;
    }
  };

  const tierDiscount = getTierDiscount(membership?.tier);

  // Define tier thresholds
  const tierThresholds = {
    level7: 100,
    level6: 200,
    level5: 400,
    level4: 1000,
    level3: 0, // Points not used for level3 and above (discount-based tiers)
    level2: 0,
    level1: 0,
  };

  // Determine next tier based on current tier and points
  const getNextTier = (currentTier: string | undefined, points: number) => {
    if (!currentTier) return null;

    switch (currentTier) {
      case 'level7':
        return points >= tierThresholds.level6 ? 'level6' : null;
      case 'level6':
        return points >= tierThresholds.level5 ? 'level5' : null;
      case 'level5':
        return points >= tierThresholds.level4 ? 'level4' : null;
      case 'level4':
        return points >= tierThresholds.level3 ? 'level3' : null;
      default:
        return null; // No automatic upgrades for level3 and above
    }
  };

  const nextTier = getNextTier(membership?.tier, membership?.points || 0);

  // Calculate points to next tier
  const getPointsToNextTier = (
    currentTier: string | undefined,
    points: number
  ) => {
    if (!currentTier) return 0;

    switch (currentTier) {
      case 'level7':
        return Math.max(0, tierThresholds.level6 - points);
      case 'level6':
        return Math.max(0, tierThresholds.level5 - points);
      case 'level5':
        return Math.max(0, tierThresholds.level4 - points);
      default:
        return 0; // No point requirements for level4 and above
    }
  };

  const pointsToNextTier = getPointsToNextTier(
    membership?.tier,
    membership?.points || 0
  );

  // Check if eligible for upgrade
  const isEligibleForUpgrade = nextTier !== null;

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
      const membershipData = await membershipService.getCurrentMembership();

      if (membershipData) {
        // Convert IMembership to local Membership type
        setMembership({
          id: membershipData.id,
          tier: membershipData.tier as any,
          points: membershipData.points || 0,
          created_at: membershipData.createdAt.toString(),
          updated_at: membershipData.updatedAt.toString(),
          name:
            membershipData.user?.firstName +
              ' ' +
              membershipData.user?.lastName || '',
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
