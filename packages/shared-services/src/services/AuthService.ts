import { IUser, IUserPublic, UserRole } from '@app/shared-types';
import bcrypt from 'bcryptjs';
import {
  AuthServiceOptions,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthTokens
} from '../types';
import { IAuthDataSource } from '../interfaces/IAuthDataSource';
import {
  assertValidEmail,
  assertValidPassword,
  assertNotEmpty
} from '../utils/validation';
import {
  AuthenticationError,
  ValidationError,
  ConflictError
} from '../utils/errors';

export class AuthService {
  private dataSource: IAuthDataSource;

  constructor(options: AuthServiceOptions & { dataSource: IAuthDataSource }) {
    this.dataSource = options.dataSource;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validate input
    assertValidEmail(credentials.email);
    assertNotEmpty(credentials.password, 'Password');

    try {
      const response = await this.dataSource.login(credentials);
      return response;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid email or password');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate input
    assertValidEmail(data.email);
    assertValidPassword(data.password);
    assertNotEmpty(data.name, 'Name');

    try {
      const response = await this.dataSource.register(data);
      return response;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new ValidationError('Registration failed');
    }
  }

  async logout(userId: string): Promise<void> {
    assertNotEmpty(userId, 'User ID');
    await this.dataSource.logout(userId);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    assertNotEmpty(refreshToken, 'Refresh token');
    
    try {
      return await this.dataSource.refreshToken(refreshToken);
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async getProfile(userId: string): Promise<IUserPublic> {
    assertNotEmpty(userId, 'User ID');
    return await this.dataSource.getProfile(userId);
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    assertValidEmail(email);
    return await this.dataSource.requestPasswordReset({ email });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    assertNotEmpty(token, 'Reset token');
    assertValidPassword(newPassword);
    
    return await this.dataSource.resetPassword({ token, newPassword });
  }

  async verifyEmail(email: string): Promise<{ message: string }> {
    assertValidEmail(email);
    return await this.dataSource.verifyEmail(email);
  }

  async verifyEmailCode(email: string, code: string): Promise<{ message: string }> {
    assertValidEmail(email);
    assertNotEmpty(code, 'Verification code');
    
    return await this.dataSource.verifyEmailCode({ email, code });
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    assertValidEmail(email);
    return await this.dataSource.resendVerificationCode(email);
  }

  // Helper methods
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Authorization helpers
  canViewUser(targetUserId: string, requestingUserId?: string, requestingUserRole?: UserRole): boolean {
    // Users can view their own profile
    if (targetUserId === requestingUserId) {
      return true;
    }

    // Managers and Super Admins can view all users
    if (requestingUserRole === UserRole.MANAGER || requestingUserRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    return false;
  }

  canModifyUser(targetUserId: string, requestingUserId?: string, requestingUserRole?: UserRole): boolean {
    // Users can modify their own profile
    if (targetUserId === requestingUserId) {
      return true;
    }

    // Super Admins can modify all users
    if (requestingUserRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Managers can modify regular users (but not other managers or super admins)
    if (requestingUserRole === UserRole.MANAGER) {
      // This would require checking the target user's role
      // For now, we'll allow it and let the data source handle the logic
      return true;
    }

    return false;
  }
}