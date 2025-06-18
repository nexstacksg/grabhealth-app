/**
 * Auth Service - Handles all authentication related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { 
  IUserPublic, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  ApiResponse 
} from '@app/shared-types';

class AuthService extends BaseService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(): Promise<IUserPublic> {
    try {
      const response = await apiClient.get<ApiResponse<IUserPublic>>('/auth/profile');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/password-reset', { email });
      this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/password-reset/confirm', { token, password });
      this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyEmail(email: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/verify-email', { email });
      this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyEmailCode(email: string, code: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/verify-email-code', { email, code });
      this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async resendVerificationCode(email: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/resend-verification-code', { email });
      this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const authService = new AuthService('/auth');