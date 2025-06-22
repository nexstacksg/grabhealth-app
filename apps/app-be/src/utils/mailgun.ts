import formData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAIL_GUN_API_KEY || '',
  url: 'https://api.mailgun.net' // Try switching to 'https://api.eu.mailgun.net' if using EU region
});

// Debug: Log API key info
console.log('Mailgun client initialized with:', {
  hasApiKey: !!process.env.MAIL_GUN_API_KEY,
  apiKeyPrefix: process.env.MAIL_GUN_API_KEY?.substring(0, 8) + '...',
  url: 'https://api.mailgun.net'
});

// Use sandbox domain if custom domain is not set up
const DOMAIN = process.env.MAILGUN_DOMAIN || 'sandbox.mailgun.org'; // Your Mailgun domain

export const sendEmailWithMailgun = async (to: string, subject: string, html: string) => {
  try {
    // Log email configuration for debugging
    console.log('Mailgun email configuration:', {
      domain: DOMAIN,
      from: process.env.EMAIL_FROM || 'noreply@grabhealth.ai',
      to: to,
      apiKeyExists: !!process.env.MAIL_GUN_API_KEY,
      apiKeyLength: process.env.MAIL_GUN_API_KEY?.length
    });

    // For sandbox domains, you need to add authorized recipients in Mailgun dashboard
    // or use a verified custom domain
    const fromEmail = DOMAIN.includes('sandbox') 
      ? `GrabHealth <mailgun@${DOMAIN}>` 
      : (process.env.EMAIL_FROM || 'GrabHealth <noreply@grabhealth.ai>');

    const mailOptions = {
      from: fromEmail,
      to: [to],
      subject,
      html,
      text: html.replace(/<[^>]*>?/gm, '') // Strip HTML for text version
    };

    // Check if Mailgun API key is configured
    if (!process.env.MAIL_GUN_API_KEY) {
      throw new Error('Mailgun API key not configured. Please set MAIL_GUN_API_KEY environment variable.');
    }

    console.log('Sending email via Mailgun:', {
      domain: DOMAIN,
      from: fromEmail,
      to: to
    });

    const result = await mg.messages.create(DOMAIN, mailOptions);
    console.log('Mailgun email sent successfully:', result.id);
    logger.info(`Mailgun email sent successfully to ${to}`, { messageId: result.id });
    return result;
  } catch (error: any) {
    console.error('Error sending email with Mailgun:', error.message || error);
    if (error.details) {
      console.error('Mailgun error details:', error.details);
    }
    logger.error('Failed to send email with Mailgun:', error);
    throw error;
  }
};

// Export functions with same signatures as existing email.ts
export const sendEmail = sendEmailWithMailgun;

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
      <p>This is a test email sent via Mailgun to verify that your email configuration is working correctly.</p>
      <p>If you're receiving this email, your Mailgun settings are properly configured!</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">This is an automated test email sent via Mailgun.</p>
    </div>
  `;

  return sendEmail(to, 'Mailgun Email Configuration Test', html);
};