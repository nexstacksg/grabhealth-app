import { UserRole, UserStatus } from '@app/shared-types';
import { AuthService } from '../../services/AuthService';
import { MockAuthDataSource } from '../../adapters/mock/MockAuthDataSource';
import {
  ValidationError,
  AuthenticationError,
  ConflictError
} from '../../utils/errors';

describe('AuthService', () => {
  let authService: AuthService;
  let mockDataSource: MockAuthDataSource;

  beforeEach(() => {
    mockDataSource = new MockAuthDataSource();
    authService = new AuthService({
      dataSource: mockDataSource as any // Type assertion for testing
    });
  });

  afterEach(() => {
    mockDataSource.clear();
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'Test@123'
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.firstName).toBe('Test');
      expect(result.user.lastName).toBe('User');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw error with invalid email format', async () => {
      await expect(
        authService.login({
          email: 'invalid-email',
          password: 'Test@123'
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error with empty password', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: ''
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error with wrong password', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword@123'
        })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'Test@123'
        })
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'ValidPass@123',
        name: 'New User'
      });

      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.firstName).toBe('New');
      expect(result.user.lastName).toBe('User');
      expect(result.user.role).toBe(UserRole.USER);
      expect(result.user.status).toBe(UserStatus.PENDING_VERIFICATION);
      expect(result.tokens).toBeDefined();
    });

    it('should handle single name correctly', async () => {
      const result = await authService.register({
        email: 'singlename@example.com',
        password: 'ValidPass@123',
        name: 'SingleName'
      });

      expect(result.user.firstName).toBe('SingleName');
      expect(result.user.lastName).toBe('');
    });

    it('should register with referral code', async () => {
      const result = await authService.register({
        email: 'referred@example.com',
        password: 'ValidPass@123',
        name: 'Referred User',
        referralCode: 'TEST123'
      });

      expect(result.user.email).toBe('referred@example.com');
      // The mock should have set the uplineId
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.register({
          email: 'invalid-email',
          password: 'ValidPass@123',
          name: 'Test User'
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error for weak password', async () => {
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User'
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error for empty name', async () => {
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'ValidPass@123',
          name: ''
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error for already registered email', async () => {
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'ValidPass@123',
          name: 'Another User'
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const loginResult = await authService.login({
        email: 'test@example.com',
        password: 'Test@123'
      });

      const newTokens = await authService.refreshToken(
        loginResult.tokens.refreshToken
      );

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(
        authService.refreshToken('invalid-token')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw error for empty refresh token', async () => {
      await expect(
        authService.refreshToken('')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const profile = await authService.getProfile('1');

      expect(profile.id).toBe('1');
      expect(profile.email).toBe('test@example.com');
      expect(profile.firstName).toBe('Test');
      expect(profile.lastName).toBe('User');
      expect(profile.emailVerified).toBe(true);
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.getProfile('999')
      ).rejects.toThrow('User not found');
    });

    it('should throw error for empty user ID', async () => {
      await expect(
        authService.getProfile('')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('password reset', () => {
    it('should request password reset successfully', async () => {
      const result = await authService.requestPasswordReset('test@example.com');

      expect(result.message).toBe('If the email exists, a reset link has been sent');
    });

    it('should return same message for non-existent email', async () => {
      const result = await authService.requestPasswordReset('nonexistent@example.com');

      expect(result.message).toBe('If the email exists, a reset link has been sent');
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.requestPasswordReset('invalid-email')
      ).rejects.toThrow(ValidationError);
    });

    it('should reset password with valid token', async () => {
      // First request reset
      await authService.requestPasswordReset('test@example.com');

      // Get the reset token from mock (in real scenario, this would be from email)
      const user = mockDataSource.getUser('1');
      const resetToken = user?.resetToken!;

      const result = await authService.resetPassword(resetToken, 'NewPass@123');

      expect(result.message).toBe('Password reset successfully');

      // Verify can login with new password
      const loginResult = await authService.login({
        email: 'test@example.com',
        password: 'NewPass@123'
      });

      expect(loginResult.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid reset token', async () => {
      await expect(
        authService.resetPassword('invalid-token', 'NewPass@123')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error for weak new password', async () => {
      await expect(
        authService.resetPassword('some-token', 'weak')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('email verification', () => {
    beforeEach(async () => {
      // Register a new unverified user
      await authService.register({
        email: 'unverified@example.com',
        password: 'ValidPass@123',
        name: 'Unverified User'
      });
    });

    it('should send verification code', async () => {
      const result = await authService.verifyEmail('unverified@example.com');

      expect(result.message).toBe('Verification code sent');
    });

    it('should return already verified for verified email', async () => {
      const result = await authService.verifyEmail('test@example.com');

      expect(result.message).toBe('Email already verified');
    });

    it('should verify email with correct code', async () => {
      await authService.verifyEmail('unverified@example.com');

      // Get verification code from mock
      const userId = mockDataSource['emailToUserId'].get('unverified@example.com');
      const user = mockDataSource.getUser(userId!);
      const code = user?.verificationCode!;

      const result = await authService.verifyEmailCode('unverified@example.com', code);

      expect(result.message).toBe('Email verified successfully');

      // Check user is now verified
      const profile = await authService.getProfile(userId!);
      expect(profile.emailVerified).toBe(true);
    });

    it('should throw error for wrong verification code', async () => {
      await expect(
        authService.verifyEmailCode('unverified@example.com', '000000')
      ).rejects.toThrow(ValidationError);
    });

    it('should resend verification code', async () => {
      const result = await authService.resendVerificationCode('unverified@example.com');

      expect(result.message).toBe('Verification code sent');
    });
  });

  describe('authorization helpers', () => {
    describe('canViewUser', () => {
      it('should allow user to view their own profile', () => {
        const canView = authService.canViewUser('123', '123', UserRole.USER);
        expect(canView).toBe(true);
      });

      it('should allow manager to view any user', () => {
        const canView = authService.canViewUser('123', '456', UserRole.MANAGER);
        expect(canView).toBe(true);
      });

      it('should allow super admin to view any user', () => {
        const canView = authService.canViewUser('123', '456', UserRole.SUPER_ADMIN);
        expect(canView).toBe(true);
      });

      it('should not allow user to view other users', () => {
        const canView = authService.canViewUser('123', '456', UserRole.USER);
        expect(canView).toBe(false);
      });

      it('should not allow without user ID', () => {
        const canView = authService.canViewUser('123');
        expect(canView).toBe(false);
      });
    });

    describe('canModifyUser', () => {
      it('should allow user to modify their own profile', () => {
        const canModify = authService.canModifyUser('123', '123', UserRole.USER);
        expect(canModify).toBe(true);
      });

      it('should allow super admin to modify any user', () => {
        const canModify = authService.canModifyUser('123', '456', UserRole.SUPER_ADMIN);
        expect(canModify).toBe(true);
      });

      it('should allow manager to modify users', () => {
        const canModify = authService.canModifyUser('123', '456', UserRole.MANAGER);
        expect(canModify).toBe(true);
      });

      it('should not allow user to modify other users', () => {
        const canModify = authService.canModifyUser('123', '456', UserRole.USER);
        expect(canModify).toBe(false);
      });
    });
  });

  describe('password hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword@123';
      const hashed = await authService.hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should verify hashed password correctly', async () => {
      const password = 'TestPassword@123';
      const hashed = await authService.hashPassword(password);

      const isValid = await authService.comparePassword(password, hashed);
      expect(isValid).toBe(true);

      const isInvalid = await authService.comparePassword('WrongPassword', hashed);
      expect(isInvalid).toBe(false);
    });
  });
});