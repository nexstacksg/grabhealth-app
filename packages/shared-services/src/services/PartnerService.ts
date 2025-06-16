import {
  IUser,
  ICommission,
  ICommissionStats,
  INetworkStats,
  INetwork,
} from '@app/shared-types';
import { IPartnerDataSource, PartnerDashboard, PartnerInvitation } from '../interfaces/IPartnerDataSource';

export interface PartnerServiceOptions {
  dataSource: IPartnerDataSource;
}

export class PartnerService {
  private dataSource: IPartnerDataSource;

  constructor(options: PartnerServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async getPartnerDashboard(): Promise<PartnerDashboard> {
    try {
      // Fetch multiple endpoints in parallel for dashboard data
      const [profile, network, commissionStats] = await Promise.all([
        this.dataSource.getUserProfile(),
        this.dataSource.getPartnerNetwork(),
        this.dataSource.getCommissionStats(),
      ]);

      // Calculate network metrics with defensive checks
      const totalPartners = network.rootUser ? this.countNetworkMembers(network.rootUser) : 0;
      const activePartners = network.rootUser ? this.countActiveMembers(network.rootUser) : 0;
      const recentPartners = network.rootUser ? this.getRecentPartners(network.rootUser) : [];

      return {
        referralCode: profile.referralCode || '',
        totalPartners,
        activePartners,
        totalEarnings: commissionStats.totalEarned,
        pendingEarnings: commissionStats.totalPending,
        thisMonthEarnings: commissionStats.thisMonth,
        networkDepth: network.totalLevels,
        recentPartners,
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to get partner dashboard');
    }
  }

  async getReferralCode(): Promise<string> {
    const user = await this.dataSource.getUserProfile();
    return user.referralCode || '';
  }

  async getPartnerNetwork(levels?: number): Promise<INetwork> {
    return await this.dataSource.getPartnerNetwork(levels);
  }

  async getNetworkStats(): Promise<INetworkStats> {
    return await this.dataSource.getNetworkStats();
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
    return await this.dataSource.getPartnerCommissions(params);
  }

  async getCommissionStats(): Promise<ICommissionStats> {
    return await this.dataSource.getCommissionStats();
  }

  async sendInvitation(invitation: PartnerInvitation): Promise<void> {
    return await this.dataSource.sendInvitation(invitation);
  }

  getReferralLink(referralCode: string): string {
    // Build the referral link for sharing
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  generateShareContent(referralCode: string): {
    whatsapp: string;
    facebook: string;
    twitter: string;
    email: string;
  } {
    const referralLink = this.getReferralLink(referralCode);
    const message = `Join me on GrabHealth and get amazing health products with great discounts! Use my referral code: ${referralCode}`;

    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=${encodeURIComponent('Join GrabHealth with me!')}&body=${encodeURIComponent(message + '\n\n' + referralLink)}`,
    };
  }

  // Helper methods for network calculations
  private countNetworkMembers(node: any): number {
    let count = 0;
    if (node && node.children && node.children.length > 0) {
      count += node.children.length;
      node.children.forEach((child: any) => {
        count += this.countNetworkMembers(child);
      });
    }
    return count;
  }

  private countActiveMembers(node: any): number {
    let count = 0;
    if (node && node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        if (child.isActive) count++;
        count += this.countActiveMembers(child);
      });
    }
    return count;
  }

  private getRecentPartners(node: any, limit: number = 5): IUser[] {
    const partners: IUser[] = [];

    const collectPartners = (n: any) => {
      if (n && n.children && n.children.length > 0) {
        n.children.forEach((child: any) => {
          partners.push({
            id: child.id,
            email: child.email,
            firstName: child.firstName,
            lastName: child.lastName,
            role: child.role,
            status: child.isActive ? 'ACTIVE' : 'INACTIVE',
            createdAt: new Date(child.joinedAt),
            updatedAt: new Date(child.joinedAt),
          } as IUser);
          collectPartners(child);
        });
      }
    };

    if (node) {
      collectPartners(node);
    }

    // Sort by most recent and return top N
    return partners
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}