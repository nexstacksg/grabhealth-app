import { IUser, IUserPublic, UserRole, UserStatus } from '@app/shared-types';
import bcrypt from 'bcryptjs';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  PasswordResetRequest,
  PasswordReset,
  EmailVerification,
} from '../../types';
import { IAuthDataSource } from '../../interfaces/IAuthDataSource';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../utils/errors';

interface MockUser extends IUser {
  resetToken?: string | null;
  verificationCode?: string | null;
}

export class MockAuthDataSource implements IAuthDataSource {
  private users: Map<string, MockUser> = new Map();
  private emailToUserId: Map<string, string> = new Map();
  private tokenToUserId: Map<string, string> = new Map();

  constructor() {
    // Add some test users
    const testUser: MockUser = {
      id: '1',
      email: 'test@example.com',
      password: bcrypt.hashSync('Test@123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      referralCode: 'TEST123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(testUser.id, testUser);
    this.emailToUserId.set(testUser.email, testUser.id);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const userId = this.emailToUserId.get(credentials.email.toLowerCase());
    if (!userId) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = this.users.get(userId);
    if (!user || !user.password) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokens = this.generateMockTokens(user.id);
    const { password, resetToken, verificationCode, ...sanitizedUser } = user;

    return {
      user: {
        ...sanitizedUser,
        emailVerified: !!user.emailVerifiedAt
      },
      tokens,
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    if (this.emailToUserId.has(data.email.toLowerCase())) {
      throw new ConflictError('Email already registered');
    }

    const userId = String(this.users.size + 1);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser: MockUser = {
      id: userId,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      firstName: data.name.split(' ')[0] || data.name,
      lastName: data.name.split(' ').slice(1).join(' ') || '',
      role: UserRole.USER,
      status: UserStatus.PENDING_VERIFICATION,
      emailVerifiedAt: null,
      referralCode: this.generateReferralCode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (data.referralCode) {
      const referrer = Array.from(this.users.values()).find(
        (u) => u.referralCode === data.referralCode
      );
      if (referrer) {
        newUser.uplineId = referrer.id;
      }
    }

    this.users.set(userId, newUser);
    this.emailToUserId.set(newUser.email, userId);

    const tokens = this.generateMockTokens(userId);
    const { password, resetToken, verificationCode, ...sanitizedUser } =
      newUser;

    return {
      user: {
        ...sanitizedUser,
        emailVerified: !!newUser.emailVerifiedAt
      },
      tokens,
    };
  }

  async logout(userId: string): Promise<void> {
    // Remove tokens
    for (const [token, id] of this.tokenToUserId.entries()) {
      if (id === userId) {
        this.tokenToUserId.delete(token);
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const userId = this.tokenToUserId.get(refreshToken);
    if (!userId) {
      throw new AuthenticationError('Invalid refresh token');
    }

    return this.generateMockTokens(userId);
  }

  async getProfile(userId: string): Promise<IUserPublic> {
    const user = this.users.get(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password, resetToken, verificationCode, ...sanitizedUser } = user;

    return {
      ...sanitizedUser,
      emailVerified: !!user.emailVerifiedAt
    };
  }

  async requestPasswordReset(
    data: PasswordResetRequest
  ): Promise<{ message: string }> {
    const userId = this.emailToUserId.get(data.email.toLowerCase());
    if (!userId) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const user = this.users.get(userId);
    if (user) {
      user.resetToken = this.generateResetToken();
      this.users.set(userId, user);
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(data: PasswordReset): Promise<{ message: string }> {
    const user = Array.from(this.users.values()).find(
      (u) => u.resetToken === data.token
    );

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(data.newPassword, 10);
    user.resetToken = null;
    this.users.set(user.id, user);

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(email: string): Promise<{ message: string }> {
    const userId = this.emailToUserId.get(email.toLowerCase());
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerifiedAt) {
      return { message: 'Email already verified' };
    }

    user.verificationCode = this.generateVerificationCode();
    this.users.set(userId, user);

    return { message: 'Verification code sent' };
  }

  async verifyEmailCode(data: EmailVerification): Promise<{ message: string }> {
    const userId = this.emailToUserId.get(data.email.toLowerCase());
    if (!userId) {
      throw new ValidationError('Invalid or expired verification code');
    }

    const user = this.users.get(userId);
    if (!user || user.verificationCode !== data.code) {
      throw new ValidationError('Invalid or expired verification code');
    }

    user.emailVerifiedAt = new Date();
    user.status = UserStatus.ACTIVE;
    user.verificationCode = null;
    this.users.set(userId, user);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    return this.verifyEmail(email);
  }

  // Helper methods
  private generateMockTokens(userId: string): AuthTokens {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const accessToken = `access_${userId}_${timestamp}_${random}`;
    const refreshToken = `refresh_${userId}_${timestamp}_${random}`;

    this.tokenToUserId.set(refreshToken, userId);

    return { accessToken, refreshToken };
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Test helper methods
  addUser(user: MockUser): void {
    this.users.set(user.id, user);
    this.emailToUserId.set(user.email, user.id);
  }

  getUser(userId: string): MockUser | undefined {
    return this.users.get(userId);
  }

  clear(): void {
    this.users.clear();
    this.emailToUserId.clear();
    this.tokenToUserId.clear();
  }
}
