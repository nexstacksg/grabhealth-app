/**
 * Commission Service - Handles all commission related API calls for Strapi backend
 */

import { BaseService } from './base.service';
import { ICommission, CommissionType } from '@app/shared-types';

interface CommissionStats {
  totalEarnings: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
}

interface NetworkNode {
  id: string;
  name: string;
  email: string;
  level: number;
  children: NetworkNode[];
}

interface NetworkStats {
  totalDownlines: number;
  levelCounts: Record<number, number>;
  totalSalesVolume: number;
}

interface CommissionData {
  upline: any;
  downlines: any[];
  commissions: ICommission[];
  points: number;
  referralLink: string;
  totalEarnings: number;
}

interface CommissionStructure {
  levels: CommissionLevel[];
  rates: Record<string, number>;
}

interface CommissionLevel {
  level: number;
  name: string;
  rate: number;
}

interface UserAchievement {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  achievedValue: number;
  rewardStatus: 'in_progress' | 'qualified' | 'claimed' | 'paid';
  claimedAt?: Date;
  paidAt?: Date;
  reward: {
    id: string;
    rewardName: string;
    rewardType: string;
    criteriaType: string;
    criteriaValue: number;
    rewardValue: number;
    periodType: string;
  };
}

// Strapi response formats
interface StrapiCommissionResponse {
  data: any;
  meta?: any;
}

