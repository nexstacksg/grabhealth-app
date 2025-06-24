/**
 * Auth Service - Handles all authentication related API calls for Strapi
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import {
  IUserPublic,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@app/shared-types';
import { api } from './api.service';
import { StrapiUser, transformStrapiUser } from './strapi-base';

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

      const response = await apiClient.post<StrapiAuthResponse>(
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

      const response = await apiClient.post<StrapiAuthResponse>(
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
      // Strapi doesn't have a logout endpoint, just clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(): Promise<IUserPublic> {
    try {
      return await api.auth.getCurrentUser();
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
          ? localStorage.getItem('accessToken')
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
      // Strapi has a forgot password endpoint
      await apiClient.post('/auth/forgot-password', { email });
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
      // Strapi reset password endpoint
      await apiClient.post('/auth/reset-password', {
        code,
        password,
        passwordConfirmation,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyEmail(email: string): Promise<void> {
    try {
      // Strapi email confirmation resend
      await apiClient.post('/auth/send-email-confirmation', { email });
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyEmailCode(_email: string, confirmation: string): Promise<void> {
    try {
      // Strapi email confirmation
      await apiClient.get(
        `/auth/email-confirmation?confirmation=${confirmation}`
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async resendVerificationCode(email: string): Promise<void> {
    try {
      // Same as verifyEmail for Strapi
      await this.verifyEmail(email);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const authService = new AuthService('');
