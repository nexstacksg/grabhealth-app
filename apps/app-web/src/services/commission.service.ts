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
    return await apiClient.get<ICommission[]>(
      `${this.baseUrl}/my-commissions`
    );
  }

  /**
   * Get commission statistics
   */
  async getCommissionStats(): Promise<ICommissionStats> {
    return await apiClient.get<ICommissionStats>(
      `${this.baseUrl}/stats`
    );
  }

  /**
   * Get MLM network
   */
  async getNetwork(): Promise<any> {
    return await apiClient.get<any>(`${this.baseUrl}/network`);
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<INetworkStats> {
    return await apiClient.get<INetworkStats>(
      `${this.baseUrl}/network/stats`
    );
  }

  /**
   * Get commission by ID
   */
  async getCommission(id: number): Promise<ICommission> {
    return await apiClient.get<ICommission>(`${this.baseUrl}/${id}`);
  }

  /**
   * Initialize commission system
   */
  async initializeCommissionSystem(): Promise<void> {
    await apiClient.post<void>(`${this.baseUrl}/init`);
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
    return await apiClient.get<{
      upline: any;
      downlines: any[];
      commissions: ICommission[];
      points: number;
      referralLink: string;
      totalEarnings: number;
    }>(`${this.baseUrl}`);
  }

  /**
   * Get commission structure (product tiers, role types, volume bonuses)
   */
  async getCommissionStructure(): Promise<{
    productTiers: any[];
    roleTypes: any[];
    volumeBonusTiers: any[];
  }> {
    return await apiClient.get<{
      productTiers: any[];
      roleTypes: any[];
      volumeBonusTiers: any[];
    }>(`${this.baseUrl}/structure`);
  }
}

export const commissionService = new CommissionService();
export default commissionService;
