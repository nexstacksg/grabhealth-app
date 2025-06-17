import { 
  IBooking, 
  ICreateBookingRequest,
  IBookingFilter,
  IFreeCheckupStatus
} from '@app/shared-types';
import { IBookingDataSource } from '../interfaces/IBookingDataSource';

export interface BookingServiceOptions {
  dataSource: IBookingDataSource;
}

export class BookingService {
  private dataSource: IBookingDataSource;

  constructor(options: BookingServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async createBooking(booking: ICreateBookingRequest): Promise<IBooking> {
    return this.dataSource.createBooking(booking);
  }

  async getBookings(filters?: IBookingFilter, page = 1, limit = 10) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.partnerId) queryParams.append('partnerId', filters.partnerId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate.toISOString());
      if (filters.toDate) queryParams.append('toDate', filters.toDate.toISOString());
      if (filters.isFreeCheckup !== undefined) queryParams.append('isFreeCheckup', filters.isFreeCheckup.toString());
    }
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    return this.dataSource.getBookings(queryParams.toString());
  }

  async getBooking(id: string): Promise<IBooking> {
    return this.dataSource.getBooking(id);
  }

  async updateBookingStatus(id: string, status: string, cancellationReason?: string): Promise<IBooking> {
    return this.dataSource.updateBookingStatus(id, status, cancellationReason);
  }

  async getFreeCheckupStatus(userId: string): Promise<IFreeCheckupStatus> {
    return this.dataSource.getFreeCheckupStatus(userId);
  }

  async claimFreeCheckup(userId: string): Promise<void> {
    return this.dataSource.claimFreeCheckup(userId);
  }
}