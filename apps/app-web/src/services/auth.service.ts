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
      return await apiClient.post<AuthResponse>(
        `${this.baseUrl}/login`,
        data
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user - sets httpOnly cookies
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(
      `${this.baseUrl}/register`,
      data
    );
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
    return await apiClient.get<IUserPublic>(
      `${this.baseUrl}/profile`
    );
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(
      `${this.baseUrl}/refresh`
    );
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post<void>(
      `${this.baseUrl}/request-password-reset`,
      { email }
    );
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post<void>(
      `${this.baseUrl}/reset-password`,
      { token, password }
    );
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post<void>(
      `${this.baseUrl}/verify-email`,
      { token }
    );
  }

  /**
   * Verify email with 4-digit code
   */
  async verifyEmailCode(email: string, code: string): Promise<void> {
    await apiClient.post<void>(
      `${this.baseUrl}/verify-email-code`,
      { email, code }
    );
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(email: string): Promise<void> {
    await apiClient.post<void>(
      `${this.baseUrl}/resend-verification-code`,
      { email }
    );
  }
}

export const authService = new AuthService();
export default authService;
