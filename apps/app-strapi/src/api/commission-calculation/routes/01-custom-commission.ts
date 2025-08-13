export default {
  routes: [
    {
      method: 'POST',
      path: '/commissions/calculate/:orderId',
      handler: 'commission-calculation.calculateForOrder',
      config: {
        policies: ['api::commission-calculation.is-admin-or-owner'],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/commissions/user/:userId/summary',
      handler: 'commission-calculation.getUserSummary',
      config: {
        policies: ['api::commission-calculation.is-admin-or-owner'],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/commissions/approve',
      handler: 'commission-calculation.approveMultiple',
      config: {
        policies: ['api::commission-calculation.is-admin-or-owner'],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/commissions/mark-paid',
      handler: 'commission-calculation.markAsPaid',
      config: {
        policies: ['api::commission-calculation.is-admin-or-owner'],
        middlewares: []
      }
    }
  ]
};