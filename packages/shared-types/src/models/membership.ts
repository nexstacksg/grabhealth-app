import {
  MembershipTier,
  MembershipStatus,
  AccountRequestType,
  AccountRequestStatus,
} from '../enums/membership';

export interface IMembershipTier {
  id: number;
  name: MembershipTier;
  description?: string;
  price: number; // Now 0 for free membership
  benefits?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMembership {
  id: number;
  userId: string; // Changed to string to match backend User model
  tierId: number;
  status: MembershipStatus;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGiftItem {
  id: number;
  name: string;
  description?: string;
  requiredPurchases: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromotion {
  id: number;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minPurchase?: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountRequest {
  id: number;
  userId: string; // Changed to string to match backend User model
  requestType: AccountRequestType;
  requestDetails?: string;
  status: AccountRequestStatus;
  adminNotes?: string;
  processedAt?: Date;
  processedBy?: string; // Changed to string to match backend User model
  createdAt: Date;
  updatedAt: Date;
}

export interface IMembershipCreate {
  name: MembershipTier;
  description?: string;
  price: number; // Now 0 for free membership
  benefits?: string;
}

export interface IPromotionCreate {
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minPurchase?: number;
  startDate: Date;
  endDate?: Date;
  isActive?: boolean;
}

// Membership response type for frontend contexts
// Extends IUserMembership with additional fields needed by UI
export interface IMembership extends IUserMembership {
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  tier: string;
  points?: number;
}
