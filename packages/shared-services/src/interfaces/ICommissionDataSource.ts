import {
  ICommission,
  ICommissionStats,
  INetworkStats,
} from '@app/shared-types';

export interface ICommissionDataSource {
  getMyCommissions(): Promise<ICommission[]>;
  getCommissionStats(): Promise<ICommissionStats>;
  getNetwork(): Promise<any>;
  getNetworkStats(): Promise<INetworkStats>;
  getCommission(id: number): Promise<ICommission>;
  initializeCommissionSystem(): Promise<void>;
  getCommissionData(): Promise<{
    upline: any;
    downlines: any[];
    commissions: ICommission[];
    points: number;
    referralLink: string;
    totalEarnings: number;
  }>;
  getCommissionStructure(): Promise<{
    productTiers: any[];
    roleTypes: any[];
    volumeBonusTiers: any[];
  }>;
}