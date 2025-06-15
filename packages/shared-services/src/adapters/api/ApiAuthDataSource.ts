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
import { AuthenticationError, ConflictError, ServiceError } from '../../utils/errors';

export class ApiAuthDataSource implements IAuthDataSource {
  constructor(
    private apiUrl: string,
    private getToken?: () => Promise<string | null>
  ) {}

  private async buildHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json() as any;

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthenticationError(data.message || 'Authentication failed');
      }
      if (response.status === 409) {
        throw new ConflictError(data.message || 'Resource conflict');
      }
      throw new ServiceError(
        data.message || 'Request failed',
        data.code || 'API_ERROR',
        response.status
      );
    }

    return data.data || data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify(credentials),
      credentials: 'include' // Important for cookies
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async logout(_userId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/logout`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      credentials: 'include'
    });

    await this.handleResponse<void>(response);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${this.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify({ refreshToken }),
      credentials: 'include'
    });

    return this.handleResponse<AuthTokens>(response);
  }

  async getProfile(_userId: string): Promise<IUserPublic> {
    const response = await fetch(`${this.apiUrl}/auth/profile`, {
      method: 'GET',
      headers: await this.buildHeaders(),
      credentials: 'include'
    });

    return this.handleResponse<IUserPublic>(response);
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.apiUrl}/auth/password/reset-request`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async resetPassword(data: PasswordReset): Promise<{ message: string }> {
    const response = await fetch(`${this.apiUrl}/auth/password/reset`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async verifyEmail(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.apiUrl}/auth/verify-email`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify({ email })
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async verifyEmailCode(data: EmailVerification): Promise<{ message: string }> {
    const response = await fetch(`${this.apiUrl}/auth/verify-email-code`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.apiUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify({ email })
    });

    return this.handleResponse<{ message: string }>(response);
  }
}