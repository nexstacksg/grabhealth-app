/**
 * Commission Service - Handles all commission related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { ICommission, ApiResponse } from '@app/shared-types';

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

class CommissionService extends BaseService {
  async getMyCommissions(params?: { 
    page?: number; 
    limit?: number 
  }): Promise<{ commissions: ICommission[]; total: number; page: number; totalPages: number }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<ApiResponse<{ commissions: ICommission[]; pagination: any }>>(`/commissions${queryString}`);
      const data = this.extractData(response);
      
      return {
        commissions: data.commissions || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 0,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCommissionStats(): Promise<CommissionStats> {
    try {
      const response = await apiClient.get<ApiResponse<CommissionStats>>('/commissions/stats');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNetwork(): Promise<NetworkNode> {
    try {
      const response = await apiClient.get<ApiResponse<NetworkNode>>('/commissions/network');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const response = await apiClient.get<ApiResponse<NetworkStats>>('/commissions/network/stats');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCommission(id: string): Promise<ICommission> {
    try {
      const response = await apiClient.get<ApiResponse<ICommission>>(`/commissions/${id}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async initializeCommissionSystem(): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/admin/commissions/initialize');
      this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCommissionData(): Promise<CommissionData> {
    try {
      const response = await apiClient.get<ApiResponse<CommissionData>>('/commissions/data');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCommissionStructure(): Promise<CommissionStructure> {
    try {
      const response = await apiClient.get<ApiResponse<CommissionStructure>>('/commissions/structure');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const commissionService = new CommissionService('/commissions');