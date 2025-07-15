import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::commission-template.commission-template', ({ strapi }) => ({
  async getActiveTemplates(ctx) {
    try {
      const templates = await strapi.entityService.findMany('api::commission-template.commission-template', {
        filters: {
          productCommissionStatus: 'active'
        },
        populate: ['details'],
        sort: { templateName: 'asc' }
      });
      
      return {
        data: templates
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}));