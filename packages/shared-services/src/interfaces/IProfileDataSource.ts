import {
  IUserPublic,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  ProfileImageUploadResponse,
} from '@app/shared-types';

export interface IProfileDataSource {
  getProfile(): Promise<IUserPublic>;
  updateProfile(data: ProfileUpdateRequest): Promise<IUserPublic>;
  changePassword(data: PasswordChangeRequest): Promise<void>;
  uploadProfileImage(file: File): Promise<ProfileImageUploadResponse>;
  deleteAccount(password: string): Promise<void>;
  getReferralCode(): Promise<{ code: string; usageCount: number }>;
  generateReferralCode(): Promise<{ code: string }>;
}