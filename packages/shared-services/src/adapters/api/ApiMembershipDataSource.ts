import {
  IMembershipTier,
  MembershipStats,
  IMembership,
} from '@app/shared-types';
import { IMembershipDataSource } from '../../interfaces/IMembershipDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiMembershipDataSource
  extends BaseApiDataSource
  implements IMembershipDataSource
{
  async getMembershipTiers(): Promise<IMembershipTier[]> {
    return this.get<IMembershipTier[]>('/memberships/tiers');
  }

  async getCurrentMembership(): Promise<IMembership | null> {
    try {
      return await this.get<IMembership>('/memberships/my-membership');
    } catch (error: any) {
      if (error.message?.includes('No membership found')) {
        return null;
      }
      throw error;
    }
  }

  async joinMembership(data: { tierId: number }): Promise<IMembership> {
    return this.post<IMembership>('/memberships/subscribe', data);
  }

  async upgradeMembership(newTier: string): Promise<IMembership> {
    return this.put<IMembership>('/memberships/upgrade', { tier: newTier });
  }

  async cancelMembership(): Promise<void> {
    return this.delete<void>('/memberships/cancel');
  }

  async getMembershipStats(): Promise<MembershipStats> {
    return this.get<MembershipStats>('/memberships/stats');
  }

  async checkUpgradeEligibility(targetTier: string): Promise<{
    eligible: boolean;
    requiredPoints?: number;
    currentPoints?: number;
    message?: string;
  }> {
    return this.get<{
      eligible: boolean;
      requiredPoints?: number;
      currentPoints?: number;
      message?: string;
    }>(`/memberships/upgrade-eligibility/${targetTier}`);
  }
}
