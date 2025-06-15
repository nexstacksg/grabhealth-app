import {
  IUserPublic,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  ProfileImageUploadResponse,
} from '@app/shared-types';
import { BaseApiDataSource } from './BaseApiDataSource';
import { IProfileDataSource } from '../../interfaces/IProfileDataSource';

export class ApiProfileDataSource extends BaseApiDataSource implements IProfileDataSource {
  private readonly endpoint = '/users';

  async getProfile(): Promise<IUserPublic> {
    return this.get<IUserPublic>(`${this.endpoint}/profile`);
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<IUserPublic> {
    return this.put<IUserPublic>(`${this.endpoint}/profile`, data);
  }

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    return this.put<void>(`${this.endpoint}/change-password`, data);
  }

  async uploadProfileImage(file: File): Promise<ProfileImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.apiUrl}${this.endpoint}/profile/image`, {
      method: 'POST',
      headers: await this.buildHeaders(true), // Skip content-type for FormData
      credentials: 'include',
      body: formData,
    });

    return this.handleResponse<ProfileImageUploadResponse>(response);
  }

  async deleteAccount(password: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}${this.endpoint}/account`, {
      method: 'DELETE',
      headers: await this.buildHeaders(),
      body: JSON.stringify({ password }),
      credentials: 'include'
    });

    return this.handleResponse<void>(response);
  }

  async getReferralCode(): Promise<{ code: string; usageCount: number }> {
    return this.get<{ code: string; usageCount: number }>(`${this.endpoint}/referral-code`);
  }

  async generateReferralCode(): Promise<{ code: string }> {
    return this.post<{ code: string }>(`${this.endpoint}/referral-code`, {});
  }
}