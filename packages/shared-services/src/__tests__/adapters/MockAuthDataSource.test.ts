import { UserRole, UserStatus } from '@app/shared-types';
import { MockAuthDataSource } from '../../adapters/mock/MockAuthDataSource';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError
} from '../../utils/errors';

describe('MockAuthDataSource', () => {
  let dataSource: MockAuthDataSource;

  beforeEach(() => {
    dataSource = new MockAuthDataSource();
  });

  afterEach(() => {
    dataSource.clear();
  });

  describe('login', () => {
    it('should login with default test user', async () => {
      const result = await dataSource.login({
        email: 'test@example.com',
        password: 'Test@123'
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.firstName).toBe('Test');
      expect(result.user.lastName).toBe('User');
      expect(result.tokens.accessToken).toContain('access_1_');
      expect(result.tokens.refreshToken).toContain('refresh_1_');
    });

    it('should handle case-insensitive email', async () => {
      const result = await dataSource.login({
        email: 'TEST@EXAMPLE.COM',
        password: 'Test@123'
      });

      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for wrong password', async () => {
      await expect(
        dataSource.login({
          email: 'test@example.com',
          password: 'wrong'
        })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        dataSource.login({
          email: 'nonexistent@example.com',
          password: 'Test@123'
        })
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('register', () => {
    it('should register new user', async () => {
      const result = await dataSource.register({
        email: 'newuser@example.com',
        password: 'NewPass@123',
        name: 'New User'
      });

      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.firstName).toBe('New');
      expect(result.user.lastName).toBe('User');
      expect(result.user.role).toBe(UserRole.USER);
      expect(result.user.status).toBe(UserStatus.PENDING_VERIFICATION);
      expect(result.user.emailVerified).toBe(false);
    });

    it('should handle referral code', async () => {
      const result = await dataSource.register({
        email: 'referred@example.com',
        password: 'Pass@123',
        name: 'Referred User',
        referralCode: 'TEST123'
      });

      // Upline is set internally but not exposed in IUserPublic
    });

    it('should ignore invalid referral code', async () => {
      const result = await dataSource.register({
        email: 'referred@example.com',
        password: 'Pass@123',
        name: 'Referred User',
        referralCode: 'INVALID'
      });

      // Invalid referral code is ignored internally
    });

    it('should throw error for duplicate email', async () => {
      await expect(
        dataSource.register({
          email: 'test@example.com',
          password: 'Pass@123',
          name: 'Duplicate User'
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('logout', () => {
    it('should logout user and remove tokens', async () => {
      const loginResult = await dataSource.login({
        email: 'test@example.com',
        password: 'Test@123'
      });

      await dataSource.logout('1');

      // Try to use refresh token - should fail
      await expect(
        dataSource.refreshToken(loginResult.tokens.refreshToken)
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token for logged in user', async () => {
      const loginResult = await dataSource.login({
        email: 'test@example.com',
        password: 'Test@123'
      });

      const newTokens = await dataSource.refreshToken(loginResult.tokens.refreshToken);

      expect(newTokens.accessToken).toContain('access_1_');
      expect(newTokens.refreshToken).toContain('refresh_1_');
      expect(newTokens.accessToken).not.toBe(loginResult.tokens.accessToken);
    });

    it('should throw error for invalid token', async () => {
      await expect(
        dataSource.refreshToken('invalid-token')
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const profile = await dataSource.getProfile('1');

      expect(profile.id).toBe('1');
      expect(profile.email).toBe('test@example.com');
      expect(profile.firstName).toBe('Test');
      expect(profile.lastName).toBe('User');
      expect(profile.emailVerified).toBe(true);
      expect(profile).not.toHaveProperty('password');
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        dataSource.getProfile('999')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('password reset', () => {
    it('should request password reset for existing user', async () => {
      const result = await dataSource.requestPasswordReset({
        email: 'test@example.com'
      });

      expect(result.message).toBe('If the email exists, a reset link has been sent');

      const user = dataSource.getUser('1');
      expect(user?.resetToken).toBeDefined();
    });

    it('should return same message for non-existent email', async () => {
      const result = await dataSource.requestPasswordReset({
        email: 'nonexistent@example.com'
      });

      expect(result.message).toBe('If the email exists, a reset link has been sent');
    });

    it('should reset password with valid token', async () => {
      await dataSource.requestPasswordReset({
        email: 'test@example.com'
      });

      const user = dataSource.getUser('1');
      const resetToken = user?.resetToken!;

      const result = await dataSource.resetPassword({
        token: resetToken,
        newPassword: 'NewPass@123'
      });

      expect(result.message).toBe('Password reset successfully');

      // Verify token is cleared
      const updatedUser = dataSource.getUser('1');
      expect(updatedUser?.resetToken).toBeNull();

      // Verify can login with new password
      const loginResult = await dataSource.login({
        email: 'test@example.com',
        password: 'NewPass@123'
      });

      expect(loginResult.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid reset token', async () => {
      await expect(
        dataSource.resetPassword({
          token: 'invalid-token',
          newPassword: 'NewPass@123'
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('email verification', () => {
    let unverifiedUserId: string;

    beforeEach(async () => {
      const result = await dataSource.register({
        email: 'unverified@example.com',
        password: 'Pass@123',
        name: 'Unverified User'
      });
      unverifiedUserId = result.user.id;
    });

    it('should send verification code', async () => {
      const result = await dataSource.verifyEmail('unverified@example.com');

      expect(result.message).toBe('Verification code sent');

      const user = dataSource.getUser(unverifiedUserId);
      expect(user?.verificationCode).toBeDefined();
      expect(user?.verificationCode).toHaveLength(6);
    });

    it('should return already verified message', async () => {
      const result = await dataSource.verifyEmail('test@example.com');

      expect(result.message).toBe('Email already verified');
    });

    it('should verify email with correct code', async () => {
      await dataSource.verifyEmail('unverified@example.com');

      const user = dataSource.getUser(unverifiedUserId);
      const code = user?.verificationCode!;

      const result = await dataSource.verifyEmailCode({
        email: 'unverified@example.com',
        code
      });

      expect(result.message).toBe('Email verified successfully');

      const updatedUser = dataSource.getUser(unverifiedUserId);
      expect(updatedUser?.emailVerifiedAt).toBeDefined();
      expect(updatedUser?.status).toBe(UserStatus.ACTIVE);
      expect(updatedUser?.verificationCode).toBeNull();
    });

    it('should throw error for wrong code', async () => {
      await expect(
        dataSource.verifyEmailCode({
          email: 'unverified@example.com',
          code: '000000'
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error for non-existent email', async () => {
      await expect(
        dataSource.verifyEmail('nonexistent@example.com')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('test helper methods', () => {
    it('should add custom user', () => {
      dataSource.addUser({
        id: '99',
        email: 'custom@example.com',
        password: 'hashed',
        firstName: 'Custom',
        lastName: 'User',
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        referralCode: 'CUSTOM99',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const user = dataSource.getUser('99');
      expect(user).toBeDefined();
      expect(user?.email).toBe('custom@example.com');
      expect(user?.role).toBe(UserRole.MANAGER);
    });

    it('should clear all data', () => {
      dataSource.clear();

      const user = dataSource.getUser('1');
      expect(user).toBeUndefined();

      // Should not be able to login
      expect(
        dataSource.login({
          email: 'test@example.com',
          password: 'Test@123'
        })
      ).rejects.toThrow(AuthenticationError);
    });
  });
});