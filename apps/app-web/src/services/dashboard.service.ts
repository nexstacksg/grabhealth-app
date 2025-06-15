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
    return await apiClient.get<IOrderStats>(
      `${this.baseUrl}/orders/stats`
    );
  }

  async getCommissionStats(): Promise<ICommissionStats> {
    return await apiClient.get<ICommissionStats>(
      `${this.baseUrl}/commissions/stats`
    );
  }

  async getNetworkStats(): Promise<INetworkStats> {
    return await apiClient.get<INetworkStats>(
      `${this.baseUrl}/commissions/network/stats`
    );
  }

  async getCommissionSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ICommissionSummary> {
    return await apiClient.get<ICommissionSummary>(
      `${this.baseUrl}/commissions/summary/all`,
      { params }
    );
  }

  async getMembershipStats(): Promise<IMembershipStats> {
    return await apiClient.get<IMembershipStats>(
      `${this.baseUrl}/memberships/stats`
    );
  }

  async getNetworkVisualization(levels?: number): Promise<INetwork> {
    return await apiClient.get<INetwork>(
      `${this.baseUrl}/commissions/network`,
      { params: levels ? { levels } : undefined }
    );
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