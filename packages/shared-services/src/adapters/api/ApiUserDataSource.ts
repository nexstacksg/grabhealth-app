import {
  IUserPublic,
  PaginatedResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSearchParams,
} from '@app/shared-types';
import { IUserDataSource } from '../../interfaces/IUserDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiUserDataSource extends BaseApiDataSource implements IUserDataSource {

  async getMyProfile(): Promise<IUserPublic> {
    return this.get<IUserPublic>('/users/my-profile');
  }

  async updateMyProfile(data: UpdateProfileRequest): Promise<IUserPublic> {
    return this.put<IUserPublic>('/users/my-profile', data);
  }

  async uploadProfilePhoto(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    // For file uploads, we need to use fetch directly
    const response = await fetch(`${this.apiUrl}/users/my-profile/photo`, {
      method: 'POST',
      body: formData,
      headers: await this.buildHeaders(true), // Skip Content-Type for FormData
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload photo');
    }

    const data = await response.json();
    return data.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.post<void>('/users/change-password', data);
  }

  async getUserById(userId: string): Promise<IUserPublic> {
    return this.get<IUserPublic>(`/users/${userId}`);
  }

  async listUsers(params?: UserSearchParams): Promise<PaginatedResponse<IUserPublic>> {
    return this.get<PaginatedResponse<IUserPublic>>('/users', params);
  }

  async updateUser(userId: string, data: Partial<IUserPublic>): Promise<IUserPublic> {
    return this.put<IUserPublic>(`/users/${userId}`, data);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete<void>(`/users/${userId}`);
  }
}