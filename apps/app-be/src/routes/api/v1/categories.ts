import { Router } from "express";
import { categoryController } from "../../../controllers/category/categoryController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize } from "../../../middleware/auth/authorize";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import { body, param } from "express-validator";

const router = Router();

// Validation schemas
const createCategoryValidation = [
  body("name").notEmpty().withMessage("Category name is required"),
  body("slug").notEmpty().withMessage("Category slug is required"),
  body("parentId")
    .optional()
    .isInt()
    .withMessage("Parent ID must be an integer"),
  body("sortOrder")
    .optional()
    .isInt()
    .withMessage("Sort order must be an integer"),
];

const updateCategoryValidation = [
  param("id").isInt().withMessage("Category ID must be an integer"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Category name cannot be empty"),
  body("slug")
    .optional()
    .notEmpty()
    .withMessage("Category slug cannot be empty"),
  body("parentId")
    .optional()
    .isInt()
    .withMessage("Parent ID must be an integer"),
  body("sortOrder")
    .optional()
    .isInt()
    .withMessage("Sort order must be an integer"),
];

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/:id", categoryController.getCategory);

// Protected routes (admin only)
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  createCategoryValidation,
  validateRequest,
  categoryController.createCategory
);

router.put(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  updateCategoryValidation,
  validateRequest,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  categoryController.deleteCategory
);

router.post(
  "/reorder",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  body("categoryOrders")
    .isArray()
    .withMessage("Category orders must be an array"),
  validateRequest,
  categoryController.reorderCategories
);

export default router;
