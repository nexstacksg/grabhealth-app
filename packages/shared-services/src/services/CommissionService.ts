import {
  ICommission,
  ICommissionStats,
  INetworkStats,
} from '@app/shared-types';
import { ICommissionDataSource } from '../interfaces/ICommissionDataSource';

export interface CommissionServiceOptions {
  dataSource: ICommissionDataSource;
}

export class CommissionService {
  private dataSource: ICommissionDataSource;

  constructor(options: CommissionServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async getMyCommissions(): Promise<ICommission[]> {
    return await this.dataSource.getMyCommissions();
  }

  async getCommissionStats(): Promise<ICommissionStats> {
    return await this.dataSource.getCommissionStats();
  }

  async getNetwork(): Promise<any> {
    return await this.dataSource.getNetwork();
  }

  async getNetworkStats(): Promise<INetworkStats> {
    return await this.dataSource.getNetworkStats();
  }

  async getCommission(id: number): Promise<ICommission> {
    return await this.dataSource.getCommission(id);
  }

  async initializeCommissionSystem(): Promise<void> {
    return await this.dataSource.initializeCommissionSystem();
  }

  async getCommissionData(): Promise<{
    upline: any;
    downlines: any[];
    commissions: ICommission[];
    points: number;
    referralLink: string;
    totalEarnings: number;
  }> {
    return await this.dataSource.getCommissionData();
  }

  async getCommissionStructure(): Promise<{
    productTiers: any[];
    roleTypes: any[];
    volumeBonusTiers: any[];
  }> {
    return await this.dataSource.getCommissionStructure();
  }
}