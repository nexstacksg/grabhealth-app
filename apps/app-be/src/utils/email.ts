import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import * as mailgunService from './mailgun';

dotenv.config();

// Check if we should use Mailgun
const USE_MAILGUN = !!process.env.MAIL_GUN_API_KEY;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates in production
  },
  connectionTimeout: 5000, // 5 seconds connection timeout
  greetingTimeout: 5000, // 5 seconds greeting timeout
  socketTimeout: 10000, // 10 seconds socket timeout
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  // Use Mailgun if API key is configured
  if (USE_MAILGUN) {
    console.log('Using Mailgun for email delivery');
    return mailgunService.sendEmail(to, subject, html);
  }

  // Otherwise use SMTP
  try {
    // Log email configuration for debugging
    console.log('Email configuration (SMTP):', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-4) : 'not set',
      from: process.env.EMAIL_FROM || `"${process.env.APP_NAME || 'GrabHealth'}" <${process.env.SMTP_USER}>`,
      to: to,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${process.env.APP_NAME || 'GrabHealth'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    // Check if SMTP credentials are properly configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
) => {
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:4000'}/api/v1/auth/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, 'Verify your email address', html);
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, 'Password Reset Request', html);
};

export const sendTestEmail = async (to: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Test Email</h2>
      <p>This is a test email to verify that your email configuration is working correctly.</p>
      <p>If you're receiving this email, your SMTP settings are properly configured!</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">This is an automated test email.</p>
    </div>
  `;

  return sendEmail(to, 'Email Configuration Test', html);
};
