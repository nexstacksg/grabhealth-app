// Profile Service Types
export interface IProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface IPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IProfileImageUploadResponse {
  imageUrl: string;
}

// Backward compatibility exports (without I prefix)
export type ProfileUpdateRequest = IProfileUpdateRequest;
export type PasswordChangeRequest = IPasswordChangeRequest;
export type ProfileImageUploadResponse = IProfileImageUploadResponse;