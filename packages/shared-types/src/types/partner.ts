export interface IPartner {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  imageUrl?: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  operatingHours?: Record<string, { open: string; close: string }>;
  specializations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IService {
  id: string;
  partnerId: string;
  partner?: IPartner;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category: string;
  isActive: boolean;
  requiresApproval: boolean;
  maxBookingsPerDay?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPartnerAvailability {
  id: string;
  partnerId: string;
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  slotDuration: number; // in minutes
  maxBookingsPerSlot: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPartnerDaysOff {
  id: string;
  partnerId: string;
  date: Date;
  reason?: string;
  isRecurring: boolean;
  recurringType?: 'WEEKLY' | 'ANNUAL' | null;
  dayOfWeek?: number; // 0-6 for weekly recurring (0=Sunday, 1=Monday, etc.)
  createdAt: Date;
}

export interface IPartnerFilter {
  city?: string;
  specialization?: string;
  rating?: number;
  isActive?: boolean;
  search?: string;
}

export interface IAvailableSlot {
  date: string;
  time: string;
  available: boolean;
  maxBookings: number;
  currentBookings: number;
}

export interface ICalendarDay {
  date: string;
  dayOfWeek: number;
  isAvailable: boolean;
  isDayOff: boolean;
  availableSlots: number;
  totalSlots: number;
  bookings?: {
    id: string;
    time: string;
    customerName: string;
    serviceName: string;
    status: string;
  }[];
}

export type ServiceCategory =
  | 'Body Check'
  | 'Consultation'
  | 'Therapy'
  | 'Screening'
  | 'Other';
