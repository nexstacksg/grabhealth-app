import { IBooking, ICreateBookingRequest } from '@app/shared-types';
import { addMinutes } from 'date-fns';
import prisma from '../../database/client';

interface BookingFilters {
  userId: string;
  partnerId?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
}

class BookingService {
  async createBooking(data: ICreateBookingRequest & { userId: string }): Promise<IBooking> {
    // Verify service exists and get duration
    const service = await prisma.service.findUnique({
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
    
    const endDateTime = addMinutes(startDateTime, service.duration);
    const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;

    // Check if slot is available
    const existingBookings = await prisma.booking.count({
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
    const availability = await prisma.partnerAvailability.findFirst({
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

    const dailyBookingsCount = await prisma.booking.count({
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

    if (dailyBookingsCount >= service.maxBookingsPerDay) {
      throw new Error(`This service has reached its daily booking limit of ${service.maxBookingsPerDay} bookings`);
    }

    // Create the booking
    const booking = await prisma.booking.create({
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

    // Parse operatingHours if it's a string
    const transformedBooking = {
      ...booking,
      partner: booking.partner ? {
        ...booking.partner,
        operatingHours: booking.partner.operatingHours ? 
          (typeof booking.partner.operatingHours === 'string' ? 
            JSON.parse(booking.partner.operatingHours) : 
            booking.partner.operatingHours) : 
          undefined
      } : undefined
    };

    return transformedBooking as unknown as IBooking;
  }

  async getBookings(filters: BookingFilters, page: number, limit: number) {
    const where: any = {
      userId: filters.userId
    };

    if (filters.partnerId) {
      where.partnerId = filters.partnerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.bookingDate = {};
      if (filters.fromDate) {
        where.bookingDate.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.bookingDate.lte = filters.toDate;
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { bookingDate: 'desc' },
        include: {
          partner: true,
          service: true
        }
      }),
      prisma.booking.count({ where })
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getBookingById(id: string): Promise<IBooking | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        partner: true,
        service: true
      }
    });

    if (!booking) return null;

    // Parse operatingHours if it's a string
    const transformedBooking = {
      ...booking,
      partner: booking.partner ? {
        ...booking.partner,
        operatingHours: booking.partner.operatingHours ? 
          (typeof booking.partner.operatingHours === 'string' ? 
            JSON.parse(booking.partner.operatingHours) : 
            booking.partner.operatingHours) : 
          undefined
      } : undefined
    };

    return transformedBooking as unknown as IBooking;
  }

  async updateBookingStatus(id: string, status: string, cancellationReason?: string): Promise<IBooking> {
    const updateData: any = { status };

    if (status === 'CANCELLED' && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        partner: true,
        service: true
      }
    });

    // Parse operatingHours if it's a string
    const transformedBooking = {
      ...booking,
      partner: booking.partner ? {
        ...booking.partner,
        operatingHours: booking.partner.operatingHours ? 
          (typeof booking.partner.operatingHours === 'string' ? 
            JSON.parse(booking.partner.operatingHours) : 
            booking.partner.operatingHours) : 
          undefined
      } : undefined
    };

    return transformedBooking as unknown as IBooking;
  }

  // Add alias method for consistency
  async getBooking(id: string): Promise<IBooking | null> {
    return this.getBookingById(id);
  }
}

export { BookingService };
export const bookingService = new BookingService();