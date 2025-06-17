import { IPartner, IService, IAvailableSlot, ICalendarDay } from '@app/shared-types';
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
      isActive: filters.isActive !== false
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
        { address: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rating: 'desc' }
      }),
      prisma.partner.count({ where })
    ]);

    return {
      partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPartnerById(id: string): Promise<IPartner | null> {
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true }
        }
      }
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
      operatingHours
    } as IPartner;
  }

  async getPartnerServices(partnerId: string, filters: ServiceFilters): Promise<IService[]> {
    const where: any = {
      partnerId,
      isActive: filters.isActive !== false
    };

    if (filters.category) {
      where.category = filters.category;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return services as IService[];
  }

  async getPartnerCalendar(partnerId: string, year: number, month: number): Promise<ICalendarDay[]> {
    // Get partner availability
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        availability: true,
        daysOff: {
          where: {
            date: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }
      }
    });

    if (!partner) {
      throw new Error('Partner not found');
    }

    const calendar: ICalendarDay[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysOffMap = new Map(partner.daysOff.map(d => [d.date.toISOString().split('T')[0], d]));

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      // Check if this day is a day off
      const isDayOff = daysOffMap.has(dateStr);

      // Check if partner has availability for this day of week
      const dayAvailability = partner.availability.find(a => a.dayOfWeek === dayOfWeek);
      const isAvailable = !isDayOff && !!dayAvailability;

      // Calculate available slots if the day is available
      let availableSlots = 0;
      let totalSlots = 0;

      if (isAvailable && dayAvailability) {
        const startHour = parseInt(dayAvailability.startTime.split(':')[0]);
        const startMin = parseInt(dayAvailability.startTime.split(':')[1]);
        const endHour = parseInt(dayAvailability.endTime.split(':')[0]);
        const endMin = parseInt(dayAvailability.endTime.split(':')[1]);

        const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        totalSlots = Math.floor(totalMinutes / dayAvailability.slotDuration);

        // Get bookings for this date to calculate available slots
        const bookings = await prisma.booking.count({
          where: {
            partnerId,
            bookingDate: date,
            status: { notIn: ['CANCELLED'] }
          }
        });

        availableSlots = Math.max(0, totalSlots - bookings);
      }

      calendar.push({
        date: dateStr,
        dayOfWeek,
        isAvailable,
        isDayOff,
        availableSlots,
        totalSlots
      });
    }

    return calendar;
  }

  async getAvailableSlots(partnerId: string, date: Date): Promise<IAvailableSlot[]> {
    const dayOfWeek = date.getDay();

    // Check if it's a day off
    const dayOff = await prisma.partnerDaysOff.findFirst({
      where: {
        partnerId,
        date: {
          equals: date
        }
      }
    });

    if (dayOff) {
      return [];
    }

    // Get partner availability for this day
    const availability = await prisma.partnerAvailability.findFirst({
      where: {
        partnerId,
        dayOfWeek
      }
    });

    if (!availability) {
      return [];
    }

    // Get existing bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        partnerId,
        bookingDate: date,
        status: { notIn: ['CANCELLED'] }
      },
      select: {
        startTime: true,
        endTime: true
      }
      
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
      const bookingsInSlot = bookings.filter(b => b.startTime === slotTime).length;
      const available = bookingsInSlot < availability.maxBookingsPerSlot;

      slots.push({
        date: date.toISOString().split('T')[0],
        time: slotTime,
        available,
        maxBookings: availability.maxBookingsPerSlot,
        currentBookings: bookingsInSlot
      });

      currentTime.setMinutes(currentTime.getMinutes() + availability.slotDuration);
    }

    return slots;
  }
}

export const partnerService = new PartnerService();