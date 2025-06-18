/**
 * Partners Service - Handles healthcare partners related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { IPartner, IService, ApiResponse } from '@app/shared-types';

interface PartnerFilters {
  search?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
}

interface PartnerAvailability {
  date: string;
  slots: string[];
}

interface BookingRequest {
  serviceId: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
  isFreeCheckup?: boolean;
}

class PartnersService extends BaseService {
  async getPartners(filters?: PartnerFilters): Promise<{ 
    partners: IPartner[]; 
    total: number; 
    page: number; 
    totalPages: number 
  }> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await apiClient.get<ApiResponse<{ partners: IPartner[]; pagination: any }>>(`/partners${queryString}`);
      const data = this.extractData(response);
      
      return {
        partners: data.partners || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 0,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPartner(id: string): Promise<IPartner> {
    try {
      const response = await apiClient.get<ApiResponse<IPartner>>(`/partners/${id}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPartnerServices(partnerId: string): Promise<IService[]> {
    try {
      const response = await apiClient.get<ApiResponse<IService[]>>(`/partners/${partnerId}/services`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPartnerAvailability(partnerId: string, serviceId: string, date: string): Promise<PartnerAvailability> {
    try {
      const queryString = this.buildQueryString({ serviceId, date });
      const response = await apiClient.get<ApiResponse<PartnerAvailability>>(`/partners/${partnerId}/availability${queryString}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async bookAppointment(partnerId: string, data: BookingRequest): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>(`/partners/${partnerId}/book`, data);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFeaturedPartners(limit: number = 6): Promise<IPartner[]> {
    try {
      const queryString = this.buildQueryString({ featured: true, limit });
      const response = await apiClient.get<ApiResponse<IPartner[]>>(`/partners${queryString}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchPartners(query: string): Promise<IPartner[]> {
    try {
      const queryString = this.buildQueryString({ search: query });
      const response = await apiClient.get<ApiResponse<IPartner[]>>(`/partners/search${queryString}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const partnersService = new PartnersService('/partners');