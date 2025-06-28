export default {
  routes: [
    {
      method: 'GET',
      path: '/partners/:id/services',
      handler: 'partner.getServices',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/partners/:id/available-slots/:date',
      handler: 'partner.getAvailableSlots',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/partners/:id/book',
      handler: 'partner.bookAppointment',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};