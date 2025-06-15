import { IUser, IUserPublic } from '@app/shared-types';

export interface ServiceOptions {
  dataSource: any;
}

export interface AuthServiceOptions extends ServiceOptions {
  tokenExpiry?: {
    access?: string;
    refresh?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: IUserPublic;
  tokens: AuthTokens;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface EmailVerification {
  email: string;
  code: string;
}

// IAuthDataSource interface is exported from './interfaces/IAuthDataSource'