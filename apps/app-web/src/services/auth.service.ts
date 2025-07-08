/**
 * Auth Service - Handles all authentication related API calls for Strapi
 */

import { BaseService } from './base.service';
import {
  IUserPublic,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@app/shared-types';
import { StrapiUser, transformStrapiUser } from './strapi-base';
import { clientAuth } from '@/lib/auth-utils-client';

// Strapi auth response types
interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

interface StrapiRegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface StrapiLoginRequest {
  identifier: string; // email or username
  password: string;
}

class AuthService extends BaseService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const strapiRequest: StrapiLoginRequest = {
        identifier: data.email,
        password: data.password,
      };

      const response = await this.api.post<StrapiAuthResponse>(
        '/auth/local',
        strapiRequest
      );

      // Transform Strapi response to our AuthResponse format
      const authResponse: AuthResponse = {
        user: transformStrapiUser(response.user),
        accessToken: response.jwt,
        refreshToken: response.jwt, // Strapi uses same token for both
        expiresIn: 86400, // 24 hours default
      };

      return authResponse;
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Strapi's default registration only accepts username, email, and password
      const strapiRequest: StrapiRegisterRequest = {
        username: data.email, // Use email as username
        email: data.email,
        password: data.password,
      };

      console.log('Registering with Strapi:', { email: data.email });

      const response = await this.api.post<StrapiAuthResponse>(
        '/auth/local/register',
        strapiRequest
      );

      console.log('Registration successful:', response);

      // Transform Strapi response to our AuthResponse format
      const authResponse: AuthResponse = {
        user: transformStrapiUser(response.user),
        accessToken: response.jwt,
        refreshToken: response.jwt, // Strapi uses same token for both
        expiresIn: 86400, // 24 hours default
      };

      return authResponse;
    } catch (error) {
      console.error('Registration error in service:', error);
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      // Strapi doesn't have a logout endpoint, just clear cookies
      if (typeof window !== 'undefined') {
        clientAuth.clearCookies();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(): Promise<IUserPublic> {
    try {
      const strapiUser = await this.api.get<StrapiUser>('/users/me?populate=*');
      return transformStrapiUser(strapiUser);
    } catch (error) {
      console.error('Failed to get user profile:', error);
      this.handleError(error);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      // Strapi doesn't have a refresh token endpoint
      // The JWT token is long-lived, so we just return the current token
      const currentToken =
        typeof window !== 'undefined'
          ? clientAuth.getToken()
          : null;

      if (!currentToken) {
        throw new Error('No token available for refresh');
      }

      // Get current user to validate token is still valid
      const user = await this.getProfile();

      const authResponse: AuthResponse = {
        user,
        accessToken: currentToken,
        refreshToken: currentToken,
        expiresIn: 86400, // 24 hours
      };

      return authResponse;
    } catch (error) {
      this.handleError(error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Use custom forgot password endpoint
      await this.api.post('/custom-auth/forgot-password', { email });
    } catch (error) {
      this.handleError(error);
    }
  }

  async resetPassword(
    code: string,
    password: string,
    passwordConfirmation: string
  ): Promise<void> {
    try {
      // Use custom reset password endpoint
      await this.api.post('/custom-auth/reset-password', {
        code,
        password,
        passwordConfirmation,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async resetPasswordWithEmail(
    email: string,
    code: string,
    password: string
  ): Promise<void> {
    try {
      // Use custom reset password endpoint with email
      await this.api.post('/custom-auth/reset-password', {
        email,
        code,
        password,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async validateResetCode(email: string, code: string): Promise<{ valid: boolean }> {
    try {
      const response = await this.api.post<{ valid: boolean }>('/custom-auth/validate-reset-code', {
        email,
        code,
      });
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyEmail(_email: string): Promise<void> {
    // Not used with custom auth
    throw new Error('Use resendVerificationCode instead');
  }

  async verifyEmailCode(email: string, code: string): Promise<void> {
    try {
      // Use custom email verification endpoint
      await this.api.post('/custom-auth/verify-email', {
        email,
        code,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async resendVerificationCode(email: string): Promise<void> {
    try {
      // Use custom resend code endpoint
      await this.api.post('/custom-auth/resend-code', { email });
    } catch (error) {
      this.handleError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Use custom change password endpoint
      await this.api.post('/custom-auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const authService = new AuthService('');
