import {
  IMembershipTier,
  MembershipStats,
} from '@app/shared-types';
import { IMembershipDataSource, IMembership } from '../interfaces/IMembershipDataSource';

export interface MembershipServiceOptions {
  dataSource: IMembershipDataSource;
}

export class MembershipService {
  private dataSource: IMembershipDataSource;

  constructor(options: MembershipServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async getMembershipTiers(): Promise<IMembershipTier[]> {
    return await this.dataSource.getMembershipTiers();
  }

  async getCurrentMembership(): Promise<IMembership | null> {
    return await this.dataSource.getCurrentMembership();
  }

  async joinMembership(data: { tierId: number }): Promise<IMembership> {
    return await this.dataSource.joinMembership(data);
  }

  async upgradeMembership(newTier: string): Promise<IMembership> {
    return await this.dataSource.upgradeMembership(newTier);
  }

  async cancelMembership(): Promise<void> {
    return await this.dataSource.cancelMembership();
  }

  async getMembershipStats(): Promise<MembershipStats> {
    return await this.dataSource.getMembershipStats();
  }

  async checkUpgradeEligibility(targetTier: string): Promise<{
    eligible: boolean;
    requiredPoints?: number;
    currentPoints?: number;
    message?: string;
  }> {
    return await this.dataSource.checkUpgradeEligibility(targetTier);
  }
}