export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/:id/send-confirmation-email',
      handler: 'order.sendOrderConfirmationEmail',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
  
};