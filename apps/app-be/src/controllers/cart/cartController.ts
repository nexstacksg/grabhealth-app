import { Request, Response, NextFunction } from 'express';
import { CartService } from '../../services/cart/cartService';
import { AppError } from '../../middleware/error/errorHandler';

const cartService = new CartService();

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const cartController = {
  // Get user cart
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const cart = await cartService.getCart(req.user.id);
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  // Add item to cart
  async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { productId, quantity } = req.body;
      const cart = await cartService.addToCart(
        req.user.id,
        productId,
        quantity
      );
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update cart item quantity
  async updateCartItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { productId, quantity } = req.body;
      const cart = await cartService.updateCartItem(
        req.user.id,
        productId,
        quantity
      );
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  // Remove item from cart
  async removeFromCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { productId } = req.params;
      const cart = await cartService.removeFromCart(
        req.user.id,
        Number(productId)
      );
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  // Clear cart
  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      await cartService.clearCart(req.user.id);
      res.json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Sync cart (for merging guest cart with user cart)
  async syncCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { items } = req.body;
      const cart = await cartService.syncCart(req.user.id, items);
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },
};
