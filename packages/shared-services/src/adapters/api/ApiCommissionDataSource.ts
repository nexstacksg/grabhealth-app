import {
  ICommission,
  ICommissionStats,
  INetworkStats,
} from '@app/shared-types';
import { ICommissionDataSource } from '../../interfaces/ICommissionDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiCommissionDataSource extends BaseApiDataSource implements ICommissionDataSource {

  async getMyCommissions(): Promise<ICommission[]> {
    return this.get<ICommission[]>('/commissions/my-commissions');
  }

  async getCommissionStats(): Promise<ICommissionStats> {
    return this.get<ICommissionStats>('/commissions/stats');
  }

  async getNetwork(): Promise<any> {
    return this.get<any>('/commissions/network');
  }

  async getNetworkStats(): Promise<INetworkStats> {
    return this.get<INetworkStats>('/commissions/network/stats');
  }

  async getCommission(id: number): Promise<ICommission> {
    return this.get<ICommission>(`/commissions/${id}`);
  }

  async initializeCommissionSystem(): Promise<void> {
    return this.post<void>('/commissions/init');
  }

  async getCommissionData(): Promise<{
    upline: any;
    downlines: any[];
    commissions: ICommission[];
    points: number;
    referralLink: string;
    totalEarnings: number;
  }> {
    return this.get<{
      upline: any;
      downlines: any[];
      commissions: ICommission[];
      points: number;
      referralLink: string;
      totalEarnings: number;
    }>('/commissions');
  }

  async getCommissionStructure(): Promise<{
    productTiers: any[];
    roleTypes: any[];
    volumeBonusTiers: any[];
  }> {
    return this.get<{
      productTiers: any[];
      roleTypes: any[];
      volumeBonusTiers: any[];
    }>('/commissions/structure');
  }
}