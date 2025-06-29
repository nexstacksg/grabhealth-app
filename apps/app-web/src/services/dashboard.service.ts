/**
 * Dashboard Service - Handles all dashboard related API calls
 */


import { BaseService } from './base.service';
import { ApiResponse } from '@app/shared-types';

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
}

interface CommissionStats {
  totalEarnings: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
}

interface NetworkStats {
  totalDownlines: number;
  levelCounts: Record<number, number>;
  totalSalesVolume: number;
}

interface CommissionSummary {
  month: string;
  earnings: number;
  orders: number;
}

interface MembershipStats {
  totalUsers: number;
  essentialUsers: number;
  premiumUsers: number;
}

interface NetworkVisualization {
  nodes: any[];
  links: any[];
}

interface DashboardOverview {
  orderStats: OrderStats;
  commissionStats: CommissionStats;
  networkStats: NetworkStats;
  membershipStats: MembershipStats;
}

interface AdminDashboard {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  recentOrders: any[];
  topProducts: any[];
}

class DashboardService extends BaseService {
  async getOrderStats(): Promise<OrderStats> {
    try {
      const response = await this.api.get<ApiResponse<OrderStats>>('/dashboard/order-stats');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCommissionStats(): Promise<CommissionStats> {
    try {
      const response = await this.api.get<ApiResponse<CommissionStats>>('/dashboard/commission-stats');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const response = await this.api.get<ApiResponse<NetworkStats>>('/dashboard/network-stats');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCommissionSummary(): Promise<CommissionSummary[]> {
    try {
      const response = await this.api.get<ApiResponse<CommissionSummary[]>>('/dashboard/commission-summary');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMembershipStats(): Promise<MembershipStats> {
    try {
      const response = await this.api.get<ApiResponse<MembershipStats>>('/dashboard/membership-stats');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNetworkVisualization(): Promise<NetworkVisualization> {
    try {
      const response = await this.api.get<ApiResponse<NetworkVisualization>>('/dashboard/network-visualization');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await this.api.get<ApiResponse<DashboardOverview>>('/dashboard');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAdminDashboard(): Promise<AdminDashboard> {
    try {
      const response = await this.api.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const dashboardService = new DashboardService('/dashboard');