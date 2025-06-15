import { apiClient } from './api-client';
import {
  IUserPublic,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  ProfileImageUploadResponse,
} from '@app/shared-types';

class ProfileService {
  private baseUrl = '/users';

  /**
   * Get current user profile
   */
  async getProfile(): Promise<IUserPublic> {
    return await apiClient.get<IUserPublic>(
      `${this.baseUrl}/profile`
    );
  }

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<IUserPublic> {
    return await apiClient.put<IUserPublic>(
      `${this.baseUrl}/profile`,
      data
    );
  }

  /**
   * Change password
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    await apiClient.put<void>(
      `${this.baseUrl}/change-password`,
      data
    );
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<ProfileImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return await apiClient.post<ProfileImageUploadResponse>(
      `${this.baseUrl}/profile/image`,
      formData,
      {
        headers: {
          // Remove Content-Type to let browser set it with boundary
          'Content-Type': undefined as any,
        },
      }
    );
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/account`, {
      data: { password },
    });
  }

  /**
   * Get user's referral code
   */
  async getReferralCode(): Promise<{ code: string; usageCount: number }> {
    return await apiClient.get<{ code: string; usageCount: number }>(
      `${this.baseUrl}/referral-code`
    );
  }

  /**
   * Generate new referral code
   */
  async generateReferralCode(): Promise<{ code: string }> {
    return await apiClient.post<{ code: string }>(
      `${this.baseUrl}/referral-code`
    );
  }
}

export const profileService = new ProfileService();
export default profileService;
