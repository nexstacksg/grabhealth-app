/**
 * Partners Service - Handles healthcare partners related API calls for Strapi backend
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { IPartner, IService, IAvailableSlot } from '@app/shared-types';

// Note: Using direct API calls to Strapi without ApiResponse wrapper

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

// Transform Strapi partner to our IPartner format
function transformStrapiPartner(strapiPartner: any): IPartner {
  if (!strapiPartner) {
    throw new Error('Invalid partner data: partner is null or undefined');
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

  return {
    id: strapiPartner.id?.toString() || '',
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
            .filter((service: any) => service) // Include all services for now
            .map((service: any) => {
              try {
                return transformStrapiService(service);
              } catch (error) {
                console.warn('Failed to transform service in partner:', error);
                return null;
              }
            })
            .filter(Boolean) // Remove failed transformations
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
    id: strapiService.id?.toString() || '',
    partnerId: strapiService.partner?.id?.toString() || '',
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

class PartnersService extends BaseService {
  async getPartners(filters?: PartnerFilters): Promise<{
    partners: IPartner[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
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

      // Always populate services and availabilities
      queryParams.append('populate', 'services,availabilities');

      const queryString = queryParams.toString();
      const url = `/partners${queryString ? `?${queryString}` : ''}`;

      const strapiData = (await apiClient.get(url)) as any;

      // Handle Strapi response format - check for custom controller response first
      if (strapiData.data && strapiData.data.partners) {
        const partners = strapiData.data.partners
          .filter((partner: any) => partner) // Filter out null/undefined partners
          .map((partner: any) => {
            try {
              return transformStrapiPartner(partner);
            } catch (error) {
              console.warn('Failed to transform partner:', error);
              return null;
            }
          })
          .filter(Boolean); // Remove failed transformations

        const pagination = strapiData.data.pagination || {};

        return {
          partners,
          total: pagination.total || partners.length,
          page: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
        };
      }

      // Handle standard Strapi response format (direct array)
      if (Array.isArray(strapiData.data)) {
        const partners = strapiData.data
          .filter((partner: any) => partner) // Filter out null/undefined partners
          .map((partner: any) => {
            try {
              return transformStrapiPartner(partner);
            } catch (error) {
              console.warn('Failed to transform partner:', error);
              return null;
            }
          })
          .filter(Boolean); // Remove failed transformations

        return {
          partners,
          total: partners.length,
          page: 1,
          totalPages: 1,
        };
      }

      // Handle single partner response wrapped in data
      if (strapiData.data && !Array.isArray(strapiData.data)) {
        try {
          const partner = transformStrapiPartner(strapiData.data);
          return {
            partners: [partner],
            total: 1,
            page: 1,
            totalPages: 1,
          };
        } catch (error) {
          console.warn('Failed to transform single partner:', error);
          return {
            partners: [],
            total: 0,
            page: 1,
            totalPages: 0,
          };
        }
      }

      // Fallback for empty response
      return {
        partners: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    } catch (error) {
      console.error('Error fetching partners:', error);
      return {
        partners: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  }

  async getPartner(id: string): Promise<IPartner> {
    try {
      const strapiData = (await apiClient.get(
        `/partners/${id}?populate=services,availabilities,daysOff`
      )) as any;

      if (strapiData.data) {
        return transformStrapiPartner(strapiData.data);
      }

      throw new Error('Partner not found');
    } catch (error) {
      console.error('Error fetching partner:', error);
      throw error;
    }
  }

  async getPartnerServices(partnerId: string): Promise<IService[]> {
    try {
      const strapiData = (await apiClient.get(
        `/partners/${partnerId}/services`
      )) as any;

      if (strapiData.data) {
        if (Array.isArray(strapiData.data)) {
          return strapiData.data
            .filter((service: any) => service) // Filter out null/undefined services
            .map((service: any) => {
              try {
                return transformStrapiService(service);
              } catch (error) {
                console.warn('Failed to transform service:', error);
                return null;
              }
            })
            .filter(Boolean); // Remove failed transformations
        }
        return [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching partner services:', error);
      return [];
    }
  }

  async getPartnerAvailability(
    partnerId: string,
    _serviceId: string, // Note: serviceId kept for API compatibility but not used in current implementation
    date: string
  ): Promise<IAvailableSlot[]> {
    try {
      const strapiData = (await apiClient.get(
        `/partners/${partnerId}/available-slots/${date}`
      )) as any;

      if (strapiData.data) {
        return Array.isArray(strapiData.data) ? strapiData.data : [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching partner availability:', error);
      return [];
    }
  }

  async bookAppointment(partnerId: string, data: BookingRequest): Promise<any> {
    try {
      const strapiData = (await apiClient.post(
        `/partners/${partnerId}/book`,
        data
      )) as any;

      if (strapiData.data) {
        return strapiData.data;
      }

      return strapiData;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  async getFeaturedPartners(limit: number = 6): Promise<IPartner[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('populate', 'services,availabilities');

      const queryString = queryParams.toString();
      const url = `/partners${queryString ? `?${queryString}` : ''}`;

      const strapiData = (await apiClient.get(url)) as any;

      // Handle custom controller response format
      if (strapiData.data && strapiData.data.partners) {
        return strapiData.data.partners
          .filter((partner: any) => partner)
          .map((partner: any) => {
            try {
              return transformStrapiPartner(partner);
            } catch (error) {
              console.warn('Failed to transform featured partner:', error);
              return null;
            }
          })
          .filter(Boolean)
          .slice(0, limit);
      }

      // Handle standard Strapi response format
      if (Array.isArray(strapiData.data)) {
        return strapiData.data
          .filter((partner: any) => partner)
          .map((partner: any) => {
            try {
              return transformStrapiPartner(partner);
            } catch (error) {
              console.warn('Failed to transform featured partner:', error);
              return null;
            }
          })
          .filter(Boolean)
          .slice(0, limit);
      }

      return [];
    } catch (error) {
      console.error('Error fetching featured partners:', error);
      return [];
    }
  }

  async searchPartners(query: string): Promise<IPartner[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', query);
      queryParams.append('populate', 'services,availabilities');

      const queryString = queryParams.toString();
      const url = `/partners${queryString ? `?${queryString}` : ''}`;

      const strapiData = (await apiClient.get(url)) as any;

      // Handle custom controller response format
      if (strapiData.data && strapiData.data.partners) {
        return strapiData.data.partners
          .filter((partner: any) => partner)
          .map((partner: any) => {
            try {
              return transformStrapiPartner(partner);
            } catch (error) {
              console.warn('Failed to transform search result partner:', error);
              return null;
            }
          })
          .filter(Boolean);
      }

      // Handle standard Strapi response format
      if (Array.isArray(strapiData.data)) {
        return strapiData.data
          .filter((partner: any) => partner)
          .map((partner: any) => {
            try {
              return transformStrapiPartner(partner);
            } catch (error) {
              console.warn('Failed to transform search result partner:', error);
              return null;
            }
          })
          .filter(Boolean);
      }

      return [];
    } catch (error) {
      console.error('Error searching partners:', error);
      return [];
    }
  }
}

export const partnersService = new PartnersService('/partners');
