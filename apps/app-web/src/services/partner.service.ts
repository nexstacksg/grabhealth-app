import { apiClient } from './api-client';
import {
  IUser,
  ICommission,
  ICommissionStats,
  INetworkStats,
  INetwork,
} from '@app/shared-types';

interface PartnerDashboard {
  referralCode: string;
  totalPartners: number;
  activePartners: number;
  totalEarnings: number;
  pendingEarnings: number;
  thisMonthEarnings: number;
  networkDepth: number;
  recentPartners: IUser[];
}

interface PartnerInvitation {
  email: string;
  firstName: string;
  lastName: string;
  message?: string;
}

class PartnerService {
  private baseUrl = '/api/v1';

  /**
   * Get partner dashboard overview
   */
  async getPartnerDashboard(): Promise<PartnerDashboard> {
    try {
      // Fetch multiple endpoints in parallel for dashboard data
      const [profile, network, commissionStats] = await Promise.all([
        apiClient.get<IUser>(`${this.baseUrl}/users/profile`),
        apiClient.get<INetwork>(`${this.baseUrl}/commissions/network`),
        apiClient.get<ICommissionStats>(`${this.baseUrl}/commissions/stats`),
      ]);

      // Calculate network metrics
      const totalPartners = this.countNetworkMembers(network.rootUser);
      const activePartners = this.countActiveMembers(network.rootUser);
      const recentPartners = this.getRecentPartners(network.rootUser);

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

  /**
   * Get user's referral/partner code
   */
  async getReferralCode(): Promise<string> {
    const user = await apiClient.get<IUser>(`${this.baseUrl}/users/profile`);
    return user.referralCode || '';
  }

  /**
   * Get partner network structure
   */
  async getPartnerNetwork(levels?: number): Promise<INetwork> {
    return await apiClient.get<INetwork>(
      `${this.baseUrl}/commissions/network`,
      { params: levels ? { levels } : undefined }
    );
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<INetworkStats> {
    return await apiClient.get<INetworkStats>(
      `${this.baseUrl}/commissions/network/stats`
    );
  }

  /**
   * Get partner commissions
   */
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
    return await apiClient.get<{
      commissions: ICommission[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.baseUrl}/commissions/my-commissions`, { params });
  }

  /**
   * Get commission statistics
   */
  async getCommissionStats(): Promise<ICommissionStats> {
    return await apiClient.get<ICommissionStats>(
      `${this.baseUrl}/commissions/stats`
    );
  }

  /**
   * Send partner invitation (email)
   * Note: This would require a backend endpoint to be implemented
   */
  async sendInvitation(invitation: PartnerInvitation): Promise<void> {
    // This endpoint doesn't exist yet in the backend
    // It would need to be implemented to send invitation emails
    await apiClient.post<void>(`${this.baseUrl}/partners/invite`, invitation);
  }

  /**
   * Get referral link for sharing
   */
  getReferralLink(referralCode: string): string {
    // Build the referral link for sharing
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  /**
   * Generate shareable content for social media
   */
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

  /**
   * Helper methods for network calculations
   */
  private countNetworkMembers(node: any): number {
    let count = 0;
    if (node.children && node.children.length > 0) {
      count += node.children.length;
      node.children.forEach((child: any) => {
        count += this.countNetworkMembers(child);
      });
    }
    return count;
  }

  private countActiveMembers(node: any): number {
    let count = 0;
    if (node.children && node.children.length > 0) {
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
      if (n.children && n.children.length > 0) {
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

    collectPartners(node);

    // Sort by most recent and return top N
    return partners
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const partnerService = new PartnerService();
export default partnerService;
