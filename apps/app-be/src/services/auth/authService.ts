import prisma from '../../database/client';
import {
  hashPassword,
  verifyPassword,
  generateTokenId,
} from '../../utils/auth';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../config/jwt';
import { ApiError } from '../../middleware/error/errorHandler';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
  IUserPublic,
  UserRole,
  UserStatus,
  ErrorCode,
  HttpStatus,
  TokenPayload,
} from '@app/shared-types';
import {
  sendEmail,
  sendPasswordResetEmail,
} from '../../utils/email';
import crypto from 'crypto';
import logger from '../../utils/logger';
import cacheService from '../cache/cacheService';

export class AuthService {
  private createUserPublic(user: any): IUserPublic {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage || null,
      role: user.role as UserRole,
      status: user.status,
      emailVerified: !!user.emailVerifiedAt,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
      partnerId: user.partnerId || undefined,
      partner: user.partner ? {
        id: user.partner.id,
        name: user.partner.name,
        email: user.partner.email,
      } : undefined,
    };
  }

  private generateVerificationCode(): string {
    // Generate a random 4-digit code between 1000-9999
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(
        'User with this email already exists',
        HttpStatus.CONFLICT,
        ErrorCode.USER_EXISTS
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate email verification token and code
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationCode = this.generateVerificationCode();
    const emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    console.log('Generated verification code:', emailVerificationCode);
    console.log('Verification code expires at:', emailVerificationCodeExpires);

    // Create user
    console.log('Creating user with status:', UserStatus.PENDING_VERIFICATION);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: passwordHash,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
        emailVerificationToken,
        emailVerificationCode,
        emailVerificationCodeExpires,
      } as any, // Type assertion to bypass Prisma type issue
    });
    console.log('Created user:', {
      id: user.id,
      email: user.email,
      status: user.status,
      emailVerificationCode: user.emailVerificationCode,
      emailVerificationCodeExpires: user.emailVerificationCodeExpires,
      emailVerifiedAt: user.emailVerifiedAt
    });
    
    // Double-check by fetching the user again
    const verifyUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    console.log('Verification - user fetched again:', {
      id: verifyUser?.id,
      status: verifyUser?.status,
      emailVerificationCode: verifyUser?.emailVerificationCode,
      emailVerificationCodeExpires: verifyUser?.emailVerificationCodeExpires
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      ...tokenPayload,
      sessionId: generateTokenId(),
    });

    // Store hashed refresh token
    const hashedRefreshToken = await hashPassword(refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // Send verification email with code
    try {
      await this.sendVerificationCode(user.email, emailVerificationCode);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      // Don't fail the registration if email fails
    }

    return {
      user: this.createUserPublic(user),
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new ApiError(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Check user status
    if (
      user.status !== UserStatus.ACTIVE &&
      user.status !== UserStatus.PENDING_VERIFICATION
    ) {
      throw new ApiError(
        'Account is not active',
        HttpStatus.FORBIDDEN,
        ErrorCode.ACCOUNT_INACTIVE
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new ApiError(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      ...tokenPayload,
      sessionId: generateTokenId(),
    });

    // Update last login and hashed refresh token
    const hashedRefreshToken = await hashPassword(refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshToken: hashedRefreshToken,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
      },
    });

    return {
      user: this.createUserPublic(user),
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Find user and validate token
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new ApiError(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
          ErrorCode.INVALID_TOKEN
        );
      }

      // Verify the refresh token hash
      const isValidToken = await verifyPassword(
        refreshToken,
        user.refreshToken || ''
      );
      if (!isValidToken) {
        throw new ApiError(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
          ErrorCode.INVALID_TOKEN
        );
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new ApiError(
          'Account is not active',
          HttpStatus.FORBIDDEN,
          ErrorCode.ACCOUNT_INACTIVE
        );
      }

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken({
        ...tokenPayload,
        sessionId: generateTokenId(),
      });

      // Update hashed refresh token
      const hashedNewRefreshToken = await hashPassword(newRefreshToken);
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedNewRefreshToken },
      });

      const userProfile = await this.getCurrentUser(user.id);

      return {
        user: userProfile,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
      };
    } catch {
      throw new ApiError(
        'Invalid refresh token',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_TOKEN
      );
    }
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    // Clear user cache
    const cacheKey = cacheService.generateKey('user', userId);
    await cacheService.del(cacheKey);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        entity: 'User',
        entityId: userId,
      },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new ApiError(
        'Invalid verification token',
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ApiError(
        'Invalid or expired reset token',
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async getCurrentUser(userId: string): Promise<IUserPublic> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(
        'User not found',
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND
      );
    }

    return this.createUserPublic(user);
  }


  // Send verification code email
  async sendVerificationCode(email: string, code: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p>Thank you for registering. Please enter this verification code to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #007bff; font-size: 36px; letter-spacing: 10px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `;

    await sendEmail(email, 'Your Verification Code', html);
  }

  // Verify email with 4-digit code
  async verifyEmailCode(email: string, code: string): Promise<void> {
    console.log('Verifying email code for:', email, 'with code:', code);
    
    const user = await prisma.user.findUnique({
      where: { email },
    }) as any; // Type assertion for user with verification fields

    if (!user) {
      console.log('User not found for email:', email);
      throw new ApiError(
        'User not found',
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND
      );
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      status: user.status,
      emailVerificationCode: user.emailVerificationCode,
      emailVerificationCodeExpires: user.emailVerificationCodeExpires,
      emailVerifiedAt: user.emailVerifiedAt
    });

    // Check if user is already verified
    if (user.status === UserStatus.ACTIVE || user.emailVerifiedAt) {
      console.log('User is already verified');
      throw new ApiError(
        'Email is already verified',
        HttpStatus.BAD_REQUEST,
        ErrorCode.ALREADY_EXISTS
      );
    }

    if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
      console.log('No verification code found for user');
      throw new ApiError(
        'No verification code found',
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN
      );
    }

    const now = new Date();
    console.log('Checking expiration:', {
      now: now.toISOString(),
      expires: user.emailVerificationCodeExpires.toISOString(),
      isExpired: now > user.emailVerificationCodeExpires
    });
    
    if (now > user.emailVerificationCodeExpires) {
      throw new ApiError(
        'Verification code has expired',
        HttpStatus.BAD_REQUEST,
        ErrorCode.EXPIRED_TOKEN
      );
    }

    console.log('Comparing codes:', {
      stored: user.emailVerificationCode,
      provided: code,
      match: user.emailVerificationCode === code
    });

    if (user.emailVerificationCode !== code) {
      // Increment failed attempts in cache
      const attemptsKey = cacheService.generateKey('verify_attempts', email);
      const attemptsStr = await cacheService.get(attemptsKey);
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
      
      if (attempts >= 4) { // 5th attempt will fail
        throw new ApiError(
          'Too many failed attempts. Please request a new code.',
          HttpStatus.TOO_MANY_REQUESTS,
          ErrorCode.RATE_LIMIT_EXCEEDED
        );
      }

      await cacheService.set(attemptsKey, (attempts + 1).toString(), 600); // 10 minutes

      throw new ApiError(
        'Invalid verification code',
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN
      );
    }

    // Clear attempts on success
    const attemptsKey = cacheService.generateKey('verify_attempts', email);
    await cacheService.del(attemptsKey);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationCode: null,
        emailVerificationCodeExpires: null,
        status: UserStatus.ACTIVE,
      } as any, // Type assertion to bypass Prisma type issue
    });
  }

  // Resend verification code
  async resendVerificationCode(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(
        'User not found',
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND
      );
    }

    if (user.emailVerifiedAt) {
      throw new ApiError(
        'Email already verified',
        HttpStatus.BAD_REQUEST,
        ErrorCode.ALREADY_VERIFIED
      );
    }

    // Check rate limit for resend
    const resendKey = cacheService.generateKey('resend_code', email);
    const lastResend = await cacheService.get(resendKey);
    
    if (lastResend) {
      throw new ApiError(
        'Please wait before requesting a new code',
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED
      );
    }

    // Generate new code
    const emailVerificationCode = this.generateVerificationCode();
    const emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode,
        emailVerificationCodeExpires,
      } as any, // Type assertion to bypass Prisma type issue
    });

    // Set rate limit (1 minute between resends)
    await cacheService.set(resendKey, Date.now().toString(), 60);

    // Send new code
    await this.sendVerificationCode(user.email, emailVerificationCode);
  }
}

export default new AuthService();
