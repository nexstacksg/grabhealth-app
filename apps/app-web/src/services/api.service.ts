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
      console.log('Starting file upload:', { name: file.name, size: file.size, type: file.type });
      
      const formData = new FormData();
      formData.append('files', file);

      try {
        // Don't set Content-Type header - let axios set it automatically with boundary
        const uploadResponse = await apiClient.post<StrapiUploadFile[]>('/upload', formData);
        
        console.log('Upload response:', uploadResponse);

        if (!uploadResponse || uploadResponse.length === 0) {
          throw new Error('Upload failed - no files returned');
        }

        return transformStrapiUploadResponse(uploadResponse[0]);
      } catch (error) {
        console.error('Upload error details:', error);
        throw error;
      }
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