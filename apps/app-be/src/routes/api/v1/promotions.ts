import { Router } from "express";
import { promotionController } from "../../../controllers/promotion/promotionController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize } from "../../../middleware/auth/authorize";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import { body, query, param } from "express-validator";

const router = Router();

// Validation schemas
const createPromotionValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("discountType")
    .isIn(["PERCENTAGE", "FIXED"])
    .withMessage("Invalid discount type"),
  body("discountValue")
    .isFloat({ min: 0 })
    .withMessage("Discount value must be positive"),
  body("startDate").isISO8601().toDate().withMessage("Invalid start date"),
  body("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid end date"),
  body("minPurchase")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum purchase must be positive"),
];

const updatePromotionValidation = [
  param("id").isInt().withMessage("Promotion ID must be an integer"),
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("discountType")
    .optional()
    .isIn(["PERCENTAGE", "FIXED"])
    .withMessage("Invalid discount type"),
  body("discountValue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount value must be positive"),
  body("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid start date"),
  body("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid end date"),
  body("minPurchase")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum purchase must be positive"),
];

const validatePromotionValidation = [
  body("code").notEmpty().withMessage("Promotion code is required"),
  body("orderTotal")
    .isFloat({ min: 0 })
    .withMessage("Order total must be positive"),
];

const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// Public routes
router.get("/active", promotionController.getActivePromotions);
router.post(
  "/validate",
  validatePromotionValidation,
  validateRequest,
  promotionController.validatePromotion
);

// Protected routes
router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  paginationValidation,
  validateRequest,
  promotionController.getAllPromotions
);

router.get(
  "/stats",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  promotionController.getPromotionStats
);

router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  param("id").isInt(),
  validateRequest,
  promotionController.getPromotion
);

router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  createPromotionValidation,
  validateRequest,
  promotionController.createPromotion
);

router.put(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  updatePromotionValidation,
  validateRequest,
  promotionController.updatePromotion
);

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  param("id").isInt(),
  validateRequest,
  promotionController.deletePromotion
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize("SUPER_ADMIN", "MANAGER"),
  param("id").isInt(),
  validateRequest,
  promotionController.togglePromotionStatus
);

export default router;
