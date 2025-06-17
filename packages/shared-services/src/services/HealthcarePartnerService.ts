import { 
  IPartner, 
  IService, 
  IPartnerFilter,
  ICalendarDay,
  IAvailableSlot
} from '@app/shared-types';
import { IHealthcarePartnerDataSource } from '../interfaces/IHealthcarePartnerDataSource';

export interface HealthcarePartnerServiceOptions {
  dataSource: IHealthcarePartnerDataSource;
}

export class HealthcarePartnerService {
  private dataSource: IHealthcarePartnerDataSource;

  constructor(options: HealthcarePartnerServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async getPartners(filters?: IPartnerFilter, page = 1, limit = 10) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.specialization) queryParams.append('specialization', filters.specialization);
      if (filters.rating !== undefined) queryParams.append('rating', filters.rating.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    }
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    return this.dataSource.getPartners(queryParams.toString());
  }

  async getPartner(id: string): Promise<IPartner> {
    return this.dataSource.getPartner(id);
  }

  async getPartnerServices(partnerId: string, filters?: { category?: string; isActive?: boolean }): Promise<IService[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    }

    return this.dataSource.getPartnerServices(partnerId, queryParams.toString());
  }

  async getPartnerCalendar(partnerId: string, month: string): Promise<ICalendarDay[]> {
    return this.dataSource.getPartnerCalendar(partnerId, month);
  }

  async getAvailableSlots(partnerId: string, date: string): Promise<IAvailableSlot[]> {
    return this.dataSource.getAvailableSlots(partnerId, date);
  }
}