# DigitalOcean Spaces Setup for Strapi

## Configuration Steps

1. **Create a DigitalOcean Space**
   - Log in to your DigitalOcean account
   - Create a new Space in the Singapore region (sgp1)
   - Note down your Space name (bucket name)

2. **Generate API Keys**
   - Go to API > Tokens/Keys in DigitalOcean
   - Generate new Spaces access keys
   - Save the Access Key ID and Secret Access Key

3. **Configure CORS for your Space**
   - In your Space settings, add CORS configuration:
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

4. **Update Environment Variables**
   Update your `.env` file with your DigitalOcean Spaces credentials:
   ```
   DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
   DO_SPACES_ACCESS_KEY_ID=your_actual_access_key
   DO_SPACES_SECRET_ACCESS_KEY=your_actual_secret_key
   DO_SPACES_REGION=sgp1
   DO_SPACES_BUCKET=your_space_name
   ```

5. **Restart Strapi**
   ```bash
   bun run develop
   ```

## Usage

Once configured, all file uploads through Strapi will automatically be stored in your DigitalOcean Space. The files will be publicly accessible via URLs like:
`https://your-space-name.sgp1.digitaloceanspaces.com/filename.jpg`

## Troubleshooting

- Ensure your Space is set to public or configure appropriate ACLs
- Check that CORS is properly configured on your Space
- Verify that your access keys have read/write permissions
- Check Strapi logs for any S3-related errors