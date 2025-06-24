/**
 * API Service
 * 
 * Provides a clean, backend-agnostic interface for all API calls
 * Currently implements Strapi, but can be swapped for any backend
 */

import { apiClient } from './api-client';
import { 
  IUserPublic, 
  IUser,
  IProfileUpdateRequest,
  ApiResponse 
} from '@app/shared-types';
import { 
  StrapiUser, 
  transformStrapiUser,
  StrapiUploadFile,
  transformStrapiUploadResponse
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
      const strapiUser = await apiClient.get<StrapiUser>('/users/me?populate=*');
      return transformStrapiUser(strapiUser);
    },

    async updateUser(userId: string, data: Partial<IUser>): Promise<IUserPublic> {
      const strapiUser = await apiClient.put<StrapiUser>(`/users/${userId}`, data);
      return transformStrapiUser(strapiUser);
    }
  };

  upload = {
    async uploadFile(file: File): Promise<{ url: string; id: string | number }> {
      const formData = new FormData();
      formData.append('files', file);

      const uploadResponse = await apiClient.post<StrapiUploadFile[]>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse || uploadResponse.length === 0) {
        throw new Error('Upload failed');
      }

      return transformStrapiUploadResponse(uploadResponse[0]);
    }
  };
}

// Export singleton instance as 'api'
export const api: IApi = new Api();

// Helper function to get user ID (handles both id and documentId)
export function getUserId(user: IUserPublic | StrapiUser): string {
  if ('documentId' in user && user.documentId) {
    return user.documentId;
  }
  return typeof user.id === 'number' ? user.id.toString() : user.id;
}