module.exports = ({ env }) => {
  // Debug environment variables
  console.log('Email Configuration Debug:');
  console.log(
    'MAILGUN_API_KEY:',
    process.env.MAILGUN_API_KEY ? 'exists' : 'missing'
  );
  console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN);
  console.log('MAILGUN_FROM_EMAIL:', process.env.MAILGUN_FROM_EMAIL);

  return {
    email: {
      config: {
        provider: '@strapi/provider-email-mailgun',
        providerOptions: {
          key: env('MAILGUN_API_KEY'), // The provider expects 'key' not 'apiKey'
          domain: env('MAILGUN_DOMAIN'),
          host: 'https://api.mailgun.net', // Use full URL
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
