import {
  IUserPublic,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  ProfileImageUploadResponse,
} from '@app/shared-types';
import { IProfileDataSource } from '../interfaces/IProfileDataSource';
import { ServiceOptions } from '../types';

export interface ProfileServiceOptions extends ServiceOptions {
  dataSource: IProfileDataSource;
}

export class ProfileService {
  private dataSource: IProfileDataSource;

  constructor(options: ProfileServiceOptions) {
    this.dataSource = options.dataSource;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<IUserPublic> {
    return this.dataSource.getProfile();
  }

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<IUserPublic> {
    // Validate required fields and sanitize data
    const updateData: ProfileUpdateRequest = {};
    
    if (data.firstName !== undefined) {
      if (!data.firstName.trim()) {
        throw new Error('First name cannot be empty');
      }
      updateData.firstName = data.firstName.trim();
    }
    
    if (data.lastName !== undefined) {
      if (!data.lastName.trim()) {
        throw new Error('Last name cannot be empty');
      }
      updateData.lastName = data.lastName.trim();
    }
    
    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
      updateData.email = data.email.toLowerCase().trim();
    }
    
    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber.trim();
    }
    
    if (data.address !== undefined) {
      updateData.address = data.address.trim();
    }
    
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth;
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('At least one field must be provided for update');
    }
    
    return this.dataSource.updateProfile(updateData);
  }

  /**
   * Change password
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    if (!data.currentPassword) {
      throw new Error('Current password is required');
    }
    
    if (!data.newPassword) {
      throw new Error('New password is required');
    }
    
    if (data.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }
    
    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(data.newPassword);
    const hasLowerCase = /[a-z]/.test(data.newPassword);
    const hasNumbers = /\d/.test(data.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    
    return this.dataSource.changePassword(data);
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<ProfileImageUploadResponse> {
    if (!file) {
      throw new Error('File is required');
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed');
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }
    
    return this.dataSource.uploadProfileImage(file);
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    if (!password) {
      throw new Error('Password is required to delete account');
    }
    
    return this.dataSource.deleteAccount(password);
  }

  /**
   * Get user's referral code
   */
  async getReferralCode(): Promise<{ code: string; usageCount: number }> {
    return this.dataSource.getReferralCode();
  }

  /**
   * Generate new referral code
   */
  async generateReferralCode(): Promise<{ code: string }> {
    return this.dataSource.generateReferralCode();
  }
}