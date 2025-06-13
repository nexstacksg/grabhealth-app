import { apiClient } from './api-client';
import { IMembership, IMembershipTier, ApiResponse } from '@app/shared-types';

export interface JoinMembershipRequest {
  tier: string;
  referralCode?: string;
}

export interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  membersByTier: Record<string, number>;
}

class MembershipService {
  private baseUrl = '/memberships';

  /**
   * Get all membership tiers
   */
  async getMembershipTiers(): Promise<IMembershipTier[]> {
    const response = await apiClient.get<IMembershipTier[]>(
      `${this.baseUrl}/tiers`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to fetch membership tiers'
      );
    }

    return response.data;
  }

  /**
   * Get current user's membership
   */
  async getCurrentMembership(): Promise<IMembership | null> {
    const response = await apiClient.get<IMembership>(
      `${this.baseUrl}/my-membership`
    );

    if (!response.success) {
      if (response.error?.message?.includes('No membership found')) {
        return null;
      }
      throw new Error(response.error?.message || 'Failed to fetch membership');
    }

    return response.data || null;
  }

  /**
   * Join a membership tier (subscribe)
   */
  async joinMembership(data: { tierId: number }): Promise<IMembership> {
    const response = await apiClient.post<IMembership>(
      `${this.baseUrl}/subscribe`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to join membership');
    }

    return response.data;
  }

  /**
   * Upgrade membership tier
   */
  async upgradeMembership(newTier: string): Promise<IMembership> {
    const response = await apiClient.put<IMembership>(
      `${this.baseUrl}/upgrade`,
      { tier: newTier }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to upgrade membership'
      );
    }

    return response.data;
  }

  /**
   * Cancel membership
   */
  async cancelMembership(): Promise<void> {
    const response = await apiClient.delete<void>(`${this.baseUrl}/cancel`);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel membership');
    }
  }

  /**
   * Get membership statistics
   */
  async getMembershipStats(): Promise<MembershipStats> {
    const response = await apiClient.get<MembershipStats>(
      `${this.baseUrl}/stats`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to fetch membership stats'
      );
    }

    return response.data;
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
    const response = await apiClient.get<{
      eligible: boolean;
      requiredPoints?: number;
      currentPoints?: number;
      message?: string;
    }>(`${this.baseUrl}/upgrade-eligibility/${targetTier}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to check eligibility');
    }

    return response.data;
  }
}

export const membershipService = new MembershipService();
export default membershipService;
