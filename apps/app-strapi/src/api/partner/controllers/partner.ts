/**
 * partner controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::partner.partner',
  ({ strapi }) => ({
    // Get all partners with filtering and pagination
    async find(ctx) {
      try {
        const { query } = ctx;

        // Build filters
        const filters: any = {};

        if (query.search) {
          filters.$or = [
            { name: { $containsi: query.search } },
            { description: { $containsi: query.search } },
            { city: { $containsi: query.search } },
            { specializations: { $containsi: query.search } },
          ];
        }

        if (query.city) {
          filters.city = { $containsi: query.city };
        }

        if (query.location) {
          filters.city = { $containsi: query.location };
        }

        if (query.specialization) {
          filters.specializations = { $containsi: query.specialization };
        }

        if (query.rating) {
          filters.rating = { $gte: parseFloat(query.rating as string) };
        }

        // Default to active partners only
        if (query.isActive !== 'false') {
          filters.isActive = true;
        }

        // Pagination
        const page = parseInt(query.page as string) || 1;
        const pageSize = parseInt(query.limit as string) || 10;

        const partners = await strapi.entityService.findMany(
          'api::partner.partner',
          {
            filters,
            populate: {
              services: true,
              availabilities: true,
            },
            pagination: {
              page,
              pageSize,
            },
            sort: { name: 'asc' },
          } as any
        );

        const total = await strapi.entityService.count('api::partner.partner', {
          filters,
        } as any);

        return {
          data: {
            partners: partners,
            pagination: {
              page,
              pageSize,
              total,
              totalPages: Math.ceil(total / pageSize),
            },
          },
        };
      } catch (error) {
        console.error('Error fetching partners:', error);
        return ctx.internalServerError('Failed to fetch partners');
      }
    },

    // Get single partner with services
    async findOne(ctx) {
      try {
        const { id } = ctx.params;

        // Check if the id is a documentId (string) or numeric id
        let partner;
        
        // Try to find by documentId first (Strapi v5 format)
        if (isNaN(Number(id))) {
          const partners = await strapi.entityService.findMany(
            'api::partner.partner',
            {
              filters: { documentId: id },
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
          partner = partners?.[0];
        } else {
          // Fallback to numeric ID
          partner = await strapi.entityService.findOne(
            'api::partner.partner',
            id,
            {
              populate: {
                services: {
                  filters: { isActive: true },
                },
                availabilities: true,
                daysOff: true,
              },
            } as any
          );
        }

        if (!partner) {
          return ctx.notFound('Partner not found');
        }

        return { data: partner };
      } catch (error) {
        console.error('Error fetching partner:', error);
        return ctx.internalServerError('Failed to fetch partner');
      }
    },

    // Get partner services
    async getServices(ctx) {
      try {
        const { id } = ctx.params;

        // Verify partner exists
        let partner;
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
          partner = await strapi.entityService.findOne(
            'api::partner.partner',
            id,
            {} as any
          );
        }
        
        if (!partner) {
          return ctx.notFound('Partner not found');
        }

        const services = await strapi.entityService.findMany(
          'api::service.service',
          {
            filters: {
              partner: partner.id, // Use the partner's internal ID
              isActive: true,
            },
            populate: {
              partner: true,
            },
          }
        );

        return { data: services };
      } catch (error) {
        console.error('Error fetching partner services:', error);
        return ctx.internalServerError('Failed to fetch partner services');
      }
    },

    // Get partner availability for a specific date
    async getAvailableSlots(ctx) {
      try {
        const { id, date } = ctx.params;

        // Verify partner exists
        let partner;
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
          partner = await strapi.entityService.findOne(
            'api::partner.partner',
            id,
            {} as any
          );
        }
        
        if (!partner) {
          return ctx.notFound('Partner not found');
        }

        // For now, return mock availability data
        // In a real implementation, this would calculate available slots based on:
        // - Partner availability settings
        // - Existing bookings
        // - Days off
        const mockSlots = [
          {
            date,
            time: '09:00',
            available: true,
            maxBookings: 1,
            currentBookings: 0,
          },
          {
            date,
            time: '10:00',
            available: true,
            maxBookings: 1,
            currentBookings: 0,
          },
          {
            date,
            time: '11:00',
            available: false,
            maxBookings: 1,
            currentBookings: 1,
          },
          {
            date,
            time: '14:00',
            available: true,
            maxBookings: 1,
            currentBookings: 0,
          },
          {
            date,
            time: '15:00',
            available: true,
            maxBookings: 1,
            currentBookings: 0,
          },
          {
            date,
            time: '16:00',
            available: true,
            maxBookings: 1,
            currentBookings: 0,
          },
        ];

        return { data: mockSlots };
      } catch (error) {
        console.error('Error fetching partner availability:', error);
        return ctx.internalServerError('Failed to fetch partner availability');
      }
    },

    // Book appointment with partner
    async bookAppointment(ctx) {
      try {
        const { id } = ctx.params;
        const { serviceId, bookingDate, startTime, notes, isFreeCheckup } =
          ctx.request.body;

        // Manual authentication
        let user = ctx.state.user;

        if (!user) {
          // Try to authenticate manually
          const authorization = ctx.request.header.authorization;

          if (!authorization) {
            return ctx.unauthorized('Authorization header is required');
          }

          const token = authorization.replace(/^Bearer\s+/, '');

          if (!token) {
            return ctx.unauthorized('Token is required');
          }

          try {
            // Verify JWT token
            const decoded =
              await strapi.plugins['users-permissions'].services.jwt.verify(
                token
              );

            // Get user from database
            user = await strapi
              .query('plugin::users-permissions.user')
              .findOne({
                where: { id: decoded.id },
                populate: ['role'],
              });

            if (!user) {
              return ctx.unauthorized('User not found');
            }

            if (!user.confirmed) {
              return ctx.unauthorized('User account is not confirmed');
            }

            if (user.blocked) {
              return ctx.unauthorized('User account is blocked');
            }

            // Set user in context for potential future use
            ctx.state.user = user;
          } catch (jwtError) {
            return ctx.unauthorized('Invalid token');
          }
        }

        // Verify partner exists
        let partner;
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
          partner = await strapi.entityService.findOne(
            'api::partner.partner',
            id,
            {} as any
          );
        }
        
        if (!partner) {
          return ctx.notFound('Partner not found');
        }

        // Verify service exists
        const service = (await strapi.entityService.findOne(
          'api::service.service',
          serviceId,
          {
            populate: {
              partner: true,
            },
          } as any
        )) as any;
        if (
          !service ||
          !service.partner ||
          service.partner.id !== partner.id
        ) {
          return ctx.badRequest('Invalid service for this partner');
        }

        // Calculate end time (assuming 1 hour duration if not specified)
        const duration = service.duration || 60; // minutes
        const startTimeDate = new Date(`${bookingDate}T${startTime}`);
        const endTimeDate = new Date(
          startTimeDate.getTime() + duration * 60000
        );
        const endTime = endTimeDate.toTimeString().slice(0, 5); // HH:MM format

        // Create booking
        const booking = await strapi.entityService.create(
          'api::booking.booking',
          {
            data: {
              user: user.id,
              partner: partner.id, // Use the partner's internal ID
              service: serviceId,
              bookingDate: new Date(bookingDate),
              startTime,
              endTime,
              notes: notes || '',
              isFreeCheckup: isFreeCheckup || false,
              bookingStatus: 'PENDING',
              totalAmount: isFreeCheckup ? 0 : service.price,
              paymentStatus: 'PENDING',
            },
          } as any
        );

        return { data: booking };
      } catch (error) {
        console.error('Error booking appointment:', error);
        return ctx.internalServerError('Failed to book appointment');
      }
    },
  })
);
