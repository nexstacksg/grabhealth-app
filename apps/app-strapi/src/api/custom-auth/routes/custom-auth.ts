export default {
  routes: [
    {
      method: 'POST',
      path: '/custom-auth/register',
      handler: 'custom-auth.register',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/custom-auth/verify-email',
      handler: 'custom-auth.verifyEmail',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/custom-auth/resend-code',
      handler: 'custom-auth.resendCode',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};