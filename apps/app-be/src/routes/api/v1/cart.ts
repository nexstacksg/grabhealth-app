import { Router } from "express";
import { cartController } from "../../../controllers/cart/cartController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import { body, param } from "express-validator";

const router = Router();

// Validation schemas
const addToCartValidation = [
  body("productId").isInt().withMessage("Product ID must be an integer"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const updateCartItemValidation = [
  body("productId").isInt().withMessage("Product ID must be an integer"),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be non-negative"),
];

const syncCartValidation = [
  body("items").isArray().withMessage("Items must be an array"),
  body("items.*.productId")
    .isInt()
    .withMessage("Product ID must be an integer"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

// All cart routes require authentication
router.use(authenticate);

router.get("/", cartController.getCart);
router.post(
  "/add",
  addToCartValidation,
  validateRequest,
  cartController.addToCart
);
router.put(
  "/update",
  updateCartItemValidation,
  validateRequest,
  cartController.updateCartItem
);
router.delete(
  "/item/:productId",
  param("productId").isInt(),
  validateRequest,
  cartController.removeFromCart
);
router.delete("/clear", cartController.clearCart);
router.post(
  "/sync",
  syncCartValidation,
  validateRequest,
  cartController.syncCart
);

export default router;
