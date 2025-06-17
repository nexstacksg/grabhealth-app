import { IBooking, ICreateBookingRequest, IFreeCheckupStatus } from '@app/shared-types';

export interface IBookingDataSource {
  createBooking(booking: ICreateBookingRequest): Promise<IBooking>;
  getBookings(query: string): Promise<{
    bookings: IBooking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  getBooking(id: string): Promise<IBooking>;
  updateBookingStatus(id: string, status: string, cancellationReason?: string): Promise<IBooking>;
  getFreeCheckupStatus(userId: string): Promise<IFreeCheckupStatus>;
  claimFreeCheckup(userId: string): Promise<void>;
}