interface StrapiCommissionsResponse {
  data: any[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Transform Strapi commission calculation to our ICommission format
function transformStrapiCommission(strapiCommission: any): ICommission {
  if (!strapiCommission) {
    throw new Error('Invalid commission data');
  }

  // Handle both direct data and Strapi's wrapped format
  const data = strapiCommission.attributes || strapiCommission;

  // Map Strapi's commission level to commission type
  // commissionLevel: 0 = direct, 1+ = indirect
  let type: CommissionType | undefined;
  const level = parseInt(data.commissionLevel || 0);
  if (level === 0) {
    type = CommissionType.DIRECT;
  } else if (level > 0) {
    type = CommissionType.INDIRECT;
  }

  return {
    documentId: strapiCommission.documentId || strapiCommission.id || data.documentId || '',
    orderId: (data.order?.data?.documentId || data.order?.documentId || data.order?.data?.id || data.order?.id || data.orderId || '').toString(),
    userId: (data.beneficiary?.data?.id || data.beneficiary?.id || data.beneficiaryId || '').toString(),
    recipientId: (data.beneficiary?.data?.id || data.beneficiary?.id || data.beneficiaryId || '').toString(),
    amount: parseFloat(data.commissionAmount || 0),
    commissionRate: parseFloat(data.commissionRate || 0),
    relationshipLevel: level,
    type,
    status: data.calculationStatus?.toUpperCase() || 'PENDING',
    createdAt: new Date(data.createdAt || strapiCommission.createdAt),
    updatedAt: new Date(data.updatedAt || strapiCommission.updatedAt),
  };
}

class CommissionService extends BaseService {
  async getMyCommissions(params?: { 
    page?: number; 
    limit?: number 
  }): Promise<{ commissions: ICommission[]; total: number; page: number; totalPages: number }> {
    try {
      // Get current user
      const userResponse = await this.api.get('users/me');
      const userId = userResponse.id;

      if (!userId) {
        return {
          commissions: [],
          total: 0,
          page: 1,
          totalPages: 0,
        };
      }

      // Get commission calculations for the user
      const queryParams = new URLSearchParams();
      queryParams.append('filters[beneficiary][id][$eq]', userId.toString());
      queryParams.append('populate[order]', 'true');
      queryParams.append('populate[appliedTemplate]', 'true');
      queryParams.append('sort', 'createdAt:desc');
      
      if (params?.page) {
        queryParams.append('pagination[page]', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('pagination[pageSize]', params.limit.toString());
      }

      const response = await this.api.get<StrapiCommissionsResponse>(
        `commission-calculations?${queryParams.toString()}`
      );

      const commissions = (response.data || []).map(transformStrapiCommission);
      const pagination = response.meta?.pagination || {
        total: commissions.length,
        page: 1,
        pageCount: 1
      };

      return {
        commissions,
        total: pagination.total,
        page: pagination.page,
        totalPages: pagination.pageCount,
      };
    } catch (error: any) {
      console.error('Error fetching commissions:', error.message || error);
      return {
        commissions: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  }

  async getCommissionStats(): Promise<CommissionStats> {
    try {
      // Use getMyCommissions to fetch data and calculate stats
      const { commissions } = await this.getMyCommissions({ limit: 100 });
      
      const stats: CommissionStats = {
        totalEarnings: commissions.reduce((sum, c) => sum + c.amount, 0),
        totalCommissions: commissions.length,
        pendingCommissions: commissions.filter(c => c.status === 'PENDING').length,
        paidCommissions: commissions.filter(c => c.status === 'PAID').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching commission stats:', error);
      return {
        totalEarnings: 0,
        totalCommissions: 0,
        pendingCommissions: 0,
        paidCommissions: 0,
      };
    }
  }

  async getNetwork(): Promise<NetworkNode> {
    try {
      // Get current user with downlines
      const userResponse = await this.api.get('users/me?populate=downlines');
      const currentUser = userResponse;

      const buildNode = (user: any, level: number = 1): NetworkNode => ({
        id: user.id?.toString() || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email || '',
        level,
        children: user.downlines?.map((downline: any) => buildNode(downline, level + 1)) || [],
      });

      const rootNode: NetworkNode = {
        id: currentUser.id?.toString() || 'me',
        name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'You',
        email: currentUser.email || '',
        level: 0,
        children: currentUser.downlines?.map((downline: any) => buildNode(downline, 1)) || [],
      };

      return rootNode;
    } catch (error) {
      console.error('Error fetching network:', error);
      return {
        id: 'me',
        name: 'You',
        email: '',
        level: 0,
        children: [],
      };
    }
  }

  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const network = await this.getNetwork();
      
      let totalDownlines = 0;
      const levelCounts: Record<number, number> = {};
      
      const countNodes = (node: NetworkNode) => {
        if (node.level > 0) {
          totalDownlines++;
          levelCounts[node.level] = (levelCounts[node.level] || 0) + 1;
        }
        node.children.forEach(countNodes);
      };
      
      countNodes(network);
      
      return {
        totalDownlines,
        levelCounts,
        totalSalesVolume: 0, // Would need order data to calculate
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return {
        totalDownlines: 0,
        levelCounts: {},
        totalSalesVolume: 0,
      };
    }
  }

  async getCommission(id: string): Promise<ICommission> {
    try {
      const response = await this.api.get<StrapiCommissionResponse>(
        `commission-calculations/${id}?populate=*`
      );
      
      return transformStrapiCommission(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async initializeCommissionSystem(): Promise<void> {
    try {
      console.log('Commission system initialization requested');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCommissionData(): Promise<CommissionData> {
    try {
      // Fetch multiple data points in parallel
      const [commissionsData, currentUserResp] = await Promise.all([
        this.getMyCommissions({ limit: 50 }),
        this.api.get('users/me?populate=upline,downlines')
      ]);
      
      const currentUser = currentUserResp as any;
      
      // Get upline data
      let uplineData = null;
      if (currentUser.upline) {
        const uplineUser = currentUser.upline;
        uplineData = {
          id: uplineUser.id,
          user_id: uplineUser.id,
          upline_id: null,
          relationship_level: 1,
          created_at: uplineUser.createdAt,
          updated_at: uplineUser.updatedAt,
          name: `${uplineUser.firstName || ''} ${uplineUser.lastName || ''}`.trim(),
          email: uplineUser.email,
        };
      }
      
      // Transform downlines
      const downlinesData = (currentUser.downlines || []).map((user: any) => ({
        id: user.id,
        user_id: user.id,
        upline_id: currentUser.id,
        relationship_level: 1,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email || '',
      }));
      
      const totalEarnings = commissionsData.commissions.reduce(
        (sum, c) => sum + c.amount, 
        0
      );
      
      // Use referralCode from user data
      const referralLink = currentUser.referralCode || 
        (typeof window !== 'undefined' ? `${window.location.origin}/auth/register?referrer=${currentUser.referralCode || currentUser.id}` : '');
      
      return {
        upline: uplineData,
        downlines: downlinesData,
        commissions: commissionsData.commissions,
        points: 0,
        referralLink,
        totalEarnings,
      };
    } catch (error) {
      console.error('Error fetching commission data:', error);
      return {
        upline: null,
        downlines: [],
        commissions: [],
        points: 0,
        referralLink: '',
        totalEarnings: 0,
      };
    }
  }

  async getCommissionStructure(): Promise<CommissionStructure> {
    try {
      // Fetch active commission templates using custom endpoint
      const response = await this.api.get<StrapiCommissionsResponse>('commission-templates/active');
      
      // Handle different response formats
      let templates: any[] = [];
      if (response) {
        if (Array.isArray(response)) {
          templates = response;
        } else if (response.data && Array.isArray(response.data)) {
          templates = response.data;
        } else if (response.data) {
          templates = [response.data];
        }
      }
      
      // Extract unique levels from all templates
      const levelMap = new Map<number, CommissionLevel>();
      
      templates.forEach((template: any) => {
        // Handle Strapi v5 response format
        const templateData = template.attributes || template;
        const detailsData = templateData.details?.data || templateData.details || [];
        const details = Array.isArray(detailsData) ? detailsData : [];
        
        details.forEach((detail: any) => {
          const detailData = detail.attributes || detail;
          const customerType = detailData.customerType || 'all';
          
          // For now, we process rates for 'all' customer types
          // You may want to expand this to handle customer-specific rates
          if (customerType === 'all' || customerType === 'regular') {
            if (detailData.levelType === 'direct' && detailData.levelNumber === 0) {
              levelMap.set(0, {
                level: 0,
                name: 'Direct Sales',
                rate: detailData.commissionValue / 100
              });
            } else if (detailData.levelType && detailData.levelType.startsWith('upline_')) {
              const level = parseInt(detailData.levelType.split('_')[1]);
              levelMap.set(level, {
                level,
                name: `Level ${level} Upline`,
                rate: detailData.commissionValue / 100
              });
            }
          }
        });
      });
      
      const levels = Array.from(levelMap.values()).sort((a, b) => a.level - b.level);
      
      // Build rates object
      const rates: Record<string, number> = {};
      levels.forEach(level => {
        rates[`LEVEL_${level.level}`] = level.rate;
      });
      
      // If no templates found, return empty structure to let component handle defaults
      if (levels.length === 0) {
        console.warn('No commission templates found in API response');
        return {
          levels: [],
          rates: {}
        };
      }

      return {
        levels,
        rates,
      };
    } catch (error: any) {
      console.error('Error fetching commission structure:', error?.message || error);
      // Return empty structure to let component handle defaults
      return {
        levels: [],
        rates: {}
      };
    }
  }

  async calculateCommissionForOrder(orderId: number): Promise<any> {
    try {
      const response = await this.api.post(`commissions/calculate/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw error;
    }
  }

  async approveCommissions(commissionIds: number[]): Promise<any> {
    try {
      const response = await this.api.post('commissions/approve', { commissionIds });
      return response.data;
    } catch (error) {
      console.error('Error approving commissions:', error);
      throw error;
    }
  }

  async markCommissionsAsPaid(commissionIds: number[]): Promise<any> {
    try {
      const response = await this.api.post('commissions/mark-paid', { commissionIds });
      return response.data;
    } catch (error) {
      console.error('Error marking commissions as paid:', error);
      throw error;
    }
  }

  async getUserAchievements(): Promise<UserAchievement[]> {
    try {
      // Get current user
      const userResponse = await this.api.get('users/me');
      const userId = userResponse.id;

      if (!userId) {
        return [];
      }

      // Get user achievements with reward details
      const queryParams = new URLSearchParams();
      queryParams.append('filters[user][id][$eq]', userId.toString());
      queryParams.append('populate[reward]', 'true');
      queryParams.append('sort', 'createdAt:desc');

      const response = await this.api.get<StrapiCommissionsResponse>(
        `user-achievements?${queryParams.toString()}`
      );

      const achievements = (response.data || []).map((achievement: any) => {
        const data = achievement.attributes || achievement;
        const rewardData = data.reward?.data?.attributes || data.reward?.data || data.reward || {};

        return {
          id: achievement.documentId || achievement.id || '',
          periodStart: new Date(data.periodStart),
          periodEnd: new Date(data.periodEnd),
          achievedValue: parseFloat(data.achievedValue || 0),
          rewardStatus: data.rewardStatus || 'in_progress',
          claimedAt: data.claimedAt ? new Date(data.claimedAt) : undefined,
          paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
          reward: {
            id: data.reward?.data?.id || data.reward?.id || '',
            rewardName: rewardData.rewardName || '',
            rewardType: rewardData.rewardType || '',
            criteriaType: rewardData.criteriaType || '',
            criteriaValue: parseFloat(rewardData.criteriaValue || 0),
            rewardValue: parseFloat(rewardData.rewardValue || 0),
            periodType: rewardData.periodType || '',
          },
        };
      });

      return achievements;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  async getAchievementSummary(): Promise<{
    totalQualified: number;
    totalClaimed: number;
    totalPaid: number;
    inProgress: number;
    achievements: UserAchievement[];
  }> {
    try {
      const achievements = await this.getUserAchievements();

      return {
        totalQualified: achievements.filter(a => a.rewardStatus === 'qualified').length,
        totalClaimed: achievements.filter(a => a.rewardStatus === 'claimed').length,
        totalPaid: achievements.filter(a => a.rewardStatus === 'paid').length,
        inProgress: achievements.filter(a => a.rewardStatus === 'in_progress').length,
        achievements,
      };
    } catch (error) {
      console.error('Error fetching achievement summary:', error);
      return {
        totalQualified: 0,
        totalClaimed: 0,
        totalPaid: 0,
        inProgress: 0,
        achievements: [],
      };
    }
  }
}

export const commissionService = new CommissionService('');