/**
 * Unified Partner Service
 * 
 * Consolidates functionality from both partner.service.ts and partners.service.ts
 * Provides a single interface for all partner-related operations
 */

import { BaseService } from './base.service';
import { 
  IPartner, 
  IService, 
  IAvailableSlot,
  ApiResponse,
  PartnerAuthResult,
  PartnerInfo 
} from '@app/shared-types';

// Request/Response types
interface PartnerFilters {
  search?: string;
  category?: string;
  location?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

interface BookingRequest {
  serviceId: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
  isFreeCheckup?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Safe JSON parsing helper
const safeJsonParse = (jsonString: string, fallback: any = {}) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

// Transform Strapi partner to our IPartner format
function transformStrapiPartner(strapiPartner: any): IPartner {
  if (!strapiPartner) {
    throw new Error('Invalid partner data: partner is null or undefined');
  }

  return {
    id: strapiPartner.documentId || strapiPartner.id?.toString() || '',
    name: strapiPartner.name || '',
    description: strapiPartner.description || '',
    address: strapiPartner.address || '',
    city: strapiPartner.city || '',
    state: strapiPartner.state || '',
    country: strapiPartner.country || 'Singapore',
    postalCode: strapiPartner.postalCode || '',
    phone: strapiPartner.phone || '',
    email: strapiPartner.email || '',
    website: strapiPartner.website || '',
    imageUrl: strapiPartner.imageUrl || '',
    rating: parseFloat(strapiPartner.rating || 0),
    totalReviews: parseInt(strapiPartner.totalReviews || 0),
    isActive: strapiPartner.isActive ?? true,
    operatingHours: strapiPartner.operatingHours
      ? safeJsonParse(strapiPartner.operatingHours, {})
      : {},
    specializations: Array.isArray(strapiPartner.specializations)
      ? strapiPartner.specializations
      : strapiPartner.specializations
        ? safeJsonParse(strapiPartner.specializations, [])
        : [],
    services:
      strapiPartner.services && Array.isArray(strapiPartner.services)
        ? strapiPartner.services
            .filter((service: any) => service)
            .map((service: any) => {
              try {
                return transformStrapiService(service);
              } catch (error) {
                console.warn('Failed to transform service in partner:', error);
                return null;
              }
            })
            .filter(Boolean)
        : undefined,
    createdAt: new Date(strapiPartner.createdAt || Date.now()),
    updatedAt: new Date(strapiPartner.updatedAt || Date.now()),
  };
}

// Transform Strapi service to our IService format
function transformStrapiService(strapiService: any): IService {
  if (!strapiService) {
    throw new Error('Invalid service data: service is null or undefined');
  }

  return {
    id: strapiService.documentId || strapiService.id?.toString() || '',
    partnerId: strapiService.partner?.documentId || strapiService.partner?.id?.toString() || '',
    partner: strapiService.partner
      ? transformStrapiPartner(strapiService.partner)
      : undefined,
    name: strapiService.name || '',
    description: strapiService.description || '',
    duration: parseInt(strapiService.duration || 0),
    price: parseFloat(strapiService.price || 0),
    category: strapiService.category || '',
    isActive: strapiService.isActive ?? true,
    requiresApproval: strapiService.requiresApproval ?? false,
    maxBookingsPerDay: parseInt(strapiService.maxBookingsPerDay || 10),
    createdAt: new Date(strapiService.createdAt || Date.now()),
    updatedAt: new Date(strapiService.updatedAt || Date.now()),
  };
}

class UnifiedPartnerService extends BaseService {
  // ============ Partner Authentication & Profile ============
  
