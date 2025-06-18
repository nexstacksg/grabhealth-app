import {
  IMembershipTier,
  MembershipStats,
  IMembership,
} from '@app/shared-types';

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
