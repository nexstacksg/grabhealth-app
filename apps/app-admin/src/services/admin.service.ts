import { api } from './api';
import {
  IUser,
  DashboardStats,
  IAccountRequest,
  INetworkNode,
  AdminSettings,
} from '@app/shared-types';

class AdminService {
  private baseUrl = '/admin';

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return await api.get<DashboardStats>(
      `${this.baseUrl}/dashboard/stats`
    );
  }

  /**
   * Get all users with pagination
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{
    users: IUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryString = this.buildQueryString(params);
    return await api.get<{
      users: IUser[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.baseUrl}/users${queryString}`);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<IUser> {
    return await api.get<IUser>(
      `${this.baseUrl}/users/${userId}`
    );
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: Partial<IUser>): Promise<IUser> {
    return await api.put<IUser>(
      `${this.baseUrl}/users/${userId}`,
      data
    );
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    return await api.delete<void>(
      `${this.baseUrl}/users/${userId}`
    );
  }

  /**
   * Get account requests
   */
  async getAccountRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    requests: IAccountRequest[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryString = this.buildQueryString(params);
    return await api.get<{
      requests: IAccountRequest[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.baseUrl}/account-requests${queryString}`);
  }

  /**
   * Update account request status
   */
  async updateAccountRequest(
    requestId: number,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<IAccountRequest> {
    return await api.put<IAccountRequest>(
      `${this.baseUrl}/account-requests/${requestId}`,
      { status, reason }
    );
  }

  /**
   * Get network visualization data
   */
  async getNetworkData(userId?: string): Promise<INetworkNode> {
    const url = userId
      ? `${this.baseUrl}/networks/${userId}`
      : `${this.baseUrl}/networks`;

    return await api.get<INetworkNode>(url);
  }

  /**
   * Get admin settings
   */
  async getSettings(): Promise<AdminSettings> {
    return await api.get<AdminSettings>(
      `${this.baseUrl}/settings`
    );
  }

  /**
   * Update admin settings
   */
  async updateSettings(settings: AdminSettings): Promise<AdminSettings> {
    return await api.put<AdminSettings>(
      `${this.baseUrl}/settings`,
      settings
    );
  }

  /**
   * Initialize admin data
   */
  async initializeAdmin(): Promise<void> {
    return await api.post<void>(`${this.baseUrl}/init`);
  }

  /**
   * Update admin profile
   */
  async updateAdminProfile(data: {
    name?: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<void> {
    return await api.post<void>(`${this.baseUrl}/profile`, data);
  }

  /**
   * Build query string from params object
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

export const adminService = new AdminService();
export default adminService;