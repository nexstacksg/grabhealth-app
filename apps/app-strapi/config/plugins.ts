module.exports = ({ env }) => {
  // Debug environment variables
  console.log('MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? 'exists' : 'missing');
  console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN ? 'exists' : 'missing');
  
  return {
    email: {
      config: {
        provider: '@strapi/provider-email-mailgun',
        providerOptions: {
          key: process.env.MAILGUN_API_KEY, // Changed from apiKey to key as required by the provider
          domain: process.env.MAILGUN_DOMAIN,
          host: process.env.MAILGUN_HOST || 'api.mailgun.net', // optional
        },
        settings: {
          defaultFrom: env('MAILGUN_FROM_EMAIL', 'noreply@example.com'),
          defaultReplyTo: env('MAILGUN_FROM_EMAIL', 'noreply@example.com'),
        },
      },
    },
    graphql: {
      config: {
        endpoint: '/graphql',
        shadowCRUD: true,
        playgroundAlways: true,
        amountLimit: 100,
        apolloServer: {
          tracing: false,
        },
      },
    },
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          s3Options: {
            credentials: {
              accessKeyId: env('DO_SPACE_ACCESS_KEY'),
              secretAccessKey: env('DO_SPACE_SECRET_KEY'),
            },
            endpoint: env('DO_SPACE_ENDPOINT'),
            region: env('DO_SPACE_REGION'),
            forcePathStyle: true, // Required for DigitalOcean Spaces
            params: {
              Bucket: env('DO_SPACE_BUCKET'),
            },
          },
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};
