import { IUser } from '../models/user';
import { IPartner, IService } from './partner';
import { PaymentStatus } from '../enums/order';

export interface IBooking {
  id: string;
  userId: string;
  user?: IUser;
  partnerId: string;
  partner?: IPartner;
  serviceId: string;
  service?: IService;
  bookingDate: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: BookingStatus;
  notes?: string;
  cancellationReason?: string;
  isFreeCheckup: boolean;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFreeCheckupClaim {
  id: string;
  userId: string;
  user?: IUser;
  claimDate: Date;
  expiryDate: Date;
  status: FreeCheckupStatus;
  usedBookingId?: string;
  usedBooking?: IBooking;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBookingRequest {
  userId?: string; // Optional if from authenticated context
  partnerId: string;
  serviceId: string;
  bookingDate: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  notes?: string;
  isFreeCheckup?: boolean;
  paymentMethod?: string;
}

export interface IBookingFilter {
  userId?: string;
  partnerId?: string;
  status?: BookingStatus;
  fromDate?: Date;
  toDate?: Date;
  isFreeCheckup?: boolean;
}

export interface IFreeCheckupStatus {
  eligible: boolean;
  hasClaim: boolean;
  claim?: IFreeCheckupClaim;
  reason?: string; // Why not eligible
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

export enum FreeCheckupStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED'
}