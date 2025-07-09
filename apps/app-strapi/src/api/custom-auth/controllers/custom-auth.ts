import { Core } from '@strapi/strapi';
import crypto from 'crypto';

const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async register(ctx) {
    try {
      const { email, password, username, firstName, lastName } = ctx.request.body;

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
      // Use the users-permissions service to properly hash the password
      const user = await strapi.plugin('users-permissions').service('user').add({
        username: username || email,
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        provider: 'local',
        confirmed: false,
        blocked: false,
        role: publicRole.id,
        emailVerificationCode: verificationCode,
        emailVerificationCodeExpires: codeExpiry
      });

      // Send verification email
      try {
        await strapi.plugin('email').service('email').send({
          to: email,
          subject: 'Verify your email',
          html: `
            <h1>Email Verification</h1>
            <p>Your verification code is:</p>
            <h2 style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h2>
            <p>This code will expire in 10 minutes.</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Delete the user if email fails
        await strapi.db.query('plugin::users-permissions.user').delete({ where: { id: user.id } });
        return ctx.internalServerError('Failed to send verification email');
      }

      // Return success without sensitive data
      return ctx.send({
        message: 'Registration successful. Please check your email for verification code.',
        email: user.email
      });

    } catch (error) {
      console.error('Registration error:', error);
      return ctx.internalServerError('Registration failed');
    }
  },

  async verifyEmail(ctx) {
    try {
      const { email, code } = ctx.request.body;

      if (!email || !code) {
        return ctx.badRequest('Email and verification code are required');
      }

      // Find user with verification code
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { 
          email: email.toLowerCase(),
          emailVerificationCode: code
        }
      });

      if (!user) {
        return ctx.badRequest('Invalid verification code');
      }

      // Check if code is expired
      if (new Date() > new Date(user.emailVerificationCodeExpires)) {
        return ctx.badRequest('Verification code has expired');
      }

      // Get authenticated role
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });

      if (!authenticatedRole) {
        return ctx.internalServerError('Authenticated role not found');
      }

      // Update user: confirm email, change role, clear verification code
      const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          confirmed: true,
          role: authenticatedRole.id,
          emailVerificationCode: null,
          emailVerificationCodeExpires: null
        }
      });

      // Generate JWT token
      const token = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

      return ctx.send({
        jwt: token,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          confirmed: updatedUser.confirmed,
          role: authenticatedRole.name
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      return ctx.internalServerError('Email verification failed');
    }
  },

  async resendCode(ctx) {
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
        return ctx.badRequest('User not found or already verified');
      }

      // Generate new 6-digit verification code
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

      // Send verification email
      await strapi.plugin('email').service('email').send({
        to: email,
        subject: 'Verify your email - New code',
        html: `
          <h1>Email Verification</h1>
          <p>Your new verification code is:</p>
          <h2 style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h2>
          <p>This code will expire in 10 minutes.</p>
        `
      });

      return ctx.send({
        message: 'Verification code sent successfully'
      });

    } catch (error) {
      console.error('Resend code error:', error);
      return ctx.internalServerError('Failed to resend verification code');
    }
  },

  async forgotPassword(ctx) {
    try {
      const { email } = ctx.request.body;

      if (!email) {
        return ctx.badRequest('Email is required');
      }

      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { 
          email: email.toLowerCase(),
          confirmed: true
        }
      });

      if (!user) {
        // Don't reveal if email exists or not for security
        return ctx.send({
          message: 'If the email exists, a password reset code has been sent.'
        });
      }

      // Generate 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

      // Store reset code in resetPasswordToken field for password reset
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetCode,
          passwordResetExpires: codeExpiry
        }
      });

      // Send password reset email
      await strapi.plugin('email').service('email').send({
        to: email,
        subject: 'Password Reset Code',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset. Use the code below to reset your password:</p>
          <h2 style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 32px; letter-spacing: 5px;">${resetCode}</h2>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      return ctx.send({
        message: 'If the email exists, a password reset code has been sent.'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      return ctx.internalServerError('Failed to process password reset request');
    }
  },

  async validateResetCode(ctx) {
    try {
      const { email, code } = ctx.request.body;

      if (!email || !code) {
        return ctx.badRequest('Email and code are required');
      }

      // Find user with reset code
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { 
          email: email.toLowerCase(),
          resetPasswordToken: code
        }
      });

      if (!user) {
        return ctx.send({ valid: false });
      }

      // Check if code is expired
      if (new Date() > new Date(user.passwordResetExpires)) {
        return ctx.send({ valid: false });
      }

      return ctx.send({ valid: true });

    } catch (error) {
      console.error('Validate reset code error:', error);
      return ctx.internalServerError('Failed to validate reset code');
    }
  },

  async resetPassword(ctx) {
    try {
      const { email, code, password } = ctx.request.body;

      if (!email || !code || !password) {
        return ctx.badRequest('Email, code, and new password are required');
      }

      // Validate password strength
      if (password.length < 6) {
        return ctx.badRequest('Password must be at least 6 characters long');
      }

      // Find user with reset code
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { 
          email: email.toLowerCase(),
          resetPasswordToken: code
        }
      });

      if (!user) {
        return ctx.badRequest('Invalid reset code');
      }

      // Check if code is expired
      if (new Date() > new Date(user.passwordResetExpires)) {
        return ctx.badRequest('Reset code has expired');
      }

      // Update password using the users-permissions service to ensure proper hashing
      await strapi.plugin('users-permissions').service('user').edit(user.id, {
        password,
        resetPasswordToken: null,
        passwordResetExpires: null
      });

      return ctx.send({
        message: 'Password has been reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      return ctx.internalServerError('Failed to reset password');
    }
  },

  async changePassword(ctx) {
    try {
      const { currentPassword, newPassword } = ctx.request.body;

      if (!currentPassword || !newPassword) {
        return ctx.badRequest('Current password and new password are required');
      }

      // Validate new password strength
      if (newPassword.length < 6) {
        return ctx.badRequest('New password must be at least 6 characters long');
      }

      // Get the authenticated user
      const userId = ctx.state.user.id;
      if (!userId) {
        return ctx.unauthorized('User not authenticated');
      }

      // Get user with password
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
        populate: ['role']
      });

      if (!user) {
        return ctx.notFound('User not found');
      }

      // Verify current password
      const validPassword = await strapi.plugin('users-permissions').service('user').validatePassword(
        currentPassword,
        user.password
      );

      if (!validPassword) {
        return ctx.badRequest('Current password is incorrect');
      }

      // Update password using the users-permissions service to ensure proper hashing
      await strapi.plugin('users-permissions').service('user').edit(userId, {
        password: newPassword
      });

      return ctx.send({
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      return ctx.internalServerError('Failed to change password');
    }
  },

  async updateProfile(ctx) {
    try {
      const userId = ctx.state.user.id;
      if (!userId) {
        return ctx.unauthorized('User not authenticated');
      }

      const { username, email, firstName } = ctx.request.body;

      // Prepare update data
      const updateData: any = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      // TEMPORARILY DISABLED: Profile image upload
      // if (profileImage !== undefined) updateData.profileImage = profileImage;

      // Update user using the users-permissions service
      const updatedUser = await strapi.plugin('users-permissions').service('user').edit(userId, updateData);

      // Remove sensitive data
      const { password, resetPasswordToken, confirmationToken, ...sanitizedUser } = updatedUser;

      return ctx.send({
        user: sanitizedUser
      });

    } catch (error) {
      console.error('Update profile error:', error);
      return ctx.internalServerError('Failed to update profile');
    }
  }
});