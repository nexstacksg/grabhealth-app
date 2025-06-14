import { IUserPublic } from '@app/shared-types';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  PasswordResetRequest,
  PasswordReset,
  EmailVerification
} from '../../types';
import { IAuthDataSource } from '../../interfaces/IAuthDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiAuthDataSource extends BaseApiDataSource implements IAuthDataSource {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', data);
  }

  async logout(_userId: string): Promise<void> {
    await this.post<void>('/auth/logout');
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.post<AuthTokens>('/auth/refresh', { refreshToken });
  }

  async getProfile(_userId: string): Promise<IUserPublic> {
    return this.get<IUserPublic>('/auth/profile');
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/password/reset-request', data);
  }

  async resetPassword(data: PasswordReset): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/password/reset', data);
  }

  async verifyEmail(email: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/verify-email', { email });
  }

  async verifyEmailCode(data: EmailVerification): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/verify-email-code', data);
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/resend-verification', { email });
  }
}