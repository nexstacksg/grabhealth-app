/**
 * booking controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({
  // Override the find method to filter by current user
  async find(ctx: any) {
    const user = ctx.state.user;
    
    // If user is authenticated, only return their bookings
    if (user) {
      // Initialize query and filters
      if (!ctx.query) {
        ctx.query = {};
      }
      
      const currentFilters = ctx.query.filters as any || {};
      
      // Add user filter
      ctx.query.filters = {
        ...currentFilters,
        user: { id: user.id }
      };
      
      // Ensure we populate the relations
      if (!ctx.query.populate) {
        ctx.query.populate = ['user', 'partner', 'service'];
      }
    }
    
    // Call the default find method with modified query
    const { data, meta } = await super.find(ctx);
    
    return { data, meta };
  }
}));