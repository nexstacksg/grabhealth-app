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
    {
      method: 'POST',
      path: '/custom-auth/forgot-password',
      handler: 'custom-auth.forgotPassword',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/custom-auth/validate-reset-code',
      handler: 'custom-auth.validateResetCode',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/custom-auth/reset-password',
      handler: 'custom-auth.resetPassword',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/custom-auth/change-password',
      handler: 'custom-auth.changePassword',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};