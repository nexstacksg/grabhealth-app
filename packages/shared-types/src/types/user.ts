import { UserRole, UserStatus } from '../enums';

// Core user fields
export interface User {
  email: string;
  firstName: string;
  lastName: string;
}

// Profile fields
export interface UserProfile {
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  department?: string;
  imageUrl?: string;
}

// Auth related fields
interface UserAuth {
  password: string;
}

// Admin manageable fields
interface UserAdmin {
  role?: UserRole;
  status?: UserStatus;
}

// MLM fields
interface UserMLM {
  referralCode?: string;
  sponsorId?: string;
}

// Composed request types
export interface CreateUserRequest extends User, UserAuth, UserProfile, UserAdmin, UserMLM {}

export interface UpdateProfileRequest extends Partial<User>, UserProfile {}

export interface UpdateUserRequest extends Partial<User>, UserProfile, UserAdmin {}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserSearchParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}