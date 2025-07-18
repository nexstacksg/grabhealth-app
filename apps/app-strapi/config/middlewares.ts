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
      headers: [
        'Content-Type',
        'Authorization',
        'X-Frame-Options',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials'
      ],
      origin: [
        'http://localhost:3000', // app-web
        'http://localhost:3001', // app-web alternative port
        'https://localhost:3000', // HTTPS variant
        'https://localhost:3001', // HTTPS variant alternative port
        'https://api.grabhealth.ai', // Production API
        'https://grabhealth.ai', // Production frontend
        // Add production URLs when deployed
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ].filter(Boolean),
      credentials: true, // Allow cookies/credentials
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      maxAge: 31536000,
      expose: [
        'Content-Type',
        'Authorization',
        'X-Frame-Options',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials'
      ],
      preflightContinue: false,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: "256mb", // for form bodies
      jsonLimit: "256mb", // for JSON bodies
      textLimit: "256mb", // for text bodies
      formidable: {
        maxFileSize: 200 * 1024 * 1024, // 200mb in bytes
      }
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
