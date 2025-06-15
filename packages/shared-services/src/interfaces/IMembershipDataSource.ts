import {
  IMembershipTier,
  MembershipStats,
  IUserMembership,
  IUser
} from '@app/shared-types';

// Define the membership response type
export interface IMembership extends IUserMembership {
  user?: IUser;
  tier: string;
  points?: number;
}

export interface IMembershipDataSource {
  getMembershipTiers(): Promise<IMembershipTier[]>;
  getCurrentMembership(): Promise<IMembership | null>;
  joinMembership(data: { tierId: number }): Promise<IMembership>;
  upgradeMembership(newTier: string): Promise<IMembership>;
  cancelMembership(): Promise<void>;
  getMembershipStats(): Promise<MembershipStats>;
  checkUpgradeEligibility(targetTier: string): Promise<{
    eligible: boolean;
    requiredPoints?: number;
    currentPoints?: number;
    message?: string;
  }>;
}