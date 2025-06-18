// Membership Service Types
export interface IJoinMembershipRequest {
  tier: string;
  referralCode?: string;
}

export interface IMembershipStats {
  totalMembers: number;
  activeMembers: number;
  membersByTier: Record<string, number>;
}

// Tier configuration for membership service
export interface TierConfig {
  level7: number;
  level6: number;
  level5: number;
  level4: number;
  level3: number;
  level2: number;
  level1: number;
}

// Service-specific membership tier type
export type ServiceMembershipTier =
  | 'level1'
  | 'level2'
  | 'level3'
  | 'level4'
  | 'level5'
  | 'level6'
  | 'level7';

// UI Context Types
export interface MembershipContextState {
  id: number;
  tier: ServiceMembershipTier;
  points: number;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
}

export interface MembershipContextType {
  membership: MembershipContextState | null;
  isLoading: boolean;
  tierDiscount: number;
  pointsToNextTier: number;
  isEligibleForUpgrade: boolean;
  nextTier: string | null;
  addPoints: (points: number) => Promise<void>;
  refreshMembership: () => Promise<void>;
}

// Backward compatibility exports (without I prefix)
export type JoinMembershipRequest = IJoinMembershipRequest;
export type MembershipStats = IMembershipStats;
