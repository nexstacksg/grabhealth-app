import {
  IOrderStats,
  ICommissionStats,
  INetworkStats,
  ICommissionSummary,
  IMembershipStats,
  INetwork,
} from '@app/shared-types';

export interface IDashboardDataSource {
  getOrderStats(): Promise<IOrderStats>;
  getCommissionStats(): Promise<ICommissionStats>;
  getNetworkStats(): Promise<INetworkStats>;
  getCommissionSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ICommissionSummary>;
  getMembershipStats(): Promise<IMembershipStats>;
  getNetworkVisualization(levels?: number): Promise<INetwork>;
}