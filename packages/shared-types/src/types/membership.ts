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

// Backward compatibility exports (without I prefix)
export type JoinMembershipRequest = IJoinMembershipRequest;
export type MembershipStats = IMembershipStats;