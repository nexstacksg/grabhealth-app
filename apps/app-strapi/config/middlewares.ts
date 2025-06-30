export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', '*.digitaloceanspaces.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', '*.digitaloceanspaces.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      headers: '*',
      origin: [
        'http://localhost:3000', // app-web
        'https://localhost:3000', // HTTPS variant
        'https://api.grabhealth.ai', // Production API
        'https://grabhealth.ai', // Production frontend
        // Add production URLs when deployed
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ].filter(Boolean),
      credentials: true, // Allow cookies/credentials
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      maxAge: 31536000,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
