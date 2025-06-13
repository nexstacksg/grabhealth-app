import { apiClient } from './api-client';
import {
  LoginRequest,
  RegisterRequest,
  IUserPublic,
  ApiResponse,
} from '@app/shared-types';

export interface AuthResponse {
  user: IUserPublic;
  expiresIn: number;
}

class AuthService {
  private baseUrl = '/auth';

  /**
   * Login user - sets httpOnly cookies
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseUrl}/login`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed');
    }

    return response.data;
  }

  /**
   * Register new user - sets httpOnly cookies
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseUrl}/register`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Registration failed');
    }

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/logout`);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<IUserPublic> {
    const response = await apiClient.get<IUserPublic>(
      `${this.baseUrl}/profile`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get profile');
    }

    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseUrl}/refresh`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to refresh token');
    }

    return response.data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const response = await apiClient.post<void>(
      `${this.baseUrl}/request-password-reset`,
      { email }
    );

    if (!response.success) {
      throw new Error(
        response.error?.message || 'Failed to request password reset'
      );
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    const response = await apiClient.post<void>(
      `${this.baseUrl}/reset-password`,
      { token, password }
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reset password');
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post<void>(
      `${this.baseUrl}/verify-email`,
      { token }
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify email');
    }
  }
}

export const authService = new AuthService();
export default authService;
