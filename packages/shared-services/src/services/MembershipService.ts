import {
  IMembershipTier,
  MembershipStats,
  IMembership,
  TierConfig,
  ServiceMembershipTier,
} from '@app/shared-types';
import { IMembershipDataSource } from '../interfaces/IMembershipDataSource';

export interface MembershipServiceOptions {
  dataSource: IMembershipDataSource;
}

// Re-export for backward compatibility
export type MembershipTier = ServiceMembershipTier;

export class MembershipService {
  private dataSource: IMembershipDataSource;

  // Tier thresholds extracted from useMembership hook
  private tierThresholds: TierConfig = {
    level7: 100,
    level6: 200,
    level5: 400,
    level4: 1000,
    level3: 0, // Points not used for level3 and above (discount-based tiers)
    level2: 0,
    level1: 0,
  };

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

  /**
   * Calculate tier discount based on level
   * Business logic extracted from useMembership hook
   */
  getTierDiscount(tier: MembershipTier | undefined): number {
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
  }

  /**
   * Determine next tier based on current tier and points
   * Business logic extracted from useMembership hook
   */
  getNextTier(
    currentTier: MembershipTier | undefined,
    points: number
  ): MembershipTier | null {
    if (!currentTier) return null;

    switch (currentTier) {
      case 'level7':
        return points >= this.tierThresholds.level6 ? 'level6' : null;
      case 'level6':
        return points >= this.tierThresholds.level5 ? 'level5' : null;
      case 'level5':
        return points >= this.tierThresholds.level4 ? 'level4' : null;
      case 'level4':
        return points >= this.tierThresholds.level3 ? 'level3' : null;
      default:
        return null; // No automatic upgrades for level3 and above
    }
  }

  /**
   * Calculate points to next tier
   * Business logic extracted from useMembership hook
   */
  getPointsToNextTier(
    currentTier: MembershipTier | undefined,
    points: number
  ): number {
    if (!currentTier) return 0;

    switch (currentTier) {
      case 'level7':
        return Math.max(0, this.tierThresholds.level6 - points);
      case 'level6':
        return Math.max(0, this.tierThresholds.level5 - points);
      case 'level5':
        return Math.max(0, this.tierThresholds.level4 - points);
      default:
        return 0; // No point requirements for level4 and above
    }
  }

  /**
   * Check if user is eligible for upgrade
   * Business logic extracted from useMembership hook
   */
  isEligibleForUpgrade(
    currentTier: MembershipTier | undefined,
    points: number
  ): boolean {
    return this.getNextTier(currentTier, points) !== null;
  }

  /**
   * Get comprehensive membership analysis
   * Combines all business logic methods
   */
  getMembershipAnalysis(membership: IMembership | null): {
    tierDiscount: number;
    pointsToNextTier: number;
    isEligibleForUpgrade: boolean;
    nextTier: MembershipTier | null;
  } {
    if (!membership) {
      return {
        tierDiscount: 0,
        pointsToNextTier: 0,
        isEligibleForUpgrade: false,
        nextTier: null,
      };
    }

    const tier = membership.tier as MembershipTier;
    const points = membership.points || 0;

    return {
      tierDiscount: this.getTierDiscount(tier),
      pointsToNextTier: this.getPointsToNextTier(tier, points),
      isEligibleForUpgrade: this.isEligibleForUpgrade(tier, points),
      nextTier: this.getNextTier(tier, points),
    };
  }
}
