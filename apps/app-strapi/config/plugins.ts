module.exports = ({ env }) => {
  return {
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST', 'smtp.gmail.com'),
          port: env('SMTP_PORT', 465),
          secure: true,
          auth: {
            user: env('MAIL_USERNAME'),
            pass: env('MAIL_PASSWORD'),
          },
          ignoreTLS: true,
        },
        settings: {
          defaultFrom: env('SEND_FROM', 'dev.nexstack@gmail.com'),
          defaultReplyTo: env('SEND_TO', 'dev.nexstack@gmail.com'),
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
