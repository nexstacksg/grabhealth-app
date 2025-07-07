import { Core } from '@strapi/strapi';

const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async register(ctx: any) {
    try {
      const { email, password, username, firstName, lastName } = ctx.request.body;

      // Validate required fields
      if (!email || !password) {
        return ctx.badRequest('Email and password are required');
      }

      // Check if user exists
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return ctx.badRequest('Email already registered');
      }

      // Get the public role
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });

      if (!publicRole) {
        return ctx.internalServerError('Public role not found');
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

      // Create user with public role and unconfirmed status
      const user = await strapi.plugin('users-permissions').service('user').add({
        username: username || email,
        email: email.toLowerCase(),
        password,
        firstName: firstName || '',
        lastName: lastName || '',
        provider: 'local',
        confirmed: false,
        blocked: false,
        role: publicRole.id,
        emailVerificationCode: verificationCode,
        emailVerificationCodeExpires: codeExpiry,
        status: 'PENDING_VERIFICATION'
      });

      // Try to send verification email
      const emailSent = await this.sendVerificationEmail(email, verificationCode, firstName);
      
      if (!emailSent && process.env.NODE_ENV === 'production') {
        // In production, delete user if email fails
        await strapi.db.query('plugin::users-permissions.user').delete({ where: { id: user.id } });
        return ctx.internalServerError('Failed to send verification email');
      }

      // Generate JWT for the user (they can browse but not perform authenticated actions)
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

      // Return success
      return ctx.send({
        jwt,
        user: this.sanitizeUser(user),
        message: emailSent 
          ? 'Registration successful. Please check your email for verification code.'
          : 'Registration successful. Check console for verification code (dev mode).'
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      return ctx.internalServerError('Registration failed: ' + error.message);
    }
  },

  async verifyEmail(ctx: any) {
    try {
      console.log('Verify email endpoint called with request body:', ctx.request.body);
      const { email, code } = ctx.request.body;

      if (!email || !code) {
        console.log('Validation failed: email or code missing');
        return ctx.badRequest('Email and verification code are required');
      }

      console.log('Looking up user with email:', email.toLowerCase(), 'and code:', code);
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { 
          email: email.toLowerCase(),
          emailVerificationCode: code,
          emailVerificationCodeExpires: { $gte: new Date() }
        }
      });

      if (!user) {
        console.log('User not found or code invalid/expired');
        return ctx.badRequest('Invalid or expired verification code');
      }
      
      console.log('User found:', user.id);

      // Get authenticated role
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });

      if (!authenticatedRole) {
        return ctx.internalServerError('Authenticated role not found');
      }

      // Update user to confirmed
      const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          confirmed: true,
          emailVerificationCode: null,
          emailVerificationCodeExpires: null,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE',
          role: authenticatedRole.id
        },
        populate: ['role']
      });

      return ctx.send({
        message: 'Email verified successfully',
        user: this.sanitizeUser(updatedUser)
      });

    } catch (error: any) {
      console.error('Email verification error:', error);
      return ctx.internalServerError('Verification failed: ' + (error.message || 'Unknown error'));
    }
  },

  async resendCode(ctx: any) {
    try {
      const { email } = ctx.request.body;

      if (!email) {
        return ctx.badRequest('Email is required');
      }

      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { 
          email: email.toLowerCase(),
          confirmed: false
        }
      });

      if (!user) {
        // Don't reveal if email exists
        return ctx.send({
          message: 'If the email exists and is unverified, a new code has been sent.'
        });
      }

      // Generate new code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

      // Update user with new code
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          emailVerificationCode: verificationCode,
          emailVerificationCodeExpires: codeExpiry
        }
      });

      // Send email
      await this.sendVerificationEmail(email, verificationCode, user.firstName);

      return ctx.send({
        message: 'If the email exists and is unverified, a new code has been sent.'
      });

    } catch (error: any) {
      console.error('Resend code error:', error);
      return ctx.internalServerError('Failed to resend code');
    }
  },

  // Helper method to send verification email
  async sendVerificationEmail(email: string, code: string, firstName?: string): Promise<boolean> {
    try {
      await strapi.plugin('email').service('email').send({
        to: email,
        subject: 'Verify your email',
        html: `
          <h1>Email Verification</h1>
          <p>Hello ${firstName || 'there'},</p>
          <p>Your verification code is:</p>
          <h2 style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 32px; letter-spacing: 5px;">${code}</h2>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      return true;
    } catch (emailError: any) {
      console.error('Failed to send verification email:', emailError);
      
      // In development, log the code
      if (process.env.NODE_ENV === 'development') {
        console.log('\n=================================');
        console.log('DEVELOPMENT MODE - Email not sent');
        console.log('Email:', email);
        console.log('Verification Code:', code);
        console.log('=================================\n');
      }
      
      return false;
    }
  },

  // Helper to sanitize user data
  sanitizeUser(user: any) {
    const { password, emailVerificationCode, emailVerificationCodeExpires, ...sanitized } = user;
    // Ensure status is included
    return {
      ...sanitized,
      status: user.status || 'PENDING_VERIFICATION'
    };
  }
});