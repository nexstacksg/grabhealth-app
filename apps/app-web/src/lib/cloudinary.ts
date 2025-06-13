import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(
    'Missing required Cloudinary environment variables:',
    missingVars
  );
  throw new Error(
    `Missing required Cloudinary environment variables: ${missingVars.join(', ')}`
  );
}

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('Cloudinary configured successfully');
} catch (error) {
  console.error('Failed to configure Cloudinary:', error);
  throw new Error(
    'Failed to configure Cloudinary. Please check your environment variables.'
  );
}

interface UploadResult {
  url: string;
  public_id: string;
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string = 'grabhealth/profile-pictures'
): Promise<UploadResult> {
  console.log('Starting Cloudinary upload to folder:', folder);
  console.log('File buffer size:', fileBuffer.length, 'bytes');

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Empty file buffer provided');
  }

  return new Promise<UploadResult>((resolve, reject) => {
    try {
      console.log('Creating upload stream...');
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(
              new Error(`Upload failed: ${error.message || 'Unknown error'}`)
            );
          }
          if (!result) {
            return reject(new Error('No result received from Cloudinary'));
          }
          if (!result.secure_url) {
            return reject(new Error('No URL returned from Cloudinary'));
          }

          console.log('Upload successful:', {
            url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
          });

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      // Create a buffer stream and pipe it to Cloudinary
      console.log('Creating buffer stream...');
      const { Readable } = require('stream');
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null);

      console.log('Piping to upload stream...');
      const stream = bufferStream.pipe(uploadStream);

      stream.on('error', (error: Error) => {
        console.error('Stream pipe error:', error);
        reject(new Error(`Stream error: ${error.message}`));
      });

      stream.on('finish', () => {
        console.log('File upload stream finished');
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown upload error';
      console.error('Error in upload process:', errorMessage, error);
      reject(new Error(`Upload process failed: ${errorMessage}`));
    }
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  console.log('Deleting image from Cloudinary, public_id:', publicId);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return reject(error);
      }

      if (result?.result !== 'ok') {
        console.error('Failed to delete image from Cloudinary:', result);
        return reject(new Error('Failed to delete image from Cloudinary'));
      }

      console.log('Successfully deleted image from Cloudinary');
      resolve();
    });
  });
}
