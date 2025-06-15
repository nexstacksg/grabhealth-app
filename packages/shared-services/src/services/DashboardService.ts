import {
  IOrderStats,
  ICommissionStats,
  INetworkStats,
  ICommissionSummary,
  IMembershipStats,
  INetwork,
} from '@app/shared-types';
import { IDashboardDataSource } from '../interfaces/IDashboardDataSource';

export interface DashboardServiceOptions {
  dataSource: IDashboardDataSource;
}

export class DashboardService {
  private dataSource: IDashboardDataSource;

  constructor(options: DashboardServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async getOrderStats(): Promise<IOrderStats> {
    return await this.dataSource.getOrderStats();
  }

  async getCommissionStats(): Promise<ICommissionStats> {
    return await this.dataSource.getCommissionStats();
  }

  async getNetworkStats(): Promise<INetworkStats> {
    return await this.dataSource.getNetworkStats();
  }

  async getCommissionSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ICommissionSummary> {
    return await this.dataSource.getCommissionSummary(params);
  }

  async getMembershipStats(): Promise<IMembershipStats> {
    return await this.dataSource.getMembershipStats();
  }

  async getNetworkVisualization(levels?: number): Promise<INetwork> {
    return await this.dataSource.getNetworkVisualization(levels);
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