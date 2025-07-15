export default {
  async afterUpdate(event) {
    const { result, params } = event;
    
    if (params.data.orderStatus === 'PROCESSING' && params.data.paymentStatus === 'PAID') {
      const previousOrder = await strapi.entityService.findOne('api::order.order', result.id);
      
      if (!previousOrder || previousOrder.orderStatus !== 'PROCESSING' || previousOrder.paymentStatus !== 'PAID') {
        try {
          const commissionService = strapi.service('api::commission-calculation.commission-calculation');
          await commissionService.calculateOrderCommissions(result.id);
          strapi.log.info(`Commissions calculated for order ${result.id}`);
        } catch (error) {
          strapi.log.error(`Failed to calculate commissions for order ${result.id}: ${error.message}`);
        }
      }
    }
  }
};