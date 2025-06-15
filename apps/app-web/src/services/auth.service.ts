import { apiClient } from './api-client';
import {
  LoginRequest,
  RegisterRequest,
  IUserPublic,
  AuthResponse,
} from '@app/shared-types';
import { BaseService } from './base.service';

class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  /**
   * Login user - sets httpOnly cookies
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseUrl}/login`,
        data
      );
      return this.extractData(response);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user - sets httpOnly cookies
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseUrl}/register`,
      data
    );

    return this.extractData(response);
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

    return this.extractData(response);
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseUrl}/refresh`
    );

    return this.extractData(response);
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
   * Verify email address with token
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

  /**
   * Verify email with 4-digit code
   */
  async verifyEmailCode(email: string, code: string): Promise<void> {
    const response = await apiClient.post<void>(
      `${this.baseUrl}/verify-email-code`,
      { email, code }
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Invalid verification code');
    }
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(email: string): Promise<void> {
    const response = await apiClient.post<void>(
      `${this.baseUrl}/resend-verification-code`,
      { email }
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to resend code');
    }
  }
}

export const authService = new AuthService();
export default authService;
