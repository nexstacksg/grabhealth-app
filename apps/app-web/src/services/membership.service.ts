/**
 * Membership Service - Handles all membership related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { IMembership, IMembershipTier, ApiResponse } from '@app/shared-types';

interface MembershipStats {
  totalUsers: number;
  essentialUsers: number;
  premiumUsers: number;
}

class MembershipService extends BaseService {
  async getMembershipTiers(): Promise<IMembershipTier[]> {
    try {
      const response = await apiClient.get<ApiResponse<IMembershipTier[]>>('/membership/tiers');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCurrentMembership(): Promise<IMembership> {
    try {
      const response = await apiClient.get<ApiResponse<IMembership>>('/membership/current');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async joinMembership(tierId: string): Promise<IMembership> {
    try {
      const response = await apiClient.post<ApiResponse<IMembership>>('/membership/join', { tierId });
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async upgradeMembership(tierId: string): Promise<IMembership> {
    try {
      const response = await apiClient.post<ApiResponse<IMembership>>('/membership/upgrade', { tierId });
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async cancelMembership(): Promise<void> {
    try {
      await apiClient.post('/membership/cancel');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMembershipStats(): Promise<MembershipStats> {
    try {
      const response = await apiClient.get<ApiResponse<MembershipStats>>('/membership/stats');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkUpgradeEligibility(targetTierId: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
      const response = await apiClient.get<ApiResponse<{ eligible: boolean; reason?: string }>>(`/membership/upgrade-eligibility/${targetTierId}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const membershipService = new MembershipService('/membership');