/**
 * API Service
 *
 * Provides a clean, backend-agnostic interface for all API calls
 * Currently implements Strapi, but can be swapped for any backend
 */

import { apiClient } from '@/lib/api-client';
import {
  IUserPublic,
  IUser,
} from '@app/shared-types';
import {
  StrapiUser,
  transformStrapiUser,
  StrapiUploadFile,
  transformStrapiUploadResponse,
} from './strapi-base';

// API interface - clean and backend-agnostic
export interface IApi {
  auth: {
    getCurrentUser(): Promise<IUserPublic>;
    updateUser(userId: string, data: Partial<IUser>): Promise<IUserPublic>;
  };
  upload: {
    uploadFile(file: File): Promise<{ url: string; id: string | number }>;
  };
}

// Strapi implementation
class Api implements IApi {
  auth = {
    async getCurrentUser(): Promise<IUserPublic> {
      const strapiUser = await apiClient.get<StrapiUser>(
        '/users/me?populate=*'
      );
      return transformStrapiUser(strapiUser);
    },

    async updateUser(
      userId: string,
      data: Partial<IUser>
    ): Promise<IUserPublic> {
      // Filter out fields that Strapi doesn't accept for user updates
      const allowedFields = ['username', 'email', 'firstName', 'lastName', 'profileImage'];
      const updateData: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateData[key] = value;
        }
      }
      
      const strapiUser = await apiClient.put<StrapiUser>(
        `/users/${userId}`,
        updateData
      );
      return transformStrapiUser(strapiUser);
    },
  };

  upload = {
    async uploadFile(
      file: File
    ): Promise<{ url: string; id: string | number }> {
      console.log('Starting file upload:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const formData = new FormData();
      formData.append('files', file);

      try {
        // Don't set Content-Type header - let axios set it automatically with boundary
        const uploadResponse = await apiClient.post<StrapiUploadFile[]>(
          '/upload',
          formData
        );

        console.log('Upload response:', uploadResponse);

        if (!uploadResponse || uploadResponse.length === 0) {
          throw new Error('Upload failed - no files returned');
        }

        return transformStrapiUploadResponse(uploadResponse[0]);
      } catch (error) {
        console.error('Upload error details:', error);
        throw error;
      }
    },
  };
}

// Export singleton instance as 'api'
export const api: IApi = new Api();

// Helper function to get user ID (for users, always use numeric id, not documentId)
export function getUserId(user: IUserPublic | StrapiUser): string {
  // For users, we need to use the numeric id, not documentId
  // documentId is for content types, but users still use numeric ids for API operations
  if ('id' in user && user.id) {
    return typeof user.id === 'number' ? user.id.toString() : user.id;
  }
  throw new Error('User ID not found');
}
