import {
  IUser,
  ICommission,
  ICommissionStats,
  INetworkStats,
  INetwork,
} from '@app/shared-types';

export interface PartnerDashboard {
  referralCode: string;
  totalPartners: number;
  activePartners: number;
  totalEarnings: number;
  pendingEarnings: number;
  thisMonthEarnings: number;
  networkDepth: number;
  recentPartners: IUser[];
}

export interface PartnerInvitation {
  email: string;
  firstName: string;
  lastName: string;
  message?: string;
}

export interface IPartnerDataSource {
  getUserProfile(): Promise<IUser>;
  getPartnerNetwork(levels?: number): Promise<INetwork>;
  getNetworkStats(): Promise<INetworkStats>;
  getPartnerCommissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    commissions: ICommission[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getCommissionStats(): Promise<ICommissionStats>;
  sendInvitation(invitation: PartnerInvitation): Promise<void>;
}