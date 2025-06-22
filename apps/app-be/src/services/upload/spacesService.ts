import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import config from '../../config/env';
import { AppError } from '../../middleware/error/errorHandler';
import { localUpload } from '../../middleware/upload/localUpload';

// Create S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: `https://${config.spaces.endpoint}`,
  region: config.spaces.region,
  credentials: {
    accessKeyId: config.spaces.key || '',
    secretAccessKey: config.spaces.secret || '',
  },
});

// File type validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.', 400));
  }
};

// Configure multer for Spaces upload
export const uploadToSpaces = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: config.spaces.bucket,
    acl: 'public-read',
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `uploads/${file.fieldname}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // Use configured max file size
  },
});

// Service for Spaces operations
export const spacesService = {
  // Upload file to Spaces
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!config.spaces.key || !config.spaces.secret) {
      throw new AppError('DigitalOcean Spaces not configured', 500);
    }

    const key = `uploads/${Date.now()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: config.spaces.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    try {
      await s3Client.send(command);
      return `${config.spaces.cdnEndpoint}/${key}`;
    } catch (error) {
      console.error('Spaces upload error:', error);
      throw new AppError('Failed to upload file to Spaces', 500);
    }
  },

  // Delete file from Spaces
  async deleteFile(fileUrl: string): Promise<void> {
    if (!config.spaces.key || !config.spaces.secret) {
      throw new AppError('DigitalOcean Spaces not configured', 500);
    }

    // Extract key from URL
    const key = fileUrl.replace(`${config.spaces.cdnEndpoint}/`, '');
    
    const command = new DeleteObjectCommand({
      Bucket: config.spaces.bucket,
      Key: key,
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      console.error('Spaces delete error:', error);
      throw new AppError('Failed to delete file from Spaces', 500);
    }
  },

  // Generate presigned URL for direct upload
  async getPresignedUploadUrl(filename: string, contentType: string): Promise<string> {
    if (!config.spaces.key || !config.spaces.secret) {
      throw new AppError('DigitalOcean Spaces not configured', 500);
    }

    const key = `uploads/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: config.spaces.bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
      return url;
    } catch (error) {
      console.error('Presigned URL error:', error);
      throw new AppError('Failed to generate upload URL', 500);
    }
  },

  // Check if Spaces is configured
  isConfigured(): boolean {
    return !!(config.spaces.key && config.spaces.secret);
  },
};

// Export configured multer middleware with fallback to local storage
export const upload = {
  single: (fieldName: string) => {
    if (spacesService.isConfigured()) {
      return uploadToSpaces.single(fieldName);
    }
    return localUpload.single(fieldName);
  },
  multiple: (fieldName: string, maxCount?: number) => {
    if (spacesService.isConfigured()) {
      return uploadToSpaces.array(fieldName, maxCount);
    }
    return localUpload.multiple(fieldName, maxCount);
  },
  fields: (fields: multer.Field[]) => {
    if (spacesService.isConfigured()) {
      return uploadToSpaces.fields(fields);
    }
    return localUpload.fields(fields);
  },
};