import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../../services/order/orderService';
import prisma from '../../database/client';
import { AppError } from '../../middleware/error/errorHandler';
import {
  IOrderCreate,
  IOrderUpdate,
  OrderStatus,
  PaymentStatus,
} from '@app/shared-types';

const orderService = new OrderService(prisma);

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const orderController = {
  // Create a new order
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const orderData: IOrderCreate = {
        ...req.body,
        userId: req.user.id,
      };

      const order = await orderService.createOrder(req.user.id, orderData);
      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update order
  async updateOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: IOrderUpdate = req.body;
      const order = await orderService.updateOrder(Number(id), updateData);
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get order by ID
  async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId =
        req.user?.role === 'SUPER_ADMIN' ? undefined : req.user?.id;
      const order = await orderService.getOrder(Number(id), userId);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user orders
  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const result = await orderService.getUserOrders(req.user.id, page, limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all orders (admin)
  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as OrderStatus,
        paymentStatus: req.query.paymentStatus as PaymentStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await orderService.getAllOrders(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Cancel order
  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId =
        req.user?.role === 'SUPER_ADMIN' ? undefined : req.user?.id;
      const order = await orderService.cancelOrder(Number(id), userId);
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get order statistics
  async getOrderStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId =
        req.user?.role === 'SUPER_ADMIN' ? undefined : req.user?.id;
      const stats = await orderService.getOrderStats(userId);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  // Checkout from cart
  async checkoutFromCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const checkoutData = {
        paymentMethod: req.body.paymentMethod,
        shippingAddress: req.body.shippingAddress,
        billingAddress: req.body.billingAddress,
        notes: req.body.notes,
      };

      const order = await orderService.checkoutFromCart(
        req.user.id,
        checkoutData
      );
      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },
};
