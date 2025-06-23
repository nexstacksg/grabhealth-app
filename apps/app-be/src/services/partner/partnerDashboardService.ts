import prisma from '../../database/client';
import { randomBytes } from 'crypto';

// Generate a unique ID similar to Prisma's cuid
function generateId(): string {
  return (
    'c' +
    randomBytes(12).toString('base64').replace(/[+/]/g, '').substring(0, 24)
  );
}

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  upcomingToday: number;
  completedToday: number;
  cancelledToday: number;
  totalRevenue: number;
  monthRevenue: number;
}

interface PartnerBookingFilters {
  partnerId: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  serviceId?: string;
}

class PartnerDashboardService {
  async getDashboardStats(partnerId: string): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get today's bookings count by status
    const [
      todayTotal,
      todayUpcoming,
      todayCompleted,
      todayCancelled,
      weekTotal,
      monthTotal,
      totalRevenue,
      monthRevenue,
    ] = await Promise.all([
      // Today's total bookings
      prisma.booking.count({
        where: {
          partnerId,
          bookingDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Today's upcoming bookings
      prisma.booking.count({
        where: {
          partnerId,
          bookingDate: {
            gte: today,
            lt: tomorrow,
          },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),

      // Today's completed bookings
      prisma.booking.count({
        where: {
          partnerId,
          bookingDate: {
            gte: today,
            lt: tomorrow,
          },
          status: 'COMPLETED',
        },
      }),

      // Today's cancelled bookings
      prisma.booking.count({
        where: {
          partnerId,
          bookingDate: {
            gte: today,
            lt: tomorrow,
          },
          status: 'CANCELLED',
        },
      }),

      // Week's bookings
      prisma.booking.count({
        where: {
          partnerId,
          bookingDate: { gte: weekStart },
        },
      }),

      // Month's bookings
      prisma.booking.count({
        where: {
          partnerId,
          bookingDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),

      // Total revenue
      prisma.booking.aggregate({
        where: {
          partnerId,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Month revenue
      prisma.booking.aggregate({
        where: {
          partnerId,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          bookingDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      todayBookings: todayTotal,
      weekBookings: weekTotal,
      monthBookings: monthTotal,
      upcomingToday: todayUpcoming,
      completedToday: todayCompleted,
      cancelledToday: todayCancelled,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      monthRevenue: monthRevenue._sum.totalAmount || 0,
    };
  }

  async getPartnerBookings(
    filters: PartnerBookingFilters,
    page: number,
    limit: number
  ) {
    const where: any = {
      partnerId: filters.partnerId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate) {
      where.bookingDate = { gte: filters.fromDate };
    }

    if (filters.toDate) {
      where.bookingDate = { ...where.bookingDate, lte: filters.toDate };
    }

    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
          },
          service: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTodaySchedule(partnerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        partnerId,
        bookingDate: {
          gte: today,
          lt: tomorrow,
        },
        status: { notIn: ['CANCELLED'] },
      },
      orderBy: { startTime: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        service: true,
      },
    });

    return bookings;
  }

  async updateBookingStatus(
    bookingId: string,
    partnerId: string,
    status: string,
    notes?: string
  ) {
    // First verify the booking belongs to this partner
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        partnerId,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      throw new Error(
        `Invalid status transition from ${booking.status} to ${status}`
      );
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        notes: notes || booking.notes,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: true,
      },
    });

    return updatedBooking;
  }

  async getPartnerServices(partnerId: string) {
    const services = await prisma.service.findMany({
      where: { partnerId },
      orderBy: { name: 'asc' },
    });

    return services;
  }

  async updatePartnerService(serviceId: string, partnerId: string, data: any) {
    // Verify service belongs to partner
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        partnerId,
      },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        category: data.category,
        isActive: data.isActive,
        requiresApproval: data.requiresApproval,
        maxBookingsPerDay: data.maxBookingsPerDay,
        updatedAt: new Date(),
      },
    });

    return updatedService;
  }

  async createPartnerService(partnerId: string, data: any) {
    const service = await prisma.service.create({
      data: {
        partnerId,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        category: data.category,
        isActive: data.isActive ?? true,
        requiresApproval: data.requiresApproval ?? false,
        maxBookingsPerDay: data.maxBookingsPerDay,
      },
    });

    return service;
  }

  async deletePartnerService(serviceId: string, partnerId: string) {
    // Verify service belongs to partner
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        partnerId,
      },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Check if there are any future bookings for this service
    const futureBookings = await prisma.booking.count({
      where: {
        serviceId,
        bookingDate: {
          gte: new Date(),
        },
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
      },
    });

    if (futureBookings > 0) {
      throw new Error('Cannot delete service with active bookings');
    }

    // Soft delete by marking as inactive instead of hard delete
    const deletedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return deletedService;
  }

  async getPartnerAvailability(partnerId: string) {
    const availability = await prisma.partnerAvailability.findMany({
      where: { partnerId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return availability;
  }

  async updatePartnerAvailability(partnerId: string, availability: any[]) {
    // Delete existing availability
    await prisma.partnerAvailability.deleteMany({
      where: { partnerId },
    });

    // Create new availability
    const created = await prisma.partnerAvailability.createMany({
      data: availability.map((slot) => ({
        partnerId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotDuration: slot.slotDuration || 30,
        maxBookingsPerSlot: slot.maxBookingsPerSlot || 1,
      })),
    });

    return created;
  }

  async getPartnerProfile(partnerId: string) {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        _count: {
          select: {
            services: true,
            bookings: true,
          },
        },
      },
    });

    if (!partner) {
      throw new Error('Partner not found');
    }

    return partner;
  }

  async updatePartnerProfile(partnerId: string, data: any) {
    const updatedPartner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        phone: data.phone,
        website: data.website,
        specializations: data.specializations,
        operatingHours: data.operatingHours
          ? JSON.stringify(data.operatingHours)
          : undefined,
        updatedAt: new Date(),
      },
    });

