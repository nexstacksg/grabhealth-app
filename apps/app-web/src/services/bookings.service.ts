/**
 * Bookings Service - Handles all booking related API calls for Strapi backend
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { IBooking, ApiResponse, IUserPublic } from '@app/shared-types';
import { transformStrapiUser } from './strapi-base';

interface CreateBookingData {
  partnerId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
  isFreeCheckup?: boolean;
}

interface BookingFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
  partnerId?: string;
  page?: number;
  limit?: number;
}

// Strapi response formats
interface StrapiBookingResponse {
  data: any;
  meta?: any;
}

interface StrapiBookingsResponse {
  data: any[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Transform Strapi booking to our IBooking format
function transformStrapiBooking(strapiBooking: any): IBooking {
  if (!strapiBooking) {
    throw new Error('Invalid booking data');
  }

  return {
    id: strapiBooking.id?.toString() || '',
    userId: strapiBooking.user?.id?.toString() || '',
    user: strapiBooking.user ? transformStrapiUser(strapiBooking.user) : undefined,
    partnerId: strapiBooking.partner?.id?.toString() || '',
    partner: strapiBooking.partner || undefined,
    serviceId: strapiBooking.service?.id?.toString() || '',
    service: strapiBooking.service || undefined,
    bookingDate: strapiBooking.bookingDate,
    startTime: strapiBooking.startTime || '',
    endTime: strapiBooking.endTime || '',
    status: strapiBooking.status || 'PENDING',
    notes: strapiBooking.notes || null,
    cancellationReason: strapiBooking.cancellationReason || null,
    isFreeCheckup: strapiBooking.isFreeCheckup || false,
    totalAmount: parseFloat(strapiBooking.totalAmount || 0),
    paymentStatus: strapiBooking.paymentStatus || 'PENDING',
    paymentMethod: strapiBooking.paymentMethod || null,
    createdAt: new Date(strapiBooking.createdAt),
    updatedAt: new Date(strapiBooking.updatedAt),
  };
}

class BookingsService extends BaseService {
  async getMyBookings(filters?: BookingFilters): Promise<{
    bookings: IBooking[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // Build query params for Strapi
      const queryParams = new URLSearchParams();
      
      // Filter by current user
      queryParams.append('filters[user][id][$eq]', 'me');
      
      if (filters?.status) {
        queryParams.append('filters[status][$eq]', filters.status);
      }
      
      if (filters?.fromDate) {
        queryParams.append('filters[bookingDate][$gte]', filters.fromDate);
      }
      
      if (filters?.toDate) {
        queryParams.append('filters[bookingDate][$lte]', filters.toDate);
      }
      
      if (filters?.partnerId) {
        queryParams.append('filters[partner][id][$eq]', filters.partnerId);
      }
      
      if (filters?.page) {
        queryParams.append('pagination[page]', filters.page.toString());
      }
      
      if (filters?.limit) {
        queryParams.append('pagination[pageSize]', filters.limit.toString());
      }
      
      // Populate relations
      queryParams.append('populate[user]', '*');
      queryParams.append('populate[partner]', '*');
      queryParams.append('populate[service]', '*');
      
      // Sort by booking date (newest first)
      queryParams.append('sort', 'bookingDate:desc');

      const response = await apiClient.get<StrapiBookingsResponse>(
        `/bookings?${queryParams.toString()}`
      );

      const bookings = response.data.map(transformStrapiBooking);
      const pagination = response.meta?.pagination || {};

      return {
        bookings,
        total: pagination.total || bookings.length,
        page: pagination.page || 1,
        totalPages: pagination.pageCount || 1,
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return {
        bookings: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  }

  async getBooking(id: string): Promise<IBooking> {
    try {
      const response = await apiClient.get<StrapiBookingResponse>(
        `/bookings/${id}?populate[user]=*&populate[partner]=*&populate[service]=*`
      );
      
      return transformStrapiBooking(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createBooking(data: CreateBookingData): Promise<IBooking> {
    try {
      // Calculate end time based on service duration
      const service = await apiClient.get(`/services/${data.serviceId}`);
      const duration = service.data?.duration || 60;
      
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const endHour = Math.floor((hours * 60 + minutes + duration) / 60);
      const endMinute = (hours * 60 + minutes + duration) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      const strapiData = {
        data: {
          user: 'me', // Will be set by backend from auth
          partner: parseInt(data.partnerId),
          service: parseInt(data.serviceId),
          bookingDate: data.bookingDate,
          startTime: data.startTime,
          endTime: endTime,
          status: 'PENDING',
          notes: data.notes || '',
          isFreeCheckup: data.isFreeCheckup || false,
          totalAmount: service.data?.price || 0,
          paymentStatus: 'PENDING',
          paymentMethod: 'cash',
        }
      };

      const response = await apiClient.post<StrapiBookingResponse>(
        '/bookings',
        strapiData
      );

      return transformStrapiBooking(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async cancelBooking(id: string, reason?: string): Promise<IBooking> {
    try {
      const response = await apiClient.put<StrapiBookingResponse>(
        `/bookings/${id}`,
        {
          data: {
            status: 'CANCELLED',
            cancellationReason: reason || 'Cancelled by user',
          }
        }
      );
      
      return transformStrapiBooking(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async rescheduleBooking(
    id: string,
    data: {
      bookingDate: string;
      startTime: string;
    }
  ): Promise<IBooking> {
    try {
      // Get existing booking to calculate new end time
      const existingBooking = await this.getBooking(id);
      const service = existingBooking.service;
      const duration = service?.duration || 60;
      
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const endHour = Math.floor((hours * 60 + minutes + duration) / 60);
      const endMinute = (hours * 60 + minutes + duration) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      const response = await apiClient.put<StrapiBookingResponse>(
        `/bookings/${id}`,
        {
          data: {
            bookingDate: data.bookingDate,
            startTime: data.startTime,
            endTime: endTime,
            status: 'PENDING', // Reset to pending after reschedule
          }
        }
      );
      
      return transformStrapiBooking(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAvailableSlots(
    partnerId: string,
    serviceId: string,
    date: string
  ): Promise<string[]> {
    try {
      // This would need a custom controller in Strapi
      // For now, return some default slots
      const slots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      ];
      
      return slots;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  async checkFreeCheckupEligibility(): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    try {
      // Check if user has claimed free checkup this year
      const currentYear = new Date().getFullYear();
      const fromDate = `${currentYear}-01-01`;
      const toDate = `${currentYear}-12-31`;
      
      const { bookings } = await this.getMyBookings({
        fromDate,
        toDate,
        limit: 100,
      });
      
      const freeCheckupsClaimed = bookings.filter(b => b.isFreeCheckup).length;
      
      if (freeCheckupsClaimed > 0) {
        return {
          eligible: false,
          reason: 'You have already claimed your free annual checkup',
        };
      }
      
      return {
        eligible: true,
      };
    } catch (error) {
      console.error('Error checking free checkup eligibility:', error);
      return {
        eligible: false,
        reason: 'Unable to verify eligibility at this time',
      };
    }
  }

  async claimFreeCheckup(): Promise<{ success: boolean; message?: string }> {
    try {
      // This would need a custom controller in Strapi
      // For now, just return success
      const eligibility = await this.checkFreeCheckupEligibility();
      
      if (!eligibility.eligible) {
        return {
          success: false,
          message: eligibility.reason,
        };
      }
      
      return {
        success: true,
        message: 'Free checkup claimed successfully',
      };
    } catch (error) {
      console.error('Error claiming free checkup:', error);
      return {
        success: false,
        message: 'Failed to claim free checkup',
      };
    }
  }
}

export const bookingsService = new BookingsService('/bookings');