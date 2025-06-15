import { apiClient } from './api-client';
import {
  IMembership,
  IMembershipTier,
  MembershipStats,
} from '@app/shared-types';

class MembershipService {
  private baseUrl = '/memberships';

  /**
   * Get all membership tiers
   */
  async getMembershipTiers(): Promise<IMembershipTier[]> {
    return await apiClient.get<IMembershipTier[]>(
      `${this.baseUrl}/tiers`
    );
  }

  /**
   * Get current user's membership
   */
  async getCurrentMembership(): Promise<IMembership | null> {
    try {
      return await apiClient.get<IMembership>(
        `${this.baseUrl}/my-membership`
      );
    } catch (error: any) {
      if (error.message?.includes('No membership found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Join a membership tier (subscribe)
   */
  async joinMembership(data: { tierId: number }): Promise<IMembership> {
    return await apiClient.post<IMembership>(
      `${this.baseUrl}/subscribe`,
      data
    );
  }

  /**
   * Upgrade membership tier
   */
  async upgradeMembership(newTier: string): Promise<IMembership> {
    return await apiClient.put<IMembership>(
      `${this.baseUrl}/upgrade`,
      { tier: newTier }
    );
  }

  /**
   * Cancel membership
   */
  async cancelMembership(): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/cancel`);
  }

  /**
   * Get membership statistics
   */
  async getMembershipStats(): Promise<MembershipStats> {
    return await apiClient.get<MembershipStats>(
      `${this.baseUrl}/stats`
    );
  }

  /**
   * Check if user can upgrade to a specific tier
   */
  async checkUpgradeEligibility(targetTier: string): Promise<{
    eligible: boolean;
    requiredPoints?: number;
    currentPoints?: number;
    message?: string;
  }> {
    return await apiClient.get<{
      eligible: boolean;
      requiredPoints?: number;
      currentPoints?: number;
      message?: string;
    }>(`${this.baseUrl}/upgrade-eligibility/${targetTier}`);
  }
}

export const membershipService = new MembershipService();
export default membershipService;
