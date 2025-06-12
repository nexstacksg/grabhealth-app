import { Router } from "express";
import { commissionController } from "../../../controllers/commission/commissionController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize } from "../../../middleware/auth/authorize";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import { body, query, param } from "express-validator";

const router = Router();

// Validation schemas
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

const processPendingValidation = [
  body("commissionIds")
    .isArray({ min: 1 })
    .withMessage("Commission IDs must be a non-empty array"),
  body("commissionIds.*")
    .isInt()
    .withMessage("Commission ID must be an integer"),
];

// All commission routes require authentication
router.use(authenticate);

// User routes
router.get(
  "/my-commissions",
  paginationValidation,
  validateRequest,
  commissionController.getUserCommissions
);
router.get("/stats", commissionController.getCommissionStats);
router.get(
  "/network",
  query("levels").optional().isInt({ min: 1, max: 4 }),
  validateRequest,
  commissionController.getUserNetwork
);
router.get("/network/stats", commissionController.getNetworkStats);
router.get(
  "/:id",
  param("id").isInt(),
  validateRequest,
  commissionController.getCommissionDetails
);

// Admin routes
router.get(
  "/summary/all",
  authorize("SUPER_ADMIN"),
  commissionController.getCommissionSummary
);

router.post(
  "/process",
  authorize("SUPER_ADMIN"),
  processPendingValidation,
  validateRequest,
  commissionController.processPendingCommissions
);

export default router;
