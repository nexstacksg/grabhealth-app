import { IBooking, ICreateBookingRequest, IFreeCheckupStatus } from '@app/shared-types';
import { BaseApiDataSource } from './BaseApiDataSource';
import { IBookingDataSource } from '../../interfaces/IBookingDataSource';

export class ApiBookingDataSource extends BaseApiDataSource implements IBookingDataSource {
  async createBooking(booking: ICreateBookingRequest): Promise<IBooking> {
    return this.post<IBooking>('/bookings', booking);
  }

  async getBookings(query: string) {
    return this.get<{
      bookings: IBooking[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/bookings?${query}`);
  }

  async getBooking(id: string): Promise<IBooking> {
    return this.get<IBooking>(`/bookings/${id}`);
  }

  async updateBookingStatus(id: string, status: string, cancellationReason?: string): Promise<IBooking> {
    return this.patch<IBooking>(`/bookings/${id}/status`, {
      status,
      cancellationReason
    });
  }

  async getFreeCheckupStatus(userId: string): Promise<IFreeCheckupStatus> {
    return this.get<IFreeCheckupStatus>(`/users/${userId}/free-checkup-status`);
  }

  async claimFreeCheckup(userId: string): Promise<void> {
    await this.post<void>(`/users/${userId}/claim-free-checkup`, {});
  }
}