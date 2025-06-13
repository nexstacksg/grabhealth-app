import { apiClient } from './api-client';
import { IUserPublic, IUserUpdate } from '@app/shared-types';

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileImageUploadResponse {
  imageUrl: string;
}

class ProfileService {
  private baseUrl = '/users';

  /**
   * Get current user profile
   */
  async getProfile(): Promise<IUserPublic> {
    const response = await apiClient.get<IUserPublic>(
      `${this.baseUrl}/profile`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch profile');
    }

    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<IUserPublic> {
    const response = await apiClient.put<IUserPublic>(
      `${this.baseUrl}/profile`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update profile');
    }

    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    const response = await apiClient.put<void>(
      `${this.baseUrl}/change-password`,
      data
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to change password');
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<ProfileImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ProfileImageUploadResponse>(
      `${this.baseUrl}/profile/image`,
      formData,
      {
        headers: {
          // Remove Content-Type to let browser set it with boundary
          'Content-Type': undefined as any,
        },
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to upload image');
    }

    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    const response = await apiClient.delete<void>(`${this.baseUrl}/account`, {
      body: JSON.stringify({ password }),
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete account');
    }
  }

  /**
   * Get user's referral code
   */
  async getReferralCode(): Promise<{ code: string; usageCount: number }> {
    const response = await apiClient.get<{ code: string; usageCount: number }>(
      `${this.baseUrl}/referral-code`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to fetch referral code'
      );
    }

    return response.data;
  }

  /**
   * Generate new referral code
   */
  async generateReferralCode(): Promise<{ code: string }> {
    const response = await apiClient.post<{ code: string }>(
      `${this.baseUrl}/referral-code`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to generate referral code'
      );
    }

    return response.data;
  }
}

export const profileService = new ProfileService();
export default profileService;
