import {
  IOrderStats,
  ICommissionStats,
  INetworkStats,
  ICommissionSummary,
  IMembershipStats,
  INetwork,
} from '@app/shared-types';
import { IDashboardDataSource } from '../../interfaces/IDashboardDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiDashboardDataSource extends BaseApiDataSource implements IDashboardDataSource {

  async getOrderStats(): Promise<IOrderStats> {
    return this.get<IOrderStats>('/orders/stats');
  }

  async getCommissionStats(): Promise<ICommissionStats> {
    return this.get<ICommissionStats>('/commissions/stats');
  }

  async getNetworkStats(): Promise<INetworkStats> {
    return this.get<INetworkStats>('/commissions/network/stats');
  }

  async getCommissionSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ICommissionSummary> {
    return this.get<ICommissionSummary>('/commissions/summary/all', params);
  }

  async getMembershipStats(): Promise<IMembershipStats> {
    return this.get<IMembershipStats>('/memberships/stats');
  }

  async getNetworkVisualization(levels?: number): Promise<INetwork> {
    const params = levels ? { levels } : undefined;
    return this.get<INetwork>('/commissions/network', params);
  }
}