# DigitalOcean Spaces Setup Guide

This guide explains how to configure DigitalOcean Spaces for file uploads in the GrabHealth backend.

## Configuration

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
# DigitalOcean Spaces Configuration
DO_SPACES_KEY=your_spaces_access_key
DO_SPACES_SECRET=your_spaces_secret_key
DO_SPACES_ENDPOINT=sgp1.digitaloceanspaces.com
DO_SPACES_REGION=sgp1
DO_SPACES_BUCKET=grab
DO_SPACES_CDN_ENDPOINT=https://grab.sgp1.digitaloceanspaces.com
```

### 2. Getting Your Spaces Credentials

1. Log in to your DigitalOcean account
2. Navigate to **API** → **Tokens/Keys** → **Spaces access keys**
3. Click **Generate New Key**
4. Give your key a name (e.g., "grabhealth-backend")
5. Copy the **Access Key** to `DO_SPACES_KEY`
6. Copy the **Secret Key** to `DO_SPACES_SECRET`

### 3. Spaces Bucket Setup

1. Create a Space in Singapore region (sgp1)
2. Name it "grab" (or update `DO_SPACES_BUCKET` accordingly)
3. Enable CDN (recommended for better performance)
4. Set CORS configuration:

```json
{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}
```

## Usage

### Upload Endpoints

The backend provides several upload endpoints:

1. **Single File Upload**
   - Endpoint: `POST /api/v1/upload/file`
   - Field name: `file`
   - Returns: File URL and metadata

2. **Multiple Files Upload**
   - Endpoint: `POST /api/v1/upload/files`
   - Field name: `files`
   - Max files: 10
   - Returns: Array of file URLs and metadata

3. **Product Image Upload**
   - Endpoint: `POST /api/v1/upload/product-image`
   - Field name: `image`
   - Requires: Admin or Manager role
   - Returns: Image URL and metadata

4. **Delete File**
   - Endpoint: `DELETE /api/v1/upload/delete`
   - Body: `{ "fileUrl": "https://..." }`
   - Requires: Admin or Manager role

5. **Get Presigned URL**
   - Endpoint: `POST /api/v1/upload/presigned-url`
   - Body: `{ "filename": "...", "contentType": "..." }`
   - Returns: Temporary upload URL for direct browser uploads

### Example Usage

```javascript
// Upload a product image
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/v1/upload/product-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Image URL:', result.data.url);
```

## Fallback to Local Storage

If DigitalOcean Spaces is not configured (missing credentials), the system automatically falls back to local file storage:

- Files are stored in the `uploads/` directory
- URLs are served as `/uploads/filename.ext`
- Local storage is suitable for development but not recommended for production

## Security Considerations

1. **File Type Validation**: Only images (JPEG, PNG, GIF, WebP) are allowed
2. **File Size Limit**: Default 10MB (configurable via `MAX_FILE_SIZE`)
3. **Authentication**: All upload endpoints require authentication
4. **Authorization**: Delete operations require Admin/Manager role
5. **Public Access**: Uploaded files are publicly accessible via CDN URL

## Troubleshooting

### Common Issues

1. **"File upload service not configured"**
   - Check that `DO_SPACES_KEY` and `DO_SPACES_SECRET` are set
   - Verify credentials are correct

2. **"Failed to upload file to Spaces"**
   - Check Spaces bucket exists and is in the correct region
   - Verify CORS configuration
   - Check network connectivity

3. **Local storage fallback active**
   - This happens when Spaces credentials are missing
   - Check environment variables are loaded correctly

### Testing Upload Configuration

```bash
# Check if Spaces is configured
curl -X GET http://localhost:4000/health

# Response will include upload configuration status
```

## Migration from Local to Spaces

If you have existing files in local storage and want to migrate to Spaces:

1. Set up Spaces credentials
2. Use the DigitalOcean CLI or S3 tools to sync local files:
   ```bash
   s3cmd sync ./uploads/ s3://grab/uploads/
   ```
3. Update database records to use new CDN URLs