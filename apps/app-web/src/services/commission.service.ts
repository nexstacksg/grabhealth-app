import { apiClient } from './api-client';
import {
  ICommission,
  ICommissionStats,
  INetworkStats,
} from '@app/shared-types';

class CommissionService {
  private baseUrl = '/commissions';

  /**
   * Get user's commissions
   */
  async getMyCommissions(): Promise<ICommission[]> {
    const response = await apiClient.get<ICommission[]>(
      `${this.baseUrl}/my-commissions`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get commissions');
    }

    return response.data;
  }

  /**
   * Get commission statistics
   */
  async getCommissionStats(): Promise<ICommissionStats> {
    const response = await apiClient.get<ICommissionStats>(
      `${this.baseUrl}/stats`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get commission stats'
      );
    }

    return response.data;
  }

  /**
   * Get MLM network
   */
  async getNetwork(): Promise<any> {
    const response = await apiClient.get<any>(`${this.baseUrl}/network`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get network');
    }

    return response.data;
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<INetworkStats> {
    const response = await apiClient.get<INetworkStats>(
      `${this.baseUrl}/network/stats`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get network stats');
    }

    return response.data;
  }

  /**
   * Get commission by ID
   */
  async getCommission(id: number): Promise<ICommission> {
    const response = await apiClient.get<ICommission>(`${this.baseUrl}/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Commission not found');
    }

    return response.data;
  }

  /**
   * Initialize commission system
   */
  async initializeCommissionSystem(): Promise<void> {
    const response = await apiClient.post<void>(`${this.baseUrl}/init`);

    if (!response.success) {
      throw new Error(
        response.error?.message || 'Failed to initialize commission system'
      );
    }
  }

  /**
   * Get full commission data for a user (upline, downlines, commissions, etc.)
   */
  async getCommissionData(): Promise<{
    upline: any;
    downlines: any[];
    commissions: ICommission[];
    points: number;
    referralLink: string;
    totalEarnings: number;
  }> {
    const response = await apiClient.get<{
      upline: any;
      downlines: any[];
      commissions: ICommission[];
      points: number;
      referralLink: string;
      totalEarnings: number;
    }>(`${this.baseUrl}`);

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get commission data'
      );
    }

    return response.data;
  }

  /**
   * Get commission structure (product tiers, role types, volume bonuses)
   */
  async getCommissionStructure(): Promise<{
    productTiers: any[];
    roleTypes: any[];
    volumeBonusTiers: any[];
  }> {
    const response = await apiClient.get<{
      productTiers: any[];
      roleTypes: any[];
      volumeBonusTiers: any[];
    }>(`${this.baseUrl}/structure`);

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get commission structure'
      );
    }

    return response.data;
  }
}

export const commissionService = new CommissionService();
export default commissionService;
