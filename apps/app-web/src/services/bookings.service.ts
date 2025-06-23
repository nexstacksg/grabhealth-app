/**
 * Bookings Service - Handles all booking related API calls for users
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { IBooking, ApiResponse, IUserPublic } from '@app/shared-types';

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

class BookingsService extends BaseService {
  async getMyBookings(filters?: BookingFilters): Promise<{
    bookings: IBooking[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await apiClient.get<
        ApiResponse<{ bookings: IBooking[]; pagination: any }>
      >(`/bookings${queryString}`);
      const data = this.extractData(response);

      return {
        bookings: data.bookings || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 0,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBooking(id: string): Promise<IBooking> {
    try {
      const response = await apiClient.get<ApiResponse<IBooking>>(
        `/bookings/${id}`
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createBooking(data: CreateBookingData): Promise<IBooking> {
    try {
      const response = await apiClient.post<ApiResponse<IBooking>>(
        '/bookings',
        data
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async cancelBooking(id: string, reason?: string): Promise<IBooking> {
    try {
      const response = await apiClient.patch<ApiResponse<IBooking>>(
        `/bookings/${id}/status`,
        {
          status: 'CANCELLED',
          cancellationReason: reason,
        }
      );
      return this.extractData(response);
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
      const response = await apiClient.post<ApiResponse<IBooking>>(
        `/bookings/${id}/reschedule`,
        data
      );
      return this.extractData(response);
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
      const queryString = this.buildQueryString({ partnerId, serviceId, date });
      const response = await apiClient.get<ApiResponse<string[]>>(
        `/bookings/available-slots${queryString}`
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkFreeCheckupEligibility(): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    try {
      // Get current user's profile first to get their ID
      const profileResponse = await apiClient.get<ApiResponse<IUserPublic>>('/auth/profile');
      const profileData = this.extractData(profileResponse);
      const userId = profileData?.id;

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await apiClient.get<
        ApiResponse<{ eligible: boolean; reason?: string }>
      >(`/users/${userId}/free-checkup-status`);
      return this.extractData(response);
    } catch (error) {
      // If it's a 500 error, it might be because the table doesn't exist
      // Return a default response to avoid breaking the UI
      if ((error as any)?.status === 500) {
        return {
          eligible: false,
          reason: 'Free checkup system is currently unavailable',
        };
      }
      this.handleError(error);
    }
  }

  async claimFreeCheckup(): Promise<{ success: boolean; message?: string }> {
    try {
      // Get current user's profile first to get their ID
      const profileResponse = await apiClient.get<ApiResponse<IUserPublic>>('/auth/profile');
      const profileData = this.extractData(profileResponse);
      const userId = profileData?.id;

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await apiClient.post<
        ApiResponse<{ success: boolean; message?: string }>
      >(`/users/${userId}/claim-free-checkup`, {});
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const bookingsService = new BookingsService('/bookings');
