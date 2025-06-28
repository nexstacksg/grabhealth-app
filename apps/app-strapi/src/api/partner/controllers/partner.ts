/**
 * partner controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::partner.partner', ({ strapi }) => ({
  // Override default find to add custom filtering
  async find(ctx) {
    try {
      const result = await strapi
        .service('api::partner.partner')
        .findWithFilters(ctx.query);

      // Return in the format that frontend expects
      return {
        data: result
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // Override default findOne to add more details
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      const partner = await strapi
        .service('api::partner.partner')
        .findOneWithDetails(id);

      return { data: partner };
    } catch (error) {
      return ctx.notFound(error.message);
    }
  },

  // Custom methods for the custom routes
  async getServices(ctx) {
    try {
      const { id } = ctx.params;
      
      const services = await strapi
        .service('api::partner.partner')
        .getPartnerServices(id);

      return { data: services };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getAvailableSlots(ctx) {
    try {
      const { id, date } = ctx.params;
      
      const slots = await strapi
        .service('api::partner.partner')
        .calculateAvailableSlots(id, date);

      return { data: slots };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async bookAppointment(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in to book an appointment');
      }

      const booking = await strapi
        .service('api::partner.partner')
        .createBooking(id, user.id, ctx.request.body);

      return { data: booking };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
}));