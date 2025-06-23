import { Router } from 'express';
import { uploadController } from '../../controllers/upload/uploadController';
import { upload } from '../../services/upload/spacesService';
import { authenticate } from '../../middleware/auth/authenticate';
import { authorize } from '../../middleware/auth/authorize';
import { UserRole } from '@app/shared-types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /api/v1/upload/file:
 *   post:
 *     summary: Upload a single file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post(
  '/file',
  authenticate,
  upload.single('file'),
  uploadController.uploadFile
);

/**
 * @swagger
 * /api/v1/upload/files:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
router.post(
  '/files',
  authenticate,
  upload.multiple('files', 10), // Max 10 files
  uploadController.uploadMultiple
);

/**
 * @swagger
 * /api/v1/upload/product-image:
 *   post:
 *     summary: Upload a product image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product image uploaded successfully
 */
router.post(
  '/product-image',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  upload.single('image'),
  uploadController.uploadProductImage
);

/**
 * @swagger
 * /api/v1/upload/delete:
 *   delete:
 *     summary: Delete a file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
router.delete(
  '/delete',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  uploadController.deleteFile
);

/**
 * @swagger
 * /api/v1/upload/presigned-url:
 *   post:
 *     summary: Get presigned URL for direct upload
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               contentType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 */
router.post(
  '/presigned-url',
  authenticate,
  uploadController.getUploadUrl
);

export default router;