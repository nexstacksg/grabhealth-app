import { apiClient } from './api-client';
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
    const response = await apiClient.get<DashboardStats>(
      `${this.baseUrl}/dashboard/stats`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to fetch dashboard stats'
      );
    }

    return response.data;
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
    const response = await apiClient.get<{
      users: IUser[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.baseUrl}/users`, { params });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch users');
    }

    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<IUser> {
    const response = await apiClient.get<IUser>(
      `${this.baseUrl}/users/${userId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch user');
    }

    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: Partial<IUser>): Promise<IUser> {
    const response = await apiClient.put<IUser>(
      `${this.baseUrl}/users/${userId}`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update user');
    }

    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete<void>(
      `${this.baseUrl}/users/${userId}`
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete user');
    }
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
    const response = await apiClient.get<{
      requests: IAccountRequest[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.baseUrl}/account-requests`, { params });

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to fetch account requests'
      );
    }

    return response.data;
  }

  /**
   * Update account request status
   */
  async updateAccountRequest(
    requestId: number,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<IAccountRequest> {
    const response = await apiClient.put<IAccountRequest>(
      `${this.baseUrl}/account-requests/${requestId}`,
      { status, reason }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to update account request'
      );
    }

    return response.data;
  }

  /**
   * Get network visualization data
   */
  async getNetworkData(userId?: string): Promise<INetworkNode> {
    const url = userId
      ? `${this.baseUrl}/networks/${userId}`
      : `${this.baseUrl}/networks`;

    const response = await apiClient.get<INetworkNode>(url);

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to fetch network data'
      );
    }

    return response.data;
  }

  /**
   * Get admin settings
   */
  async getSettings(): Promise<AdminSettings> {
    const response = await apiClient.get<AdminSettings>(
      `${this.baseUrl}/settings`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch settings');
    }

    return response.data;
  }

  /**
   * Update admin settings
   */
  async updateSettings(settings: AdminSettings): Promise<AdminSettings> {
    const response = await apiClient.put<AdminSettings>(
      `${this.baseUrl}/settings`,
      settings
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update settings');
    }

    return response.data;
  }

  /**
   * Initialize admin data
   */
  async initializeAdmin(): Promise<void> {
    const response = await apiClient.post<void>(`${this.baseUrl}/init`);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to initialize admin');
    }
  }

  /**
   * Update admin profile
   */
  async updateAdminProfile(data: {
    name?: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<void> {
    const response = await apiClient.post<void>(`${this.baseUrl}/profile`, data);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update admin profile');
    }
  }
}

export const adminService = new AdminService();
export default adminService;
