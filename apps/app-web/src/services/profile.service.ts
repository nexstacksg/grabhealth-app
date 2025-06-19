/**
 * Profile Service - Handles all profile related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { IUserPublic, ApiResponse } from '@app/shared-types';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UserProfile extends IUserPublic {
  referralCode?: string;
  membership?: {
    tier: string;
    points: number;
    joinedAt: string;
  };
}

class ProfileService extends BaseService {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/profile');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await apiClient.put<ApiResponse<UserProfile>>('/auth/profile', data);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/profile/change-password', data);
      this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadProfileImage(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<ApiResponse<{ url: string }>>(
        '/auth/profile/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/auth/profile');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getReferralCode(): Promise<string> {
    try {
      const response = await apiClient.get<ApiResponse<{ code: string }>>('/auth/profile/referral-code');
      const data = this.extractData(response);
      return data.code;
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateReferralCode(): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<{ code: string }>>('/auth/profile/generate-referral-code');
      const data = this.extractData(response);
      return data.code;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const profileService = new ProfileService('/auth/profile');