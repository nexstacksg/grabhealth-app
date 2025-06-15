import { PrismaClient } from '@prisma/client';
import { IUser, IUserPublic, UserRole, UserStatus } from '@app/shared-types';
import bcrypt from 'bcryptjs';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  PasswordResetRequest,
  PasswordReset,
  EmailVerification
} from '../../types';
import { IAuthDataSource } from '../../interfaces/IAuthDataSource';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError
} from '../../utils/errors';

export class PrismaAuthDataSource implements IAuthDataSource {
  constructor(
    private prisma: PrismaClient,
    private tokenGenerator: {
      generateTokens: (userId: string) => Promise<AuthTokens>;
      verifyRefreshToken: (token: string) => Promise<{ userId: string }>;
    }
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email.toLowerCase() }
    });

    if (!user || !user.password) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AuthenticationError('Account is suspended');
    }

    const tokens = await this.tokenGenerator.generateTokens(user.id);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Handle referral code
    let referrerId: string | undefined;
    if (data.referralCode) {
      const referrer = await this.prisma.user.findFirst({
        where: { referralCode: data.referralCode }
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        role: UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
        referralCode: this.generateReferralCode(),
        uplineId: referrerId
      }
    });

    const tokens = await this.tokenGenerator.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async logout(userId: string): Promise<void> {
    // In a real implementation, you might want to invalidate the refresh token
    // For now, this is handled by the token service
    return;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { userId } = await this.tokenGenerator.verifyRefreshToken(refreshToken);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.status === UserStatus.SUSPENDED) {
      throw new AuthenticationError('Invalid refresh token');
    }

    return this.tokenGenerator.generateTokens(userId);
  }

  async getProfile(userId: string): Promise<IUserPublic> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token (you'd implement this with your token service)
    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry
      }
    });

    // In real implementation, send email here
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(data: PasswordReset): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: data.token,
        passwordResetExpires: { gt: new Date() }
      }
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerifiedAt) {
      return { message: 'Email already verified' };
    }

    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 600000); // 10 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationCodeExpires: verificationExpiry
      }
    });

    // In real implementation, send email here
    // await emailService.sendVerificationEmail(user.email, verificationCode);

    return { message: 'Verification code sent' };
  }

  async verifyEmailCode(data: EmailVerification): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
        emailVerificationCode: data.code,
        emailVerificationCodeExpires: { gt: new Date() }
      }
    });

    if (!user) {
      throw new ValidationError('Invalid or expired verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
        emailVerificationCode: null,
        emailVerificationCodeExpires: null
      }
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    return this.verifyEmail(email);
  }

  // Helper methods
  private sanitizeUser(user: any): IUserPublic {
    const { 
      password, 
      refreshToken,
      emailVerificationToken,
      emailVerificationCode,
      emailVerificationCodeExpires,
      passwordResetToken,
      passwordResetExpires,
      ...sanitized 
    } = user;
    
    return {
      ...sanitized,
      emailVerified: !!user.emailVerifiedAt
    } as IUserPublic;
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}