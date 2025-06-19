import { Router } from 'express';
import { productManagementController } from '../../../controllers/product/productManagementController';
// import { authenticate } from '../../../middleware/auth/authenticate';
// import { authorize } from '../../../middleware/auth/authorize';
import { validateRequest } from '../../../middleware/validation/validationMiddleware';
import { body, query, param } from 'express-validator';

const router = Router();

// Validation schemas
const createProductValidation = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'])
    .withMessage('Invalid status'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  
  // Pricing validation
  body('pricing.pvValue')
    .isInt({ min: 0 })
    .withMessage('PV value must be a non-negative integer'),
  body('pricing.customerPrice')
    .isFloat({ min: 0 })
    .withMessage('Customer price must be a non-negative number'),
  body('pricing.costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a non-negative number'),
  body('pricing.travelPackagePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Travel package price must be a non-negative number'),
  
  // Commission validation
  body('commissions.salesCommissionAmount')
    .isFloat({ min: 0 })
    .withMessage('Sales commission amount must be a non-negative number'),
  body('commissions.leaderCommissionAmount')
    .isFloat({ min: 0 })
    .withMessage('Leader commission amount must be a non-negative number'),
  body('commissions.managerCommissionAmount')
    .isFloat({ min: 0 })
    .withMessage('Manager commission amount must be a non-negative number'),
  body('commissions.salesCommissionRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Sales commission rate must be between 0 and 1'),
  body('commissions.leaderCommissionRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Leader commission rate must be between 0 and 1'),
  body('commissions.managerCommissionRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Manager commission rate must be between 0 and 1'),
];

const updateProductValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('sku')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'])
    .withMessage('Invalid status'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  
  // Optional pricing validation
  body('pricing.pvValue')
    .optional()
    .isInt({ min: 0 })
    .withMessage('PV value must be a non-negative integer'),
  body('pricing.customerPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Customer price must be a non-negative number'),
  body('pricing.costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a non-negative number'),
  body('pricing.travelPackagePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Travel package price must be a non-negative number'),
  
  // Optional commission validation
  body('commissions.salesCommissionAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sales commission amount must be a non-negative number'),
  body('commissions.leaderCommissionAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Leader commission amount must be a non-negative number'),
  body('commissions.managerCommissionAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Manager commission amount must be a non-negative number'),
  body('commissions.salesCommissionRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Sales commission rate must be between 0 and 1'),
  body('commissions.leaderCommissionRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Leader commission rate must be between 0 and 1'),
  body('commissions.managerCommissionRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Manager commission rate must be between 0 and 1'),
];

const productIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
];

const commissionPreviewValidation = [
  query('productId')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  query('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

// Commission preview (can be used by sales team)
router.get(
  '/commission-preview',
  // authenticate, // TEMPORARILY COMMENTED OUT FOR TESTING
  commissionPreviewValidation,
  validateRequest,
  productManagementController.getCommissionPreview
);

// Admin routes (require authentication and admin privileges)
router.get(
  '/',
  // authenticate, // TEMPORARILY COMMENTED OUT FOR TESTING
  // authorize('SUPER_ADMIN', 'MANAGER'), // TEMPORARILY COMMENTED OUT FOR TESTING
  productManagementController.getAllProducts
);

router.get(
  '/:id',
  // authenticate, // TEMPORARILY COMMENTED OUT FOR TESTING
  // authorize('SUPER_ADMIN', 'MANAGER'), // TEMPORARILY COMMENTED OUT FOR TESTING
  productIdValidation,
  validateRequest,
  productManagementController.getProduct
);

router.post(
  '/',
  // authenticate, // TEMPORARILY COMMENTED OUT FOR TESTING
  // authorize('SUPER_ADMIN'), // TEMPORARILY COMMENTED OUT FOR TESTING
  createProductValidation,
  validateRequest,
  productManagementController.createProduct
);

router.put(
  '/:id',
  // authenticate, // TEMPORARILY COMMENTED OUT FOR TESTING
  // authorize('SUPER_ADMIN'), // TEMPORARILY COMMENTED OUT FOR TESTING
  productIdValidation,
  updateProductValidation,
  validateRequest,
  productManagementController.updateProduct
);

router.delete(
  '/:id',
  // authenticate, // TEMPORARILY COMMENTED OUT FOR TESTING
  // authorize('SUPER_ADMIN'), // TEMPORARILY COMMENTED OUT FOR TESTING
  productIdValidation,
  validateRequest,
  productManagementController.deleteProduct
);

export default router;