  async checkPartnerAuth(): Promise<PartnerAuthResult> {
    try {
      const response = await this.api.get<ApiResponse<any>>('/partner/profile');
      
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

  // ============ Partner Listings & Search ============

  async getPartners(filters?: PartnerFilters): Promise<PaginatedResponse<IPartner>> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.search) {
        queryParams.append('search', filters.search);
      }
      if (filters?.category) {
        queryParams.append('category', filters.category);
      }
      if (filters?.location) {
        queryParams.append('location', filters.location);
      }
      if (filters?.rating) {
        queryParams.append('rating', filters.rating.toString());
      }
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      queryParams.append('populate', 'services,availabilities');

      const url = `/partners${this.api.buildQueryString(Object.fromEntries(queryParams))}`;
      const strapiData = await this.api.get(url) as any;

      // Handle different response formats
      if (strapiData.data && strapiData.data.partners) {
        // Custom controller response
        const partners = strapiData.data.partners
          .filter((partner: any) => partner)
          .map((partner: any) => {
            try {
              return transformStrapiPartner(partner);
            } catch (error) {
              console.warn('Failed to transform partner:', error);
              return null;
            }
          })
          .filter(Boolean);

        const pagination = strapiData.data.pagination || {};

        return {
          data: partners,
          total: pagination.total || partners.length,
          page: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
        };
      }

      // Standard Strapi response
      if (Array.isArray(strapiData.data)) {
        const partners = strapiData.data
          .filter((partner: any) => partner)
          .map((partner: any) => {
            try {
              return transformStrapiPartner(partner);
            } catch (error) {
              console.warn('Failed to transform partner:', error);
              return null;
            }
          })
          .filter(Boolean);

        return {
          data: partners,
          total: partners.length,
          page: 1,
          totalPages: 1,
        };
      }

      // Fallback
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    } catch (error) {
      console.error('Error fetching partners:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  }

  async getPartner(id: string): Promise<IPartner> {
    try {
      const strapiData = await this.api.get(
        `/partners/${id}?populate=services,availabilities,daysOff`
      ) as any;

      if (strapiData.data) {
        return transformStrapiPartner(strapiData.data);
      }

      throw new Error('Partner not found');
    } catch (error) {
      console.error('Error fetching partner:', error);
      throw error;
    }
  }

  async getFeaturedPartners(limit: number = 6): Promise<IPartner[]> {
    const result = await this.getPartners({ limit });
    return result.data;
  }

  async searchPartners(query: string): Promise<IPartner[]> {
    const result = await this.getPartners({ search: query });
    return result.data;
  }

  // ============ Partner Services ============

  async getPartnerServices(partnerId: string): Promise<IService[]> {
    try {
      const strapiData = await this.api.get(
        `/partners/${partnerId}/services`
      ) as any;

      if (strapiData.data) {
        if (Array.isArray(strapiData.data)) {
          return strapiData.data
            .filter((service: any) => service)
            .map((service: any) => {
              try {
                return transformStrapiService(service);
              } catch (error) {
                console.warn('Failed to transform service:', error);
                return null;
              }
            })
            .filter(Boolean);
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching partner services:', error);
      return [];
    }
  }

  // ============ Availability & Scheduling ============

  async getPartnerAvailability(
    partnerId: string,
    _serviceId: string,
    date: string
  ): Promise<IAvailableSlot[]> {
    try {
      const strapiData = await this.api.get(
        `/partners/${partnerId}/available-slots/${date}`
      ) as any;

      if (strapiData.data) {
        return Array.isArray(strapiData.data) ? strapiData.data : [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching partner availability:', error);
      return [];
    }
  }

  async getAvailability(date?: string): Promise<ApiResponse<any>> {
    try {
      const queryString = date ? `?date=${date}` : '';
      return await this.api.get<ApiResponse<any>>(`/partner/availability${queryString}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateAvailability(data: any): Promise<ApiResponse<any>> {
    try {
      return await this.api.post<ApiResponse<any>>('/partner/availability', data);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ Bookings ============

  async bookAppointment(partnerId: string, data: BookingRequest): Promise<any> {
    try {
      const strapiData = await this.api.post(
        `/partners/${partnerId}/book`,
        data
      ) as any;

      if (strapiData.data) {
        return strapiData.data;
      }

      return strapiData;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
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
      return await this.api.get<ApiResponse<any>>(`/partner/bookings${queryString}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<any>> {
    try {
      return await this.api.patch<ApiResponse<any>>(
        `/partner/bookings/${bookingId}/status`,
        { status }
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ Calendar ============

  async getCalendar(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const queryString = this.buildQueryString(params);
      return await this.api.get<ApiResponse<any>>(`/partner/calendar${queryString}`);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const partnerService = new UnifiedPartnerService('/partners');