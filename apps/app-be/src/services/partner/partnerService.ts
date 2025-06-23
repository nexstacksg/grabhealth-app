import {
  IPartner,
  IService,
  IAvailableSlot,
  ICalendarDay,
} from '@app/shared-types';
import prisma from '../../database/client';

interface PartnerFilters {
  city?: string;
  specialization?: string;
  rating?: number;
  search?: string;
  isActive?: boolean;
}

interface ServiceFilters {
  category?: string;
  isActive?: boolean;
}

class PartnerService {
  async getPartners(filters: PartnerFilters, page: number, limit: number) {
    const where: any = {
      isActive: filters.isActive !== false,
    };

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.specialization) {
      where.specializations = { has: filters.specialization };
    }

    if (filters.rating) {
      where.rating = { gte: filters.rating };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rating: 'desc' },
      }),
      prisma.partner.count({ where }),
    ]);

    return {
      partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPartnerById(id: string): Promise<IPartner | null> {
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true },
        },
      },
    });

    if (!partner) return null;

    // Parse operating hours if stored as JSON string
    let operatingHours = {};
    if (partner.operatingHours) {
      try {
        operatingHours = JSON.parse(partner.operatingHours);
      } catch (e) {
        console.error('Failed to parse operating hours:', e);
      }
    }

    return {
      ...partner,
      operatingHours,
    } as IPartner;
  }

  async getPartnerServices(
    partnerId: string,
    filters: ServiceFilters
  ): Promise<IService[]> {
    const where: any = {
      partnerId,
      isActive: filters.isActive !== false,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return services as IService[];
  }

  async getPartnerCalendar(
    partnerId: string,
    year: number,
    month: number
  ): Promise<ICalendarDay[]> {
    // Get partner availability and all days off (we'll filter recurring ones in code)
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        availability: true,
        daysOff: true, // Get all days off, we'll handle filtering in code
      },
    });

    if (!partner) {
      throw new Error('Partner not found');
    }

    // Get all bookings for the month
    const monthBookings = await prisma.booking.findMany({
      where: {
        partnerId,
        bookingDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const calendar: ICalendarDay[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    // Create maps for different types of days off
    const specificDaysOffMap = new Map(
      partner.daysOff
        .filter((d: any) => !d.recurringType || d.recurringType === null)
        .map((d: any) => [d.date.toISOString().split('T')[0], d])
    );

    const weeklyRecurringDaysOff = partner.daysOff.filter(
      (d: any) => d.recurringType === 'WEEKLY'
    );

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      // Check if this day is a day off (specific date or weekly recurring)
      const isSpecificDayOff = specificDaysOffMap.has(dateStr);
      const isWeeklyRecurringDayOff = weeklyRecurringDaysOff.some(
        (d: any) => d.dayOfWeek === dayOfWeek
      );
      const isDayOff = isSpecificDayOff || isWeeklyRecurringDayOff;

      // Check if partner has availability for this day of week
      const dayAvailability = partner.availability.find(
        (a: any) => a.dayOfWeek === dayOfWeek
      );
      const isAvailable = !isDayOff && !!dayAvailability;

      // Get bookings for this specific date
      const dayBookings = monthBookings.filter(
        (booking) => booking.bookingDate.toISOString().split('T')[0] === dateStr
      );

      // Calculate total slots for the day
      let totalSlots = 0;
      if (isAvailable && dayAvailability) {
        const startHour = parseInt(dayAvailability.startTime.split(':')[0]);
        const startMin = parseInt(dayAvailability.startTime.split(':')[1]);
        const endHour = parseInt(dayAvailability.endTime.split(':')[0]);
        const endMin = parseInt(dayAvailability.endTime.split(':')[1]);

        const totalMinutes =
          endHour * 60 + endMin - (startHour * 60 + startMin);
        totalSlots = Math.floor(totalMinutes / dayAvailability.slotDuration);
      }

      const availableSlots = Math.max(0, totalSlots - dayBookings.length);

      calendar.push({
        date: dateStr,
        dayOfWeek,
        isAvailable,
        isDayOff,
        availableSlots,
        totalSlots,
        bookings: dayBookings.map((booking) => ({
          id: booking.id,
          time: booking.startTime,
          customerName: `${booking.user.firstName} ${booking.user.lastName}`,
          serviceName: booking.service.name,
          status: booking.status,
        })),
      });
    }

    return calendar;
  }

  async getAvailableSlots(
    partnerId: string,
    date: Date
  ): Promise<IAvailableSlot[]> {
    const dayOfWeek = date.getDay();

    // Check if it's a day off (specific date or weekly recurring)
    const dayOfWeekForCheck = date.getDay();
    const allDaysOff = await prisma.partnerDaysOff.findMany({
      where: {
        partnerId,
      },
    });

    // Check for specific date day off
    const specificDayOff = allDaysOff.find(
      (d: any) =>
        d.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );

    // Check for weekly recurring day off
    const weeklyDayOff = allDaysOff.find(
      (d: any) =>
        d.recurringType === 'WEEKLY' && d.dayOfWeek === dayOfWeekForCheck
    );

    if (specificDayOff || weeklyDayOff) {
      return [];
    }

    // Get partner availability for this day
    const availability = await prisma.partnerAvailability.findFirst({
      where: {
        partnerId,
        dayOfWeek,
      },
    });

    if (!availability) {
      return [];
    }

    // Get existing bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        partnerId,
        bookingDate: date,
        status: { notIn: ['CANCELLED'] },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate time slots

    const slots: IAvailableSlot[] = [];
    const startHour = parseInt(availability.startTime.split(':')[0]);
    const startMin = parseInt(availability.startTime.split(':')[1]);
    const endHour = parseInt(availability.endTime.split(':')[0]);
    const endMin = parseInt(availability.endTime.split(':')[1]);

    const currentTime = new Date();
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    while (currentTime < endTime) {
      const slotTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

      // Count bookings for this slot
      const bookingsInSlot = bookings.filter(
        (b: any) => b.startTime === slotTime
      ).length;
      const available = bookingsInSlot < availability.maxBookingsPerSlot;

      slots.push({
        date: date.toISOString().split('T')[0],
        time: slotTime,
        available,
        maxBookings: availability.maxBookingsPerSlot,
        currentBookings: bookingsInSlot,
      });

      currentTime.setMinutes(
        currentTime.getMinutes() + availability.slotDuration
      );
    }

    return slots;
  }

  async getDetailedSlotBreakdown(partnerId: string, date: Date) {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    // Check if it's a day off (specific date or weekly recurring)
    const dayOfWeekForCheck = date.getDay();
    const allDaysOff = await prisma.partnerDaysOff.findMany({
      where: {
        partnerId,
      },
    });

    // Check for specific date day off
    const specificDayOff = allDaysOff.find(
      (d: any) =>
        d.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );

    // Check for weekly recurring day off
    const weeklyDayOff = allDaysOff.find(
      (d: any) =>
        d.recurringType === 'WEEKLY' && d.dayOfWeek === dayOfWeekForCheck
    );

    if (specificDayOff || weeklyDayOff) {
      return {
        date: dateStr,
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: [],
        availableTimeSlots: [],
      };
    }

    // Get partner availability for this day
    const availability = await prisma.partnerAvailability.findFirst({
      where: {
        partnerId,
        dayOfWeek,
      },
    });

    if (!availability) {
      return {
        date: dateStr,
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: [],
        availableTimeSlots: [],
      };
    }

    // Get existing bookings for this date with detailed information
    const bookings = await prisma.booking.findMany({
      where: {
        partnerId,
        bookingDate: date,
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Generate all possible time slots
    const allSlots: any[] = [];
    const startHour = parseInt(availability.startTime.split(':')[0]);
    const startMin = parseInt(availability.startTime.split(':')[1]);
    const endHour = parseInt(availability.endTime.split(':')[0]);
    const endMin = parseInt(availability.endTime.split(':')[1]);

    const currentTime = new Date();
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    while (currentTime < endTime) {
      const slotTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

      // Count bookings for this slot
      const bookingsInSlot = bookings.filter((b) => b.startTime === slotTime);
      const available = bookingsInSlot.length < availability.maxBookingsPerSlot;

      allSlots.push({
        time: slotTime,
        duration: availability.slotDuration,
        maxBookings: availability.maxBookingsPerSlot,
        currentBookings: bookingsInSlot.length,
        available,
        bookings: bookingsInSlot,
      });

      currentTime.setMinutes(
        currentTime.getMinutes() + availability.slotDuration
      );
    }

    // Separate booked and available slots
    const bookedSlots = bookings.map((booking) => ({
      id: booking.id,
      time: booking.startTime,
      customerName: `${booking.user.firstName} ${booking.user.lastName}`,
      customerEmail: booking.user.email,
      serviceName: booking.service.name,
      status: booking.status,
      duration: booking.service.duration,
      notes: booking.notes,
      isFreeCheckup: booking.isFreeCheckup,
    }));

    const availableTimeSlots = allSlots
      .filter((slot) => slot.available)
      .map((slot) => ({
        time: slot.time,
        duration: slot.duration,
        maxBookings: slot.maxBookings,
        currentBookings: slot.currentBookings,
      }));

    const totalSlots = allSlots.length;
    const availableSlots = availableTimeSlots.length;

    return {
      date: dateStr,
      totalSlots,
      availableSlots,
      bookedSlots,
      availableTimeSlots,
    };
  }
}

export const partnerService = new PartnerService();
