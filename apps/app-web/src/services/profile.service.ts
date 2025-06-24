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

interface UserProfile extends IUserPublic {
  referralCode?: string;
  membership?: {
    tier: string;
    points: number;
    joinedAt: string;
  };
}

// Strapi user response type
interface StrapiUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  referralCode?: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

class ProfileService extends BaseService {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<StrapiUser>('/users/me?populate=*');

      // Transform Strapi user to our UserProfile format
      const userProfile: UserProfile = {
        id: response.id.toString(),
        email: response.email,
        firstName: response.firstName || response.username || '',
        lastName: response.lastName || '',
        role: 'USER',
        status:
          response.status ||
          (response.confirmed ? 'ACTIVE' : 'PENDING_VERIFICATION'),
        createdAt: new Date(response.createdAt),
        profileImage: response.profileImage || undefined,
        referralCode: response.referralCode || undefined,
        emailVerified: response.confirmed,
        emailVerifiedAt: response.confirmed
          ? new Date(response.createdAt)
          : null,
      };

      return userProfile;
    } catch (error) {
      console.error('Get profile error:', error);
      this.handleError(error);
    }
  }

  async updateProfile(data: IProfileUpdateRequest): Promise<UserProfile> {
    try {
      // First get the current user to get their ID
      const currentUser = await this.getProfile();

      // Map IProfileUpdateRequest to Strapi's expected format
      const strapiUpdateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        // Note: Strapi doesn't support phoneNumber, dateOfBirth, address by default
      };

      const response = await apiClient.put<StrapiUser>(
        `/users/${currentUser.id}`,
        strapiUpdateData
      );

      // Transform response back to UserProfile format
      const userProfile: UserProfile = {
        id: response.id.toString(),
        email: response.email,
        firstName: response.firstName || response.username || '',
        lastName: response.lastName || '',
        role: 'USER',
        status:
          response.status ||
          (response.confirmed ? 'ACTIVE' : 'PENDING_VERIFICATION'),
        createdAt: new Date(response.createdAt),
        profileImage: response.profileImage || undefined,
        referralCode: response.referralCode || undefined,
        emailVerified: response.confirmed,
        emailVerifiedAt: response.confirmed
          ? new Date(response.createdAt)
          : null,
      };

      return userProfile;
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
      // Strapi has a built-in upload endpoint
      const formData = new FormData();
      formData.append('files', file);

      const uploadResponse = await apiClient.post<any[]>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse || uploadResponse.length === 0) {
        throw new Error('Upload failed');
      }

      const uploadedFile = uploadResponse[0];
      const imageUrl = uploadedFile.url;

      // Get current user ID and update profile with the new image URL
      const currentUser = await this.getProfile();
      await apiClient.put(`/users/${currentUser.id}`, {
        profileImage: imageUrl,
      });

      return { url: imageUrl };
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
