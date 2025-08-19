import { UserRole, UserStatus } from '../enums';

export interface IUser {
  documentId: string; // Strapi 5 document ID
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  role: string; // Match Prisma exactly
  status: string; // Match Prisma exactly
  referralCode?: string | null;
  uplineId?: string | null;
  refreshToken?: string | null;
  lastLoginAt?: Date | null;
  emailVerificationToken?: string | null;
  emailVerifiedAt?: Date | null;
  emailVerificationCode?: string | null;
  emailVerificationCodeExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  documentId: string; // Strapi 5 document ID
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  role: string;
  status: string;
  referralCode?: string | null;
  emailVerified?: boolean; // Computed from emailVerifiedAt
  emailVerifiedAt?: Date | null;
  createdAt: Date;
  partnerId?: string; // Link to partner organization
  partner?: {
    documentId: string; // Strapi 5 document ID
    name: string;
    email: string;
  };
}

export interface IUserAuth {
  documentId: string; // Strapi 5 document ID
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
}

export interface ICreateUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface IUpdateUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

// Backward compatibility aliases
export type { ICreateUser as IUserCreate };
export type { IUpdateUser as IUserUpdate };
