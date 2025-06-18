/**
 * Partner Service - Handles all partner related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { ApiResponse, PartnerAuthResult, PartnerInfo } from '@app/shared-types';

class PartnerService extends BaseService {
  async checkPartnerAuth(): Promise<PartnerAuthResult> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/partner/profile');
      
      if (response.success && response.data) {
        return {
          success: true,
          partnerInfo: {
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            isPartner: true,
          },
        };
      } else {
        return {
          success: false,
          error: 'You need to be a partner to access this page',
          shouldRedirect: true,
          redirectPath: '/',
        };
      }
    } catch (error: any) {
      // Handle specific error codes
      if (error.status === 401) {
        return {
          success: false,
          error: 'Please log in as a partner to access this page',
          shouldRedirect: true,
          redirectPath: '/auth/login',
        };
      } else if (error.status === 403) {
        return {
          success: false,
          error: 'You do not have partner privileges',
          shouldRedirect: true,
          redirectPath: '/',
        };
      } else if (error.status === 404) {
        return {
          success: false,
          error: 'Partner service is not available',
          shouldRedirect: false,
        };
      }
      
      return {
        success: false,
        error: 'Failed to verify partner status',
        shouldRedirect: false,
      };
    }
  }

  async getPartnerProfile(): Promise<PartnerInfo | null> {
    const result = await this.checkPartnerAuth();
    return result.success ? result.partnerInfo || null : null;
  }

  async getBookings(params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const queryString = this.buildQueryString(params);
      return await apiClient.get<ApiResponse<any>>(`/partner/bookings${queryString}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.patch<ApiResponse<any>>(
        `/partner/bookings/${bookingId}/status`,
        { status }
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCalendar(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const queryString = this.buildQueryString(params);
      return await apiClient.get<ApiResponse<any>>(`/partner/calendar${queryString}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAvailability(date?: string): Promise<ApiResponse<any>> {
    try {
      const queryString = date ? `?date=${date}` : '';
      return await apiClient.get<ApiResponse<any>>(`/partner/availability${queryString}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateAvailability(data: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post<ApiResponse<any>>('/partner/availability', data);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const partnerService = new PartnerService('/partner');