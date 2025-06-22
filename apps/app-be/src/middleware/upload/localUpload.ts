import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../../config/env';
import { AppError } from '../error/errorHandler';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.upload.path);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure local storage
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
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

// Configure multer for local storage
export const uploadLocal = multer({
  storage: localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// Export configured multer middleware
export const localUpload = {
  single: (fieldName: string) => uploadLocal.single(fieldName),
  multiple: (fieldName: string, maxCount?: number) => uploadLocal.array(fieldName, maxCount),
  fields: (fields: multer.Field[]) => uploadLocal.fields(fields),
};