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
}

export const commissionService = new CommissionService();
export default commissionService;
