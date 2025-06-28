import { factories } from '@strapi/strapi';
import { 
  ApplicationError, 
  ValidationError, 
  NotFoundError,
  validateRequired,
  validateFutureDate,
  validateTimeFormat,
  parsePagination
} from '../../../utils/error-handler';

export default factories.createCoreService('api::partner.partner', ({ strapi }) => ({
  /**
   * Build search filters from query parameters
   */
  buildSearchFilters(query: any) {
    const filters: any = {};

    if (query.search) {
      filters.$or = [
        { name: { $containsi: query.search } },
        { description: { $containsi: query.search } },
        { city: { $containsi: query.search } },
        { specializations: { $containsi: query.search } },
      ];
    }

    if (query.city || query.location) {
      filters.city = { $containsi: query.city || query.location };
    }

    if (query.specialization) {
      filters.specializations = { $containsi: query.specialization };
    }

    if (query.rating) {
      const rating = parseFloat(query.rating);
      if (!isNaN(rating)) {
        filters.rating = { $gte: rating };
      }
    }

    // Default to active partners only
    if (query.isActive !== 'false') {
      filters.isActive = true;
    }

    return filters;
  },

  /**
   * Find partner by ID (handles both documentId and numeric ID)
   */
  async findPartnerById(id: string | number) {
    let partner;
    
    // Try to find by documentId first (Strapi v5 format)
    if (isNaN(Number(id))) {
      const partners = await strapi.entityService.findMany(
        'api::partner.partner',
        {
          filters: { documentId: id },
          limit: 1,
        } as any
      );
      partner = partners?.[0];
    } else {
      // Fallback to numeric ID
      partner = await strapi.entityService.findOne(
        'api::partner.partner',
        id,
        {} as any
      );
    }

    if (!partner) {
      throw new NotFoundError('Partner not found');
    }

    return partner;
  },

  /**
   * Get paginated list of partners with filters
   */
  async findWithFilters(query: any) {
    const filters = this.buildSearchFilters(query);
    const { page, pageSize } = parsePagination({ query });

    const partners = await strapi.entityService.findMany(
      'api::partner.partner',
      {
        filters,
        populate: {
          services: {
            fields: ['id', 'name', 'price', 'duration'],
            filters: { isActive: true },
          },
          availabilities: {
            fields: ['dayOfWeek', 'startTime', 'endTime', 'slotDuration'],
          },
        },
        pagination: { page, pageSize },
        sort: { name: 'asc' },
      } as any
    );

    const total = await strapi.entityService.count('api::partner.partner', {
      filters,
    } as any);

    return {
      partners,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  /**
   * Get partner with full details
   */
  async findOneWithDetails(id: string | number) {
    const partner = await this.findPartnerById(id);
    
    // Fetch with full relations - use documentId for v5
    const partners = await strapi.entityService.findMany(
      'api::partner.partner',
      {
        filters: { documentId: partner.documentId },
        populate: {
          services: {
            filters: { isActive: true },
          },
          availabilities: true,
          daysOff: true,
        },
        limit: 1,
      } as any
    );

    return partners?.[0] || partner;
  },

  /**
   * Get partner's services
   */
  async getPartnerServices(partnerId: string | number) {
    const partner = await this.findPartnerById(partnerId);

    const services = await strapi.entityService.findMany(
      'api::service.service',
      {
        filters: {
          partner: partner.id,
          isActive: true,
        },
        populate: {
          partner: {
            fields: ['id', 'name'],
          },
        },
      }
    );

    return services;
  },

  /**
   * Calculate available slots for a partner on a specific date
   */
  async calculateAvailableSlots(partnerId: string | number, date: string) {
    // Validate date
    validateFutureDate(date);
    
    const partner = await this.findPartnerById(partnerId);
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Get partner's availability for this day
    const availabilities = await strapi.entityService.findMany(
      'api::partner-availability.partner-availability',
      {
        filters: {
          partner: partner.id,
          dayOfWeek: dayOfWeek
        },
      } as any
    );

    if (!availabilities || availabilities.length === 0) {
      return []; // Partner doesn't work on this day
    }

    // Check if partner has day off
    const daysOff = await strapi.entityService.findMany(
      'api::partner-days-off.partner-days-off',
      {
        filters: {
          partner: partner.id,
          $or: [
            { date: requestedDate },
            {
              $and: [
                { isRecurring: true },
                { dayOfWeek: dayOfWeek },
              ],
            },
          ],
        },
      }
    );

    if (daysOff && daysOff.length > 0) {
      return []; // Partner has day off
    }

    // Get existing bookings for this date
    const existingBookings = await strapi.entityService.findMany(
      'api::booking.booking',
      {
        filters: {
          partner: partner.id,
          bookingDate: requestedDate,
          bookingStatus: { $ne: 'CANCELLED' },
        },
        fields: ['startTime', 'endTime'],
      }
    );

    // Generate available slots
    const slots = [];
    
    for (const availability of availabilities) {
      const slotDuration = availability.slotDuration || 60; // Default 60 minutes
      const startTime = this.parseTimeToMinutes(availability.startTime);
      const endTime = this.parseTimeToMinutes(availability.endTime);
      
      for (let time = startTime; time < endTime; time += slotDuration) {
        const slotStartTime = this.minutesToTimeString(time);
        const slotEndTime = this.minutesToTimeString(time + slotDuration);
        
        // Check if slot conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          const bookingStart = this.parseTimeToMinutes(String(booking.startTime));
          const bookingEnd = this.parseTimeToMinutes(String(booking.endTime));
          return (time < bookingEnd && time + slotDuration > bookingStart);
        });

        // Count current bookings for this slot
        const currentBookings = existingBookings.filter(booking => {
          const bookingStart = this.parseTimeToMinutes(String(booking.startTime));
          return bookingStart === time;
        }).length;

        slots.push({
          date,
          time: slotStartTime,
          available: !hasConflict && currentBookings < (availability.maxBookingsPerSlot || 1),
          maxBookings: availability.maxBookingsPerSlot || 1,
          currentBookings: currentBookings,
        });
      }
    }

    return slots;
  },

  /**
   * Create a booking for a partner
   */
  async createBooking(partnerId: string | number, userId: number, bookingData: any) {
    // Validate required fields
    validateRequired(bookingData, ['serviceId', 'bookingDate', 'startTime']);
    validateFutureDate(bookingData.bookingDate);
    // Skip time format validation since we'll convert it anyway

    const partner = await this.findPartnerById(partnerId);

    // Verify service belongs to partner - handle documentId vs numeric ID
    let service;
    
    // Try to find by documentId first (Strapi v5 format)
    if (isNaN(Number(bookingData.serviceId))) {
      const services = await strapi.entityService.findMany(
        'api::service.service',
        {
          filters: { documentId: bookingData.serviceId },
          populate: { partner: true },
          limit: 1,
        } as any
      );
      service = services?.[0];
    } else {
      // Fallback to numeric ID
      service = await strapi.entityService.findOne(
        'api::service.service',
        bookingData.serviceId,
        {
          populate: { partner: true },
        } as any
      );
    }

    if (!service || !service.partner || service.partner.id !== partner.id) {
      throw new ValidationError('Invalid service for this partner');
    }

    // Calculate end time
    const duration = service.duration || 60; // minutes
    const startTimeMinutes = this.parseTimeToMinutes(bookingData.startTime);
    const endTimeMinutes = startTimeMinutes + duration;
    const endTime = this.minutesToTimeString(endTimeMinutes);

    // Check for booking conflicts
    const hasConflict = await this.checkBookingConflict(
      partner.id,
      bookingData.bookingDate,
      bookingData.startTime,
      endTime
    );

    if (hasConflict) {
      throw new ValidationError('This time slot is already booked');
    }

    // Generate booking number
    const bookingNumber = await this.generateBookingNumber();

    // Create booking in a transaction
    const booking = await strapi.db.transaction(async () => {
      return await strapi.entityService.create(
        'api::booking.booking',
        {
          data: {
            bookingNumber,
            user: userId,
            partner: partner.id,
            service: service.id, // Use the numeric ID from the found service
            bookingDate: new Date(bookingData.bookingDate),
            startTime: `${bookingData.startTime}:00.000`, // Convert HH:MM to HH:mm:ss.SSS
            endTime: `${endTime}:00.000`, // Convert HH:MM to HH:mm:ss.SSS
            notes: bookingData.notes || '',
            isFreeCheckup: bookingData.isFreeCheckup || false,
            bookingStatus: 'PENDING',
            totalAmount: bookingData.isFreeCheckup ? 0 : service.price,
            paymentStatus: 'PENDING',
          },
        } as any
      );
    });

    // TODO: Send confirmation email
    // await this.sendBookingConfirmation(booking);

    return booking;
  },

  /**
   * Check if there's a booking conflict
   */
  async checkBookingConflict(
    partnerId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const bookingDate = new Date(date);
    const startMinutes = this.parseTimeToMinutes(startTime);
    const endMinutes = this.parseTimeToMinutes(endTime);

    const conflictingBookings = await strapi.entityService.findMany(
      'api::booking.booking',
      {
        filters: {
          partner: { id: partnerId },
          bookingDate: bookingDate,
          bookingStatus: { $ne: 'CANCELLED' },
        },
        fields: ['startTime', 'endTime'],
      }
    );

    return conflictingBookings.some(booking => {
      const bookingStart = this.parseTimeToMinutes(String(booking.startTime));
      const bookingEnd = this.parseTimeToMinutes(String(booking.endTime));
      return (startMinutes < bookingEnd && endMinutes > bookingStart);
    });
  },

  /**
   * Generate unique booking number
   */
  async generateBookingNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get today's booking count
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const todayCount = await strapi.entityService.count('api::booking.booking', {
      filters: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    } as any);

    const sequence = (todayCount + 1).toString().padStart(4, '0');
    return `BK${year}${month}${day}${sequence}`;
  },

  /**
   * Helper: Convert time string (HH:MM) to minutes
   */
  parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  /**
   * Helper: Convert minutes to time string (HH:MM)
   */
  minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },
}));