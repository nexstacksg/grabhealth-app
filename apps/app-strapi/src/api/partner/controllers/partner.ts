/**
 * Refactored partner controller
 */

import { factories } from '@strapi/strapi';
import { handleError, asyncHandler } from '../../../utils/error-handler';

export default factories.createCoreController(
  'api::partner.partner',
  ({ strapi }) => ({
    /**
     * Get all partners with filtering and pagination
     */
    find: asyncHandler(async function(ctx) {
      const result = await strapi
        .service('api::partner.partner')
        .findWithFilters(ctx.query);

      return {
        data: result,
      };
    }),

    /**
     * Get single partner with services
     */
    findOne: asyncHandler(async function(ctx) {
      const { id } = ctx.params;
      
      const partner = await strapi
        .service('api::partner.partner')
        .findOneWithDetails(id);

      return { data: partner };
    }),

    /**
     * Get partner services
     */
    getServices: asyncHandler(async function(ctx) {
      const { id } = ctx.params;
      
      const services = await strapi
        .service('api::partner.partner')
        .getPartnerServices(id);

      return { data: services };
    }),

    /**
     * Get partner availability for a specific date
     */
    getAvailableSlots: asyncHandler(async function(ctx) {
      const { id, date } = ctx.params;
      
      const slots = await strapi
        .service('api::partner.partner')
        .calculateAvailableSlots(id, date);

      return { data: slots };
    }),

    /**
     * Book appointment with partner
     */
    bookAppointment: asyncHandler(async function(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in to book an appointment');
      }

      const booking = await strapi
        .service('api::partner.partner')
        .createBooking(id, user.id, ctx.request.body);

      return { data: booking };
    }),
  })
);