import { Router } from 'express';
import { productController } from '../../../controllers/product/productController';
import {
  authenticate,
  optionalAuth,
} from '../../../middleware/auth/authenticate';
import { authorize } from '../../../middleware/auth/authorize';
import { validateRequest } from '../../../middleware/validation/validationMiddleware';
import { body, query, param } from 'express-validator';

const router = Router();

// Validation schemas for basic product operations
const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('categoryId')
    .optional()
    .isInt()
    .withMessage('Category ID must be an integer'),
  body('discountEssential')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Discount must be between 0 and 1'),
  body('discountPremium')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Discount must be between 0 and 1'),
];

// Enhanced validation for detailed product operations (admin)
const createProductDetailedValidation = [
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
  param('id').isInt().withMessage('Product ID must be an integer'),
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Product name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('categoryId')
    .optional()
    .isInt()
    .withMessage('Category ID must be an integer'),
  body('discountEssential')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Discount must be between 0 and 1'),
  body('discountPremium')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Discount must be between 0 and 1'),
];

// Enhanced update validation for detailed product operations (admin)
const updateProductDetailedValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
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

const searchProductsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be positive'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be positive'),
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

// Public routes (no authentication required)
router.get(
  '/search',
  searchProductsValidation,
  validateRequest,
  productController.searchProducts
);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories', productController.getCategories);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', optionalAuth, productController.getProduct);

// Commission preview endpoint (can be used by sales team)
router.get(
  '/commission-preview',
  commissionPreviewValidation,
  validateRequest,
  productController.getCommissionPreview
);

// Protected routes (admin only) - Product operations with dynamic validation
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'MANAGER'),
  // Dynamic validation based on request content
  (req, _res, next) => {
    // Check if request contains detailed product data (pricing/commissions)
    const validationChain =
      req.body.pricing || req.body.commissions
        ? createProductDetailedValidation
        : createProductValidation;

    // Run validation chain
    Promise.all(validationChain.map((validation) => validation.run(req)))
      .then(() => next())
      .catch(next);
  },
  validateRequest,
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'MANAGER'),
  // Dynamic validation based on request content
  (req, _res, next) => {
    // Check if request contains detailed product data (pricing/commissions)
    const validationChain =
      req.body.pricing || req.body.commissions
        ? updateProductDetailedValidation
        : updateProductValidation;

    // Run validation chain
    Promise.all(validationChain.map((validation) => validation.run(req)))
      .then(() => next())
      .catch(next);
  },
  validateRequest,
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  productController.deleteProduct
);

router.patch(
  '/:id/stock',
  authenticate,
  authorize('SUPER_ADMIN', 'MANAGER'),
  body('inStock').isBoolean().withMessage('inStock must be a boolean'),
  validateRequest,
  productController.updateStock
);

export default router;
