import { IUserPublic } from '../models/user';
import { UserRole } from '../enums';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: IUserPublic;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  user: IUserPublic;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends TokenPayload {
  sessionId: string;
}

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string | number;
  refreshExpiresIn: string | number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

// Authentication Guard Types
export interface AuthGuardOptions {
  redirectTo?: string;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export interface AuthGuardResult {
  isAuthorized: boolean;
  redirectPath?: string;
  reason?: 'not_authenticated' | 'insufficient_role' | 'role_not_allowed';
}

// Partner Authentication Types
export interface PartnerInfo {
  id: string;
  name: string;
  email: string;
  isPartner: boolean;
}

export interface PartnerAuthResult {
  success: boolean;
  partnerInfo?: PartnerInfo;
  error?: string;
  shouldRedirect?: boolean;
  redirectPath?: string;
}
