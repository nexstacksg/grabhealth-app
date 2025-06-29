/**
 * Commission Service - Handles all commission related API calls for Strapi backend
 */


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

  // Handle both direct data and Strapi's wrapped format
  const data = strapiCommission.attributes || strapiCommission;

  return {
    id: parseInt(strapiCommission.id || data.id || '0'),
    orderId: parseInt(data.order?.data?.id || data.order?.id || data.orderId || '0'),
    userId: (data.user?.data?.id || data.user?.id || data.userId || '').toString(),
    recipientId: (data.recipient?.data?.id || data.recipient?.id || data.recipientId || '').toString(),
    amount: parseFloat(data.amount || 0),
    commissionRate: parseFloat(data.commissionRate || 0),
    relationshipLevel: parseInt(data.relationshipLevel || 0),
    type: data.type || 'DIRECT',
    status: data.status || 'PENDING',
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
      // Build query params for Strapi
      const queryParams = new URLSearchParams();
      
      // Filter by current user as recipient - Strapi doesn't support 'me' in filters
      // This needs to be handled by custom controller or use actual user ID
      // For now, we'll fetch all and filter client-side
      queryParams.append('populate[recipient]', 'true');
      
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

      const response = await this.api.get<StrapiCommissionsResponse>(
        `/commissions?${queryParams.toString()}`
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
      // Only log detailed error if it's not a 404 or 403
      if (error?.status !== 404 && error?.status !== 403) {
        console.error('Error fetching commissions:', error.message || error);
      }
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
      
      const response = await this.api.get<StrapiCommissionsResponse>(
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
      const response = await this.api.get<StrapiCommissionResponse>(
        `/commissions/${id}?populate=*`
      );
      
      return transformStrapiCommission(response.data);
    } catch (error) {
      this.handleError(error);
      // TypeScript requires a return value - throw to propagate the error
      throw error;
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
      // Fetch multiple data points in parallel
      const [commissionsData, currentUserResp, uplineResp, downlineResp] = await Promise.all([
        this.getMyCommissions({ limit: 50 }),
        this.api.get('/users/me').catch(() => ({ id: null })),
        this.api.get('/user-relationships?filters[user][id][$eq]=me&populate[upline]=*').catch(() => ({ data: [] })),
        this.api.get('/user-relationships?filters[upline][id][$eq]=me&populate[user]=*').catch(() => ({ data: [] }))
      ]);
      
      const currentUser = currentUserResp as any;
      const uplineRelations = Array.isArray((uplineResp as any).data) ? (uplineResp as any).data : [];
      const downlineRelations = Array.isArray((downlineResp as any).data) ? (downlineResp as any).data : [];
      
      // Get upline from relationships
      let uplineData = null;
      if (uplineRelations.length > 0) {
        const rel = uplineRelations[0];
        const uplineUser = rel.upline?.data || rel.upline || null;
        if (uplineUser) {
          uplineData = {
            id: uplineUser.id,
            user_id: uplineUser.id,
            upline_id: null,
            relationship_level: 1,
            created_at: rel.createdAt || rel.attributes?.createdAt,
            updated_at: rel.updatedAt || rel.attributes?.updatedAt,
            name: `${uplineUser.firstName || ''} ${uplineUser.lastName || ''}`.trim(),
            email: uplineUser.email,
          };
        }
      }
      
      // Transform downlines
      const downlinesData = downlineRelations.map((rel: any) => {
        const userData = rel.user?.data || rel.user || {};
        return {
          id: rel.id,
          user_id: userData.id || rel.userId,
          upline_id: currentUser?.id,
          relationship_level: rel.relationshipLevel || rel.attributes?.relationshipLevel || 1,
          created_at: rel.createdAt || rel.attributes?.createdAt,
          updated_at: rel.updatedAt || rel.attributes?.updatedAt,
          name: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : '',
          email: userData.email || '',
        };
      });
      
      const totalEarnings = commissionsData.commissions.reduce(
        (sum, c) => sum + c.amount, 
        0
      );
      
      return {
        upline: uplineData,
        downlines: downlinesData,
        commissions: commissionsData.commissions,
        points: 0, // Would need to calculate from orders
        referralLink: typeof window !== 'undefined' ? `${window.location.origin}/auth/register?ref=${currentUser?.id || 'me'}` : '',
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
      // Fetch commission tiers from Strapi
      const tiersResponse = await this.api.get<StrapiCommissionsResponse>('/commission-tiers?sort=tierLevel:asc');
      const tiers = (tiersResponse as any).data || [];
      
      // Transform Strapi data to our structure
      const levels = tiers.map((tier: any) => {
        const tierData = tier.attributes || tier;
        return {
          level: tierData.tierLevel || tier.tierLevel,
          name: tierData.tierName || tier.tierName,
          rate: parseFloat(tierData.directCommissionRate || tier.directCommissionRate || 0) / 100, // Convert percentage to decimal
        };
      });
      
      // Build rates object from tiers
      const rates: Record<string, number> = {};
      tiers.forEach((tier: any) => {
        const tierData = tier.attributes || tier;
        const tierName = tierData.tierName || tier.tierName || '';
        const roleName = tierName.toUpperCase().replace(/ /g, '_');
        const commissionRate = tierData.directCommissionRate || tier.directCommissionRate || 0;
        rates[roleName] = parseFloat(commissionRate) / 100;
      });
      
      // Only return what we have from Strapi, no hardcoded defaults
      return {
        levels,
        rates,
      };
    } catch (error) {
      console.error('Error fetching commission structure from Strapi:', error);
      // Return empty structure instead of hardcoded defaults
      return {
        levels: [],
        rates: {},
      };
    }
  }
}

export const commissionService = new CommissionService('/commissions');