    return updatedPartner;
  }

  async getPartnerDaysOff(partnerId: string) {
    // Use raw query to get all fields including the new ones
    const daysOff = await prisma.$queryRaw`
      SELECT * FROM "PartnerDaysOff"
      WHERE "partnerId" = ${partnerId}
      ORDER BY "date" ASC
    `;

    return daysOff;
  }

  async createPartnerDayOff(partnerId: string, data: any) {
    // For weekly recurring, check if there's already a recurring pattern for this day of week
    if (data.recurringType === 'WEEKLY' && data.dayOfWeek !== undefined) {
      // Check manually for weekly pattern in the results
      const weeklyPatterns = await prisma.$queryRaw`
        SELECT * FROM "PartnerDaysOff"
        WHERE "partnerId" = ${partnerId}
        AND "recurringType" = 'WEEKLY'
        AND "dayOfWeek" = ${data.dayOfWeek}
      `;

      if (Array.isArray(weeklyPatterns) && weeklyPatterns.length > 0) {
        throw new Error(
          `Weekly day off already exists for this day of the week`
        );
      }

      // For weekly recurring, create a pattern entry using raw query
      const dayOff = await prisma.$queryRaw`
        INSERT INTO "PartnerDaysOff" ("id", "partnerId", "date", "reason", "isRecurring", "recurringType", "dayOfWeek", "createdAt")
        VALUES (${generateId()}, ${partnerId}, ${new Date(data.date)}, ${data.reason || null}, ${true}, ${'WEEKLY'}, ${data.dayOfWeek}, ${new Date()})
        RETURNING *
      `;

      return Array.isArray(dayOff) ? dayOff[0] : dayOff;
    }

    // For one-time or annual recurring days off
    const existingDayOff = await prisma.partnerDaysOff.findFirst({
      where: {
        partnerId,
        date: new Date(data.date),
      },
    });

    if (existingDayOff) {
      throw new Error('Day off already exists for this date');
    }

    // Use raw query for creating with new fields
    const dayOff = await prisma.$queryRaw`
      INSERT INTO "PartnerDaysOff" ("id", "partnerId", "date", "reason", "isRecurring", "recurringType", "dayOfWeek", "createdAt")
      VALUES (
        ${generateId()},
        ${partnerId},
        ${new Date(data.date)},
        ${data.reason || null},
        ${data.isRecurring || false},
        ${data.recurringType || null},
        ${data.recurringType === 'ANNUAL' ? new Date(data.date).getDay() : null},
        ${new Date()}
      )
      RETURNING *
    `;

    return Array.isArray(dayOff) ? dayOff[0] : dayOff;
  }

  async deletePartnerDayOff(dayOffId: string, partnerId: string) {
    // Verify the day off belongs to this partner
    const dayOff = await prisma.partnerDaysOff.findFirst({
      where: {
        id: dayOffId,
        partnerId,
      },
    });

    if (!dayOff) {
      throw new Error('Day off not found');
    }

    await prisma.partnerDaysOff.delete({
      where: { id: dayOffId },
    });

    return { success: true };
  }
}

export const partnerDashboardService = new PartnerDashboardService();
