# DigitalOcean Spaces Setup for Strapi v5

## Overview

This guide explains how to configure Strapi v5 to use DigitalOcean Spaces for file uploads. DigitalOcean Spaces is S3-compatible, so we use the AWS S3 provider.

## Prerequisites

- Strapi v5 project
- DigitalOcean account with Spaces enabled
- Access keys for DigitalOcean Spaces

## Configuration Steps

### 1. Install the AWS S3 Provider

```bash
bun add @strapi/provider-upload-aws-s3
```

### 2. Create a DigitalOcean Space

1. Log in to your DigitalOcean account
2. Create a new Space in your preferred region (e.g., `sgp1` for Singapore)
3. Note down your Space name (this will be your bucket name)

### 3. Generate API Keys

1. Go to API → Tokens/Keys in DigitalOcean
2. Generate new Spaces access keys
3. Save the Access Key ID and Secret Access Key

### 4. Configure Environment Variables

Add the following to your `.env` file:

```bash
# DigitalOcean Spaces Configuration
DO_SPACE_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACE_ACCESS_KEY=your_access_key_id
DO_SPACE_SECRET_KEY=your_secret_access_key
DO_SPACE_REGION=sgp1
DO_SPACE_BUCKET=your_space_name
DO_SPACE_CDN=  # Optional: CDN endpoint if configured
DO_ACL=public-read  # Optional: Default ACL for uploaded files
```

### 5. Configure Strapi Plugin

Update your `config/plugins.js` (or `config/plugins.ts`) file:

```javascript
module.exports = ({ env }) => ({
  // ... other plugins
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
            ACL: env('DO_ACL', 'public-read'), // Optional: Make files publicly readable
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
  // ... other plugins
});
```

### 6. Configure CORS (Optional)

If you're accessing uploaded files from a different domain, configure CORS for your Space:

1. Go to your Space settings in DigitalOcean
2. Add CORS configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>http://localhost:1337</AllowedOrigin>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedOrigin>https://yourdomain.com</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
```

### 7. Update Strapi Middleware (if needed)

In `config/middlewares.ts`, ensure your CSP allows images from DigitalOcean:

```javascript
{
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'connect-src': ["'self'", 'https:'],
        'img-src': ["'self'", 'data:', 'blob:', '*.digitaloceanspaces.com'],
        'media-src': ["'self'", 'data:', 'blob:', '*.digitaloceanspaces.com'],
        upgradeInsecureRequests: null,
      },
    },
  },
}
```

### 8. Restart Strapi

```bash
bun run develop
```

## Usage

Once configured, all file uploads through Strapi will automatically be stored in your DigitalOcean Space. The files will be publicly accessible via URLs like:

```
https://your-space-name.sgp1.digitaloceanspaces.com/filename.jpg
```

## Important Configuration Notes

1. **Credentials Structure**: The `accessKeyId` and `secretAccessKey` must be wrapped in a `credentials` object within `s3Options`
2. **Force Path Style**: Set `forcePathStyle: true` for DigitalOcean Spaces compatibility
3. **Region**: The region is required and should match your Space's region

## Troubleshooting

### Common Issues

1. **"Region is missing" error**
   - Ensure `DO_SPACE_REGION` is set in your `.env` file
   - The region should be in the `s3Options` object

2. **"Could not load credentials from any providers" error**
   - Verify your access keys are correct
   - Ensure credentials are wrapped in a `credentials` object
   - Check that environment variables are properly loaded

3. **"NoSuchBucket" error**
   - Verify your Space name is correct
   - Use only the Space name, not the full URL
   - Example: Use `myspace` not `myspace.sgp1.digitaloceanspaces.com`

4. **Deprecation warnings**
   - Always wrap S3 configuration options inside `s3Options: {}`
   - Don't place credentials at the root level of `providerOptions`

### Debugging Tips

- Check Strapi logs for detailed error messages
- Verify environment variables are loaded: `console.log(process.env.DO_SPACE_BUCKET)`
- Test your credentials using the DigitalOcean API directly
- Ensure your Space has the correct permissions

## Security Best Practices

1. Never commit credentials to version control
2. Use environment variables for all sensitive data
3. Consider using private Spaces with signed URLs for sensitive content
4. Regularly rotate your access keys
5. Use appropriate ACLs based on your security requirements