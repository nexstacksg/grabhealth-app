import { IUser, IUserPublic } from '@app/shared-types';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  PasswordResetRequest,
  PasswordReset,
  EmailVerification
} from '../types';

export interface IAuthDataSource {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  logout(userId: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  getProfile(userId: string): Promise<IUserPublic>;
  requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }>;
  resetPassword(data: PasswordReset): Promise<{ message: string }>;
  verifyEmail(email: string): Promise<{ message: string }>;
  verifyEmailCode(data: EmailVerification): Promise<{ message: string }>;
  resendVerificationCode(email: string): Promise<{ message: string }>;
}