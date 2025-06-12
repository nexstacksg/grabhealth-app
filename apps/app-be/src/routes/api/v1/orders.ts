import { Router } from "express";
import { orderController } from "../../../controllers/order/orderController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize } from "../../../middleware/auth/authorize";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import { body, query, param } from "express-validator";

const router = Router();

// Validation schemas
const createOrderValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must have at least one item"),
  body("items.*.productId")
    .isInt()
    .withMessage("Product ID must be an integer"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("paymentMethod").notEmpty().withMessage("Payment method is required"),
  body("shippingAddress").optional().isString(),
  body("billingAddress").optional().isString(),
];

const updateOrderValidation = [
  param("id").isInt().withMessage("Order ID must be an integer"),
  body("status")
    .optional()
    .isIn(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid order status"),
  body("paymentStatus")
    .optional()
    .isIn(["PENDING", "PAID", "FAILED", "REFUNDED"])
    .withMessage("Invalid payment status"),
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

// Protected routes
router.use(authenticate);

// User routes
router.post(
  "/",
  createOrderValidation,
  validateRequest,
  orderController.createOrder
);
router.get(
  "/my-orders",
  paginationValidation,
  validateRequest,
  orderController.getUserOrders
);
router.get("/stats", orderController.getOrderStats);
router.post("/checkout", orderController.checkoutFromCart);
router.get("/:id", orderController.getOrder);
router.post("/:id/cancel", orderController.cancelOrder);

// Admin routes
router.get(
  "/",
  authorize("SUPER_ADMIN", "MANAGER"),
  paginationValidation,
  validateRequest,
  orderController.getAllOrders
);

router.put(
  "/:id",
  authorize("SUPER_ADMIN", "MANAGER"),
  updateOrderValidation,
  validateRequest,
  orderController.updateOrder
);

export default router;
