import { Request, Response, NextFunction } from 'express';
import { spacesService } from '../../services/upload/spacesService';
import { AppError } from '../../middleware/error/errorHandler';

export const uploadController = {
  // Upload single file
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      // Get file URL based on storage type
      let fileUrl: string;
      if (spacesService.isConfigured() && (req.file as any).location) {
        // Spaces upload
        fileUrl = (req.file as any).location;
      } else {
        // Local storage fallback
        fileUrl = `/uploads/${req.file.filename}`;
      }

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload multiple files
  async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      // Map uploaded files with appropriate URLs
      const uploadedFiles = (req.files as any[]).map(file => ({
        url: spacesService.isConfigured() && file.location 
          ? file.location 
          : `/uploads/${file.filename}`,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      }));

      res.status(200).json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        data: uploadedFiles,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete file
  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;

      if (!fileUrl) {
        throw new AppError('File URL is required', 400);
      }

      // Check if Spaces is configured
      if (!spacesService.isConfigured()) {
        throw new AppError('File upload service not configured', 503);
      }

      await spacesService.deleteFile(fileUrl);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get presigned upload URL
  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename, contentType } = req.body;

      if (!filename || !contentType) {
        throw new AppError('Filename and content type are required', 400);
      }

      // Check if Spaces is configured
      if (!spacesService.isConfigured()) {
        throw new AppError('File upload service not configured', 503);
      }

      const uploadUrl = await spacesService.getPresignedUploadUrl(filename, contentType);

      res.status(200).json({
        success: true,
        data: {
          uploadUrl,
          expiresIn: 3600, // 1 hour
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload product image
  async uploadProductImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No image uploaded', 400);
      }

      // Get file URL based on storage type
      let fileUrl: string;
      if (spacesService.isConfigured() && (req.file as any).location) {
        // Spaces upload
        fileUrl = (req.file as any).location;
      } else {
        // Local storage fallback
        fileUrl = `/uploads/${req.file.filename}`;
      }

      res.status(200).json({
        success: true,
        message: 'Product image uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};