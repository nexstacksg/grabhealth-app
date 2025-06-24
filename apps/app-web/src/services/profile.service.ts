/**
 * Profile Service - Handles all profile related API calls for Strapi
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import {
  IUserPublic,
  IProfileUpdateRequest,
  IPasswordChangeRequest,
} from '@app/shared-types';
import { api, getUserId } from './api.service';

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
      return await api.auth.getCurrentUser() as UserProfile;
    } catch (error) {
      console.error('Get profile error:', error);
      this.handleError(error);
    }
  }

  async updateProfile(data: IProfileUpdateRequest): Promise<UserProfile> {
    try {
      // Get current user
      const currentUser = await api.auth.getCurrentUser();
      const userId = getUserId(currentUser);

      // Only include fields that have changed
      const updateData: Partial<IUserPublic> = {};
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;

      return await api.auth.updateUser(userId, updateData) as UserProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      this.handleError(error);
    }
  }

  async changePassword(_data: IPasswordChangeRequest): Promise<void> {
    try {
      // Strapi doesn't have a built-in change password endpoint for authenticated users
      // This would need to be implemented as a custom endpoint
      throw new Error(
        'Password change functionality is not yet implemented with Strapi backend. Please use the forgot password flow instead.'
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadProfileImage(file: File): Promise<{ url: string }> {
    try {
      console.log('Uploading file...');

      // Upload file using the api service
      const { url: imageUrl } = await api.upload.uploadFile(file);
      console.log('File uploaded, URL:', imageUrl);

      // Get current user and update profile image
      const currentUser = await api.auth.getCurrentUser();
      const userId = getUserId(currentUser);
      
      await api.auth.updateUser(userId, {
        profileImage: imageUrl,
      });

      return { url: imageUrl };
    } catch (error) {
      console.error('Upload profile image error:', error);
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
      // Get current user profile which includes referralCode
      const userProfile = await this.getProfile();
      return userProfile.referralCode || '';
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateReferralCode(): Promise<string> {
    try {
      // For Strapi, we would need to implement a custom endpoint
      // For now, return a placeholder or throw an error
      throw new Error(
        'Generate referral code functionality is not yet implemented with Strapi backend.'
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const profileService = new ProfileService('');
