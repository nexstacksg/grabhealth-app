import { IUser, IUserPublic } from '@app/shared-types';

export interface ServiceOptions {
  dataSource: any;
}

export interface AuthServiceOptions extends ServiceOptions {
  dataSource: IAuthDataSource;
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

export interface IAuthDataSource {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  logout(userId: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  getProfile(userId: string): Promise<IUser>;
  requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }>;
  resetPassword(data: PasswordReset): Promise<{ message: string }>;
  verifyEmail(email: string): Promise<{ message: string }>;
  verifyEmailCode(data: EmailVerification): Promise<{ message: string }>;
  resendVerificationCode(email: string): Promise<{ message: string }>;
}