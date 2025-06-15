import { apiClient } from './api-client';
import {
  IUserPublic,
  PaginatedResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSearchParams,
} from '@app/shared-types';

class UserService {
  private baseUrl = '/users';

  /**
   * Get current user profile
   */
  async getMyProfile(): Promise<IUserPublic> {
    return await apiClient.get<IUserPublic>(
      `${this.baseUrl}/my-profile`
    );
  }

  /**
   * Update current user profile
   */
  async updateMyProfile(data: UpdateProfileRequest): Promise<IUserPublic> {
    return await apiClient.put<IUserPublic>(
      `${this.baseUrl}/my-profile`,
      data
    );
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    // For file uploads, we need to use fetch directly
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1${this.baseUrl}/my-profile/photo`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload photo');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post<void>(
      `${this.baseUrl}/change-password`,
      data
    );
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<IUserPublic> {
    return await apiClient.get<IUserPublic>(
      `${this.baseUrl}/${userId}`
    );
  }

  /**
   * List users (admin only)
   */
  async listUsers(
    params?: UserSearchParams
  ): Promise<PaginatedResponse<IUserPublic>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return await apiClient.get<PaginatedResponse<IUserPublic>>(
      `${this.baseUrl}?${queryParams.toString()}`
    );
  }

  /**
   * Update user by ID (admin only)
   */
  async updateUser(
    userId: string,
    data: Partial<IUserPublic>
  ): Promise<IUserPublic> {
    return await apiClient.put<IUserPublic>(
      `${this.baseUrl}/${userId}`,
      data
    );
  }

  /**
   * Delete user by ID (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/${userId}`);
  }
}

export const userService = new UserService();
export default userService;
