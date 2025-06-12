import { Router } from "express";
import { productController } from "../../../controllers/product/productController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize } from "../../../middleware/auth/authorize";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import { body, query, param } from "express-validator";

const router = Router();

// Validation schemas
const createProductValidation = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("categoryId")
    .optional()
    .isInt()
    .withMessage("Category ID must be an integer"),
  body("discountEssential")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Discount must be between 0 and 1"),
  body("discountPremium")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Discount must be between 0 and 1"),
];

const updateProductValidation = [
  param("id").isInt().withMessage("Product ID must be an integer"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Product name cannot be empty"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("categoryId")
    .optional()
    .isInt()
    .withMessage("Category ID must be an integer"),
  body("discountEssential")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Discount must be between 0 and 1"),
  body("discountPremium")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Discount must be between 0 and 1"),
];

const searchProductsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min price must be positive"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max price must be positive"),
];

// Public routes
router.get(
  "/search",
  searchProductsValidation,
  validateRequest,
  productController.searchProducts
);
router.get("/featured", productController.getFeaturedProducts);
router.get("/categories", productController.getCategories);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:id", productController.getProduct);

// Protected routes (admin only)
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  createProductValidation,
  validateRequest,
  productController.createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  updateProductValidation,
  validateRequest,
  productController.updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  productController.deleteProduct
);

router.patch(
  "/:id/stock",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  body("inStock").isBoolean().withMessage("inStock must be a boolean"),
  validateRequest,
  productController.updateStock
);

export default router;
