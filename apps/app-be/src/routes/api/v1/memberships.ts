import { Router } from "express";
import { membershipController } from "../../../controllers/membership/membershipController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize } from "../../../middleware/auth/authorize";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import { body, query, param } from "express-validator";

const router = Router();

// Validation schemas
const createMembershipTierValidation = [
  body("name").notEmpty().withMessage("Tier name is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("discount")
    .isFloat({ min: 0, max: 1 })
    .withMessage("Discount must be between 0 and 1"),
];

const updateMembershipTierValidation = [
  param("id").isInt().withMessage("Tier ID must be an integer"),
  body("name").optional().notEmpty().withMessage("Tier name cannot be empty"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("discount")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Discount must be between 0 and 1"),
];

const subscribeMembershipValidation = [
  body("tierId").isInt().withMessage("Tier ID must be an integer"),
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
router.get("/tiers", membershipController.getMembershipTiers);
router.get(
  "/tiers/:id",
  param("id").isInt(),
  validateRequest,
  membershipController.getMembershipTier
);

// Protected routes
router.use(authenticate);

// User routes
router.get("/my-membership", membershipController.getUserMembership);
router.post(
  "/subscribe",
  subscribeMembershipValidation,
  validateRequest,
  membershipController.subscribeMembership
);
router.post("/cancel", membershipController.cancelMembership);
router.patch(
  "/auto-renew",
  body("autoRenew").isBoolean().withMessage("autoRenew must be a boolean"),
  validateRequest,
  membershipController.updateAutoRenew
);

// Admin routes
router.post(
  "/tiers",
  authorize("SUPER_ADMIN"),
  createMembershipTierValidation,
  validateRequest,
  membershipController.createMembershipTier
);

router.put(
  "/tiers/:id",
  authorize("SUPER_ADMIN"),
  updateMembershipTierValidation,
  validateRequest,
  membershipController.updateMembershipTier
);

router.get(
  "/users",
  authorize("SUPER_ADMIN", "MANAGER"),
  paginationValidation,
  validateRequest,
  membershipController.getAllUserMemberships
);

router.get(
  "/stats",
  authorize("SUPER_ADMIN", "MANAGER"),
  membershipController.getMembershipStats
);

router.post(
  "/process-expired",
  authorize("SUPER_ADMIN"),
  membershipController.processExpiredMemberships
);

export default router;
