import { IBooking, ICreateBookingRequest, IFreeCheckupStatus } from '@app/shared-types';
import { IBookingDataSource } from '../interfaces/IBookingDataSource';
import { BaseDataSource } from './BaseDataSource';
import { PrismaClient } from '@prisma/client';

export class BookingDataSource extends BaseDataSource implements IBookingDataSource {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async createBooking(data: ICreateBookingRequest & { userId: string }): Promise<IBooking> {
    try {
      // Verify service exists and get duration
      const service = await this.prisma.service.findUnique({
        where: { id: data.serviceId },
        include: { partner: true }
      });

      if (!service) {
        throw new Error('Service not found');
      }

      if (service.partnerId !== data.partnerId) {
        throw new Error('Service does not belong to the specified partner');
      }

      // Calculate end time based on service duration
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const startDateTime = new Date(data.bookingDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      // For this example, assuming 60 minutes duration if not specified
      const duration = service.duration || 60;
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;

      // Check availability
      await this.checkAvailability(data, service);

      // Create the booking
      const booking = await this.prisma.booking.create({
        data: {
          userId: data.userId,
          partnerId: data.partnerId,
          serviceId: data.serviceId,
          bookingDate: new Date(data.bookingDate),
          startTime: data.startTime,
          endTime,
          status: 'PENDING',
          notes: data.notes,
          isFreeCheckup: data.isFreeCheckup || false,
          totalAmount: service.price,
          paymentStatus: 'PENDING',
          paymentMethod: data.paymentMethod
        },
        include: {
          user: true,
          partner: true,
          service: true
        }
      });

      return this.transformBooking(booking);
    } catch (error) {
      this.handleError(error, 'create booking');
    }
  }

  async getBookings(query: string): Promise<{
    bookings: IBooking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const searchParams = new URLSearchParams(query);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      
      const where = this.buildBookingFilters(searchParams);

      const [bookings, total] = await Promise.all([
        this.prisma.booking.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { bookingDate: 'desc' },
          include: {
            user: true,
            partner: true,
            service: true
          }
        }),
        this.prisma.booking.count({ where })
      ]);

      return {
        bookings: bookings.map(this.transformBooking.bind(this)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'get bookings');
    }
  }

  async getBooking(id: string): Promise<IBooking> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          partner: true,
          service: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      return this.transformBooking(booking);
    } catch (error) {
      this.handleError(error, 'get booking');
    }
  }

  async updateBookingStatus(id: string, status: string, cancellationReason?: string): Promise<IBooking> {
    try {
      const updateData: any = { status };

      if (status === 'CANCELLED' && cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }

      const booking = await this.prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          partner: true,
          service: true
        }
      });

      return this.transformBooking(booking);
    } catch (error) {
      this.handleError(error, 'update booking status');
    }
  }

  async getFreeCheckupStatus(userId: string): Promise<IFreeCheckupStatus> {
    try {
      const activeClaim = await this.prisma.freeCheckupClaim.findFirst({
        where: {
          userId,
          status: 'ACTIVE'
        }
      });

      const hasUsedFreeCheckup = await this.prisma.booking.count({
        where: {
          userId,
          isFreeCheckup: true,
          status: {
            notIn: ['CANCELLED']
          }
        }
      }) > 0;

      return {
        eligible: !hasUsedFreeCheckup,
        hasClaim: !!activeClaim,
        claim: activeClaim || undefined,
        reason: hasUsedFreeCheckup ? 'Free checkup already used' : undefined
      };
    } catch (error) {
      this.handleError(error, 'get free checkup status');
    }
  }

  async claimFreeCheckup(userId: string): Promise<void> {
    try {
      const freeCheckupStatus = await this.getFreeCheckupStatus(userId);
      
      if (!freeCheckupStatus.eligible) {
        throw new Error(freeCheckupStatus.reason || 'Not eligible for free checkup');
      }

      if (freeCheckupStatus.hasClaim) {
        throw new Error('Free checkup claim already exists');
      }

      // Create a new free checkup claim
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months validity

      await this.prisma.freeCheckupClaim.create({
        data: {
          userId,
          claimDate: new Date(),
          expiryDate,
          status: 'ACTIVE'
        }
      });
    } catch (error) {
      this.handleError(error, 'claim free checkup');
    }
  }

  private async checkAvailability(data: ICreateBookingRequest & { userId: string }, service: any): Promise<void> {
    // Check if slot is available
    const existingBookings = await this.prisma.booking.count({
      where: {
        partnerId: data.partnerId,
        bookingDate: new Date(data.bookingDate),
        startTime: data.startTime,
        status: {
          notIn: ['CANCELLED']
        }
      }
    });

    // Get partner availability for this day
    const dayOfWeek = new Date(data.bookingDate).getDay();
    const availability = await this.prisma.partnerAvailability.findFirst({
      where: {
        partnerId: data.partnerId,
        dayOfWeek
      }
    });

    if (availability && existingBookings >= availability.maxBookingsPerSlot) {
      throw new Error('Time slot not available');
    }

    // Check daily booking limit for the service
    const bookingDate = new Date(data.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const dailyBookingsCount = await this.prisma.booking.count({
      where: {
        serviceId: data.serviceId,
        bookingDate: {
          gte: bookingDate,
          lt: nextDay
        },
        status: {
          notIn: ['CANCELLED']
        }
      }
    });

    const maxBookingsPerDay = service.maxBookingsPerDay || 10; // Default fallback
    if (dailyBookingsCount >= maxBookingsPerDay) {
      throw new Error(`This service has reached its daily booking limit of ${maxBookingsPerDay} bookings`);
    }
  }

  private buildBookingFilters(searchParams: URLSearchParams): any {
    const where: any = {};
    
    if (searchParams.get('userId')) {
      where.userId = searchParams.get('userId');
    }
    
    if (searchParams.get('partnerId')) {
      where.partnerId = searchParams.get('partnerId');
    }
    
    if (searchParams.get('status')) {
      where.status = searchParams.get('status');
    }
    
    if (searchParams.get('fromDate') || searchParams.get('toDate')) {
      where.bookingDate = {};
      if (searchParams.get('fromDate')) {
        where.bookingDate.gte = new Date(searchParams.get('fromDate')!);
      }
      if (searchParams.get('toDate')) {
        where.bookingDate.lte = new Date(searchParams.get('toDate')!);
      }
    }
    
    if (searchParams.get('isFreeCheckup')) {
      where.isFreeCheckup = searchParams.get('isFreeCheckup') === 'true';
    }

    return where;
  }

  private transformBooking(booking: any): IBooking {
    const transformed = this.transformDates(booking);
    const withJsonParsed = this.parseJsonFields(transformed, ['operatingHours']);
    
    return {
      ...withJsonParsed,
      partner: withJsonParsed.partner ? {
        ...withJsonParsed.partner,
        operatingHours: withJsonParsed.partner.operatingHours ? 
          (typeof withJsonParsed.partner.operatingHours === 'string' ? 
            JSON.parse(withJsonParsed.partner.operatingHours) : 
            withJsonParsed.partner.operatingHours) : 
          undefined
      } : undefined
    } as IBooking;
  }
}