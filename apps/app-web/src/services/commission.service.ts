/**
 * Commission Service - Handles all commission related API calls for Strapi backend
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { ICommission, ApiResponse } from '@app/shared-types';
import { transformStrapiUser } from './strapi-base';

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
  levels: any[];
  rates: Record<string, number>;
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

// Transform Strapi commission to our ICommission format
function transformStrapiCommission(strapiCommission: any): ICommission {
  if (!strapiCommission) {
    throw new Error('Invalid commission data');
  }

  return {
    id: strapiCommission.id?.toString() || '',
    orderId: strapiCommission.order?.id?.toString() || '',
    userId: strapiCommission.user?.id?.toString() || '',
    recipientId: strapiCommission.recipient?.id?.toString() || '',
    recipient: strapiCommission.recipient ? transformStrapiUser(strapiCommission.recipient) : undefined,
    amount: parseFloat(strapiCommission.amount || 0),
    commissionRate: parseFloat(strapiCommission.commissionRate || 0),
    relationshipLevel: strapiCommission.relationshipLevel || 0,
    type: strapiCommission.type || 'DIRECT',
    status: strapiCommission.status || 'PENDING',
    pvPoints: strapiCommission.pvPoints || 0,
    createdAt: new Date(strapiCommission.createdAt),
    updatedAt: new Date(strapiCommission.updatedAt),
  };
}

class CommissionService extends BaseService {
  async getMyCommissions(params?: { 
    page?: number; 
    limit?: number 
  }): Promise<{ commissions: ICommission[]; total: number; page: number; totalPages: number }> {
    try {
      // Build query params for Strapi
      const queryParams = new URLSearchParams();
      
      // Filter by current user as recipient
      queryParams.append('filters[recipient][id][$eq]', 'me');
      
      if (params?.page) {
        queryParams.append('pagination[page]', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('pagination[pageSize]', params.limit.toString());
      }
      
      // Populate relations
      queryParams.append('populate[recipient]', '*');
      queryParams.append('populate[user]', '*');
      queryParams.append('populate[order]', '*');
      
      // Sort by creation date (newest first)
      queryParams.append('sort', 'createdAt:desc');

      const response = await apiClient.get<StrapiCommissionsResponse>(
        `/commissions?${queryParams.toString()}`
      );

      const commissions = response.data.map(transformStrapiCommission);
      const pagination = response.meta?.pagination || {};

      return {
        commissions,
        total: pagination.total || commissions.length,
        page: pagination.page || 1,
        totalPages: pagination.pageCount || 1,
      };
    } catch (error) {
      console.error('Error fetching commissions:', error);
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
      // This would need a custom controller in Strapi
      // For now, fetch all commissions and calculate stats client-side
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
      // Fetch user relationships to build network
      const queryParams = new URLSearchParams();
      queryParams.append('filters[upline][id][$eq]', 'me');
      queryParams.append('populate[user]', '*');
      queryParams.append('populate[upline]', '*');
      
      const response = await apiClient.get<StrapiCommissionsResponse>(
        `/user-relationships?${queryParams.toString()}`
      );

      // Build network tree from relationships
      const downlines = response.data || [];
      
      const buildNode = (user: any, level: number = 1): NetworkNode => ({
        id: user.id?.toString() || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email || '',
        level,
        children: [], // Would need recursive fetching for deeper levels
      });

      const rootNode: NetworkNode = {
        id: 'me',
        name: 'You',
        email: '',
        level: 0,
        children: downlines.map((rel: any) => buildNode(rel.user, 1)),
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
      const response = await apiClient.get<StrapiCommissionResponse>(
        `/commissions/${id}?populate=*`
      );
      
      return transformStrapiCommission(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async initializeCommissionSystem(): Promise<void> {
    try {
      // This would need a custom controller in Strapi
      // For now, just return success
      console.log('Commission system initialization requested');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCommissionData(): Promise<CommissionData> {
    try {
      // Fetch multiple data points
      const [commissionsData, network] = await Promise.all([
        this.getMyCommissions({ limit: 50 }),
        this.getNetwork(),
      ]);
      
      const totalEarnings = commissionsData.commissions.reduce(
        (sum, c) => sum + c.amount, 
        0
      );
      
      return {
        upline: null, // Would need to fetch from user relationships
        downlines: network.children,
        commissions: commissionsData.commissions,
        points: 0, // Would need to calculate from orders
        referralLink: `${window.location.origin}/auth/register?ref=me`,
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
      // This would need a custom controller in Strapi
      // For now, return default structure
      return {
        levels: [
          { level: 1, name: 'Direct Sales', rate: 0.30 },
          { level: 2, name: 'Team Leader', rate: 0.10 },
          { level: 3, name: 'Manager', rate: 0.05 },
          { level: 4, name: 'Platform', rate: 0.05 },
        ],
        rates: {
          SALES: 0.30,
          LEADER: 0.10,
          MANAGER: 0.05,
          COMPANY: 0.05,
        },
      };
    } catch (error) {
      console.error('Error fetching commission structure:', error);
      return {
        levels: [],
        rates: {},
      };
    }
  }
}

export const commissionService = new CommissionService('/commissions');