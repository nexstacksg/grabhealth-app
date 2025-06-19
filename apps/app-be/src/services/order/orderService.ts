import { PrismaClient, Order, Prisma } from '@prisma/client';
import {
  IOrderCreate,
  IOrderUpdate,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '@app/shared-types';
import { AppError } from '../../middleware/error/errorHandler';
import { CartService } from '../cart/cartService';
import { CommissionService } from '../commission/commissionService';

export class OrderService {
  private cartService: CartService;
  private commissionService: CommissionService;

  constructor(private prisma: PrismaClient) {
    this.cartService = new CartService();
    this.commissionService = new CommissionService(prisma);
  }

  async createOrder(userId: string, data: IOrderCreate): Promise<Order> {
    try {
      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Start transaction
      return await this.prisma.$transaction(async (tx) => {
        // Calculate totals
        let subtotal = 0;
        let discount = 0;
        const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];

        for (const item of data.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: {
              productPricing: true,
            },
          });

          if (!product) {
            throw new AppError(`Product ${item.productId} not found`, 404);
          }

          if (!product.inStock) {
            throw new AppError(`Product ${product.name} is out of stock`, 400);
          }

          // Use customer price from product pricing (new 4-product model)
          const customerPrice = product.productPricing?.customerPrice;
          if (!customerPrice) {
            throw new AppError(
              `Product ${product.name} has no pricing configured`,
              400
            );
          }

          const itemPrice = customerPrice;
          const totalPvPoints =
            (product.productPricing?.pvValue || 0) * item.quantity;

          subtotal += item.quantity * customerPrice;

          orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: itemPrice,
            discount: 0,
            pvPoints: totalPvPoints,
          });
        }

        const total = subtotal - discount; // discount is 0 unless from promotions

        // Create order
        const order = await tx.order.create({
          data: {
            userId,
            subtotal,
            discount,
            total,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: data.paymentMethod,
            shippingAddress: data.shippingAddress,
            billingAddress: data.billingAddress,
            notes: data.notes,
            items: {
              createMany: {
                data: orderItems,
              },
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        // Process commission asynchronously
        if (
          order.status === OrderStatus.COMPLETED ||
          order.paymentStatus === PaymentStatus.PAID
        ) {
          await this.commissionService.processOrderCommission(order.id);
        }

        return order;
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to create order', 500);
    }
  }

  async updateOrder(id: number, data: IOrderUpdate): Promise<Order> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
          ...(data.shippingAddress && {
            shippingAddress: data.shippingAddress,
          }),
          ...(data.billingAddress && { billingAddress: data.billingAddress }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Process commission if order is completed
      if (
        data.status === OrderStatus.COMPLETED ||
        data.paymentStatus === PaymentStatus.PAID
      ) {
        await this.commissionService.processOrderCommission(id);
      }

      return updatedOrder;
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to update order', 500);
    }
  }

  async getOrder(id: number, userId?: string): Promise<Order | null> {
    try {
      const where: Prisma.OrderWhereUniqueInput = { id };

      const order = await this.prisma.order.findUnique({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          commissions: true,
        },
      });

      // If userId is provided, ensure the order belongs to the user
      if (userId && order && order.userId !== userId) {
        throw new AppError('Unauthorized access to order', 403);
      }

      return order;
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to get order', 500);
    }
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.order.count({ where: { userId } }),
      ]);

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (_error) {
      throw new AppError('Failed to get user orders', 500);
    }
  }

  async getAllOrders(filters: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        status,
        paymentStatus,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = filters;
      const skip = (page - 1) * limit;

      const where: Prisma.OrderWhereInput = {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            items: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.order.count({ where }),
      ]);

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (_error) {
      throw new AppError('Failed to get orders', 500);
    }
  }

  async cancelOrder(id: number, userId?: string): Promise<Order> {
    try {
      const order = await this.getOrder(id, userId);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new AppError('Only pending orders can be cancelled', 400);
      }

      return await this.prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.REFUNDED,
        },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to cancel order', 500);
    }
  }

  async getOrderStats(userId?: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    try {
      const where = userId ? { userId } : {};

      const [totalOrders, totalSpent, pendingOrders, completedOrders] =
        await Promise.all([
          this.prisma.order.count({ where }),
          this.prisma.order.aggregate({
            where: { ...where, status: OrderStatus.COMPLETED },
            _sum: { total: true },
          }),
          this.prisma.order.count({
            where: { ...where, status: OrderStatus.PENDING },
          }),
          this.prisma.order.count({
            where: { ...where, status: OrderStatus.COMPLETED },
          }),
        ]);

      return {
        totalOrders,
        totalSpent: totalSpent._sum.total || 0,
        pendingOrders,
        completedOrders,
      };
    } catch (_error) {
      throw new AppError('Failed to get order stats', 500);
    }
  }

  async checkoutFromCart(
    userId: string,
    checkoutData: {
      paymentMethod: string;
      shippingAddress?: string;
      billingAddress?: string;
      notes?: string;
    }
  ): Promise<Order> {
    try {
      // Get cart items
      const cart = await this.cartService.getCart(userId);

      if (!cart.items || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }

      // Create order from cart
      const orderData: IOrderCreate = {
        userId,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price || 0,
        })),
        paymentMethod: checkoutData.paymentMethod as PaymentMethod,
        shippingAddress: checkoutData.shippingAddress,
        billingAddress: checkoutData.billingAddress,
        notes: checkoutData.notes,
      };

      const order = await this.createOrder(userId, orderData);

      // Clear cart after successful order
      await this.cartService.clearCart(userId);

      return order;
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to checkout', 500);
    }
  }
}
