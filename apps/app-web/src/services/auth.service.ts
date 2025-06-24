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

// Strapi auth response types
interface StrapiAuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface StrapiRegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
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
        user: {
          id: response.user.id.toString(),
          email: response.user.email,
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          role: 'USER', // Default role, can be enhanced later
          status: response.user.confirmed ? 'ACTIVE' : 'PENDING_VERIFICATION',
          createdAt: new Date(response.user.createdAt),
        },
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
      const strapiRequest: StrapiRegisterRequest = {
        username: data.email, // Use email as username
        email: data.email,
        password: data.password,
        // Note: firstName and lastName will be handled separately after registration
      };

      const response = await apiClient.post<StrapiAuthResponse>(
        '/auth/local/register',
        strapiRequest
      );

      // Transform Strapi response to our AuthResponse format
      const authResponse: AuthResponse = {
        user: {
          id: response.user.id.toString(),
          email: response.user.email,
          firstName: data.firstName || '', // Use provided firstName or empty
          lastName: data.lastName || '', // Use provided lastName or empty
          role: 'USER', // Default role
          status: response.user.confirmed ? 'ACTIVE' : 'PENDING_VERIFICATION',
          createdAt: new Date(response.user.createdAt),
        },
        accessToken: response.jwt,
        refreshToken: response.jwt, // Strapi uses same token for both
        expiresIn: 86400, // 24 hours default
      };

      return authResponse;
    } catch (error) {
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
      const response = await apiClient.get<
        StrapiAuthResponse['user'] & {
          profileImage?: string;
          referralCode?: string;
          status?: string;
        }
      >('/users/me?populate=*');

      // Transform Strapi user to our IUserPublic format
      const user: IUserPublic = {
        id: response.id.toString(),
        email: response.email,
        firstName: response.firstName || response.username || '', // Fallback to username if no firstName
        lastName: response.lastName || '', // May be empty for basic Strapi users
        role: 'USER', // Default role, can be enhanced later
        status:
          response.status ||
          (response.confirmed ? 'ACTIVE' : 'PENDING_VERIFICATION'),
        createdAt: new Date(response.createdAt),
        // Additional profile fields that are supported by IUserPublic
        profileImage: response.profileImage || null,
        referralCode: response.referralCode || null,
        emailVerified: response.confirmed,
        emailVerifiedAt: response.confirmed
          ? new Date(response.createdAt)
          : null,
      };

      return user;
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
