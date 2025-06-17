import { IPartner, IService, ICalendarDay, IAvailableSlot } from '@app/shared-types';
import { BaseApiDataSource } from './BaseApiDataSource';
import { IHealthcarePartnerDataSource } from '../../interfaces/IHealthcarePartnerDataSource';

export class ApiHealthcarePartnerDataSource extends BaseApiDataSource implements IHealthcarePartnerDataSource {
  async getPartners(query: string) {
    return this.get<{
      partners: IPartner[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/partners?${query}`);
  }

  async getPartner(id: string): Promise<IPartner> {
    return this.get<IPartner>(`/partners/${id}`);
  }

  async getPartnerServices(partnerId: string, query: string): Promise<IService[]> {
    return this.get<IService[]>(`/partners/${partnerId}/services?${query}`);
  }

  async getPartnerCalendar(partnerId: string, month: string): Promise<ICalendarDay[]> {
    return this.get<ICalendarDay[]>(`/partners/${partnerId}/calendar/${month}`);
  }

  async getAvailableSlots(partnerId: string, date: string): Promise<IAvailableSlot[]> {
    return this.get<IAvailableSlot[]>(`/partners/${partnerId}/available-slots/${date}`);
  }
}