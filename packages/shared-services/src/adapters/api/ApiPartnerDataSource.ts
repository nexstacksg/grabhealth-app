import {
  IUser,
  ICommission,
  ICommissionStats,
  INetworkStats,
  INetwork,
} from '@app/shared-types';
import { IPartnerDataSource, PartnerInvitation } from '../../interfaces/IPartnerDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiPartnerDataSource extends BaseApiDataSource implements IPartnerDataSource {

  async getUserProfile(): Promise<IUser> {
    return this.get<IUser>('/users/profile');
  }

  async getPartnerNetwork(levels?: number): Promise<INetwork> {
    const params = levels ? { levels } : undefined;
    return this.get<INetwork>('/commissions/network', params);
  }

  async getNetworkStats(): Promise<INetworkStats> {
    return this.get<INetworkStats>('/commissions/network/stats');
  }

  async getPartnerCommissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    commissions: ICommission[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.get<{
      commissions: ICommission[];
      total: number;
      page: number;
      totalPages: number;
    }>('/commissions/my-commissions', params);
  }

  async getCommissionStats(): Promise<ICommissionStats> {
    return this.get<ICommissionStats>('/commissions/stats');
  }

  async sendInvitation(invitation: PartnerInvitation): Promise<void> {
    return this.post<void>('/partners/invite', invitation);
  }
}