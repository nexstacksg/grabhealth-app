import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginRequest,
  RegisterRequest,
  IUserPublic,
  AuthResponse as SharedAuthResponse,
} from '@app/shared-types';

// Extend LoginRequest to include mobile-specific fields
export interface LoginData extends LoginRequest {
  deviceToken?: string;
  platform?: 'ios' | 'android';
}

// Re-export RegisterRequest as RegisterData for backward compatibility
export type RegisterData = RegisterRequest;

// Re-export IUserPublic as User for backward compatibility
export type User = IUserPublic;

// Extend the shared AuthResponse to include company info
export interface AuthResponse extends SharedAuthResponse {
  company?: {
    id: string;
    name: string;
    code: string;
  };
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const authData = response.data.data;

    await this.saveAuthData(authData);
    return authData;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Register data being sent:', JSON.stringify(data, null, 2));
    const response = await api.post('/auth/register', data);
    const authData = response.data.data;

    await this.saveAuthData(authData);
    return authData;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.data.user;
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    emergencyContact?: string;
    department?: string;
  }): Promise<User> {
    const response = await api.put('/users/my-profile', data);
    const updatedUser = response.data.data;

    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private async saveAuthData(authData: AuthResponse): Promise<void> {
    await AsyncStorage.setItem('accessToken', authData.accessToken);
    await AsyncStorage.setItem('refreshToken', authData.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(authData.user));
    if (authData.company) {
      await AsyncStorage.setItem('company', JSON.stringify(authData.company));
    }
  }
}

export default new AuthService();
