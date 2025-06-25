export default ({ env }) => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-do',
      providerOptions: {
        key: env('DO_SPACES_ACCESS_KEY_ID'),
        secret: env('DO_SPACES_SECRET_ACCESS_KEY'),
        endpoint: env('DO_SPACES_ENDPOINT'),
        space: env('DO_SPACES_BUCKET'),
        directory: 'media', // optional - will organize uploads in a media folder
        cdn: env('DO_SPACES_CDN'), // optional - if you have a CDN configured
      },
    },
  },
});
