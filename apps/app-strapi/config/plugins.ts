export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          // DigitalOcean Spaces is S3-compatible
          endpoint: env('DO_SPACES_ENDPOINT'), // e.g. 'https://sgp1.digitaloceanspaces.com'
          accessKeyId: env('DO_SPACES_ACCESS_KEY_ID'),
          secretAccessKey: env('DO_SPACES_SECRET_ACCESS_KEY'),
          region: env('DO_SPACES_REGION', 'sgp1'), // Singapore region
          params: {
            Bucket: env('DO_SPACES_BUCKET'),
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
});
