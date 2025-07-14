import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::commission-calculation.commission-calculation', ({ strapi }) => ({
  async calculateForOrder(ctx) {
    const { orderId } = ctx.params;
    
    try {
      const commissionService = strapi.service('api::commission-calculation.commission-calculation');
      const commissions = await commissionService.calculateOrderCommissions(parseInt(orderId));
      
      return {
        data: commissions,
        meta: {
          count: commissions.length
        }
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getUserSummary(ctx) {
    const { userId } = ctx.params;
    const { startDate, endDate, status } = ctx.query;
    
    try {
      const filters: any = {};
      
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = startDate;
        if (endDate) filters.createdAt.$lte = endDate;
      }
      
      if (status) {
        filters.status = status;
      }
      
      const commissionService = strapi.service('api::commission-calculation.commission-calculation');
      const summary = await commissionService.getUserCommissionSummary(parseInt(userId), filters);
      
      return {
        data: summary
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async approveMultiple(ctx) {
    const { commissionIds } = ctx.request.body;
    
    if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
      return ctx.badRequest('Invalid commission IDs');
    }
    
    try {
      const commissionService = strapi.service('api::commission-calculation.commission-calculation');
      const updatedCommissions = await commissionService.approveCommissions(commissionIds);
      
      return {
        data: updatedCommissions,
        meta: {
          count: updatedCommissions.length
        }
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async markAsPaid(ctx) {
    const { commissionIds } = ctx.request.body;
    
    if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
      return ctx.badRequest('Invalid commission IDs');
    }
    
    try {
      const commissionService = strapi.service('api::commission-calculation.commission-calculation');
      const updatedCommissions = await commissionService.markCommissionsAsPaid(commissionIds);
      
      return {
        data: updatedCommissions,
        meta: {
          count: updatedCommissions.length
        }
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}));