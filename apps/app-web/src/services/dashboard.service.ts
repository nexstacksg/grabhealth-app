import { apiClient } from './api-client';
import {
  IOrderStats,
  ICommissionStats,
  INetworkStats,
  ICommissionSummary,
  IMembershipStats,
  INetwork,
  ApiResponse
} from '@app/shared-types';

class DashboardService {
  private baseUrl = '/api/v1';

  async getOrderStats(): Promise<IOrderStats> {
    const response = await apiClient.get<IOrderStats>(
      `${this.baseUrl}/orders/stats`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch order stats');
    }
    return response.data;
  }

  async getCommissionStats(): Promise<ICommissionStats> {
    const response = await apiClient.get<ICommissionStats>(
      `${this.baseUrl}/commissions/stats`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch commission stats');
    }
    return response.data;
  }

  async getNetworkStats(): Promise<INetworkStats> {
    const response = await apiClient.get<INetworkStats>(
      `${this.baseUrl}/commissions/network/stats`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch network stats');
    }
    return response.data;
  }

  async getCommissionSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ICommissionSummary> {
    const response = await apiClient.get<ICommissionSummary>(
      `${this.baseUrl}/commissions/summary/all`,
      { params }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch commission summary');
    }
    return response.data;
  }

  async getMembershipStats(): Promise<IMembershipStats> {
    const response = await apiClient.get<IMembershipStats>(
      `${this.baseUrl}/memberships/stats`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch membership stats');
    }
    return response.data;
  }

  async getNetworkVisualization(levels?: number): Promise<INetwork> {
    const response = await apiClient.get<INetwork>(
      `${this.baseUrl}/commissions/network`,
      { params: levels ? { levels } : undefined }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch network visualization');
    }
    return response.data;
  }

  async getDashboardOverview(): Promise<{
    orders: IOrderStats;
    commissions: ICommissionStats;
    network: INetworkStats;
  }> {
    const [orders, commissions, network] = await Promise.all([
      this.getOrderStats(),
      this.getCommissionStats(),
      this.getNetworkStats()
    ]);

    return {
      orders,
      commissions,
      network
    };
  }

  async getAdminDashboard(): Promise<{
    orders: IOrderStats;
    commissions: ICommissionSummary;
    memberships: IMembershipStats;
  }> {
    const [orders, commissions, memberships] = await Promise.all([
      this.getOrderStats(),
      this.getCommissionSummary(),
      this.getMembershipStats()
    ]);

    return {
      orders,
      commissions,
      memberships
    };
  }
}

export const dashboardService = new DashboardService();