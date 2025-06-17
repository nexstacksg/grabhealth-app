import { IPartner, IService, ICalendarDay, IAvailableSlot } from '@app/shared-types';

export interface IHealthcarePartnerDataSource {
  getPartners(query: string): Promise<{
    partners: IPartner[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  getPartner(id: string): Promise<IPartner>;
  getPartnerServices(partnerId: string, query: string): Promise<IService[]>;
  getPartnerCalendar(partnerId: string, month: string): Promise<ICalendarDay[]>;
  getAvailableSlots(partnerId: string, date: string): Promise<IAvailableSlot[]>;
}