import { PrismaClient, Promotion, Prisma } from '@prisma/client';
import { IPromotionCreate } from '@app/shared-types';
import { AppError } from '../middleware/error/errorHandler';

export class PromotionService {
  constructor(private prisma: PrismaClient) {}

  // Create promotion
  async createPromotion(data: IPromotionCreate): Promise<Promotion> {
    try {
      // Validate dates
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        throw new AppError('End date must be after start date', 400);
      }

      return await this.prisma.promotion.create({
        data: {
          title: data.title,
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minPurchase: data.minPurchase,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive ?? true,
        },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to create promotion', 500);
    }
  }

  // Update promotion
  async updatePromotion(
    id: number,
    data: Partial<IPromotionCreate>
  ): Promise<Promotion> {
    try {
      const promotion = await this.prisma.promotion.findUnique({
        where: { id },
      });

      if (!promotion) {
        throw new AppError('Promotion not found', 404);
      }

      // Validate dates if being updated
      if (data.endDate || data.startDate) {
        const startDate = data.startDate || promotion.startDate;
        const endDate = data.endDate || promotion.endDate;

        if (endDate && startDate && endDate < startDate) {
          throw new AppError('End date must be after start date', 400);
        }
      }

      return await this.prisma.promotion.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.discountType && { discountType: data.discountType }),
          ...(data.discountValue !== undefined && {
            discountValue: data.discountValue,
          }),
          ...(data.minPurchase !== undefined && {
            minPurchase: data.minPurchase,
          }),
          ...(data.startDate && { startDate: data.startDate }),
          ...(data.endDate !== undefined && { endDate: data.endDate }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to update promotion', 500);
    }
  }

  // Get promotion by ID
  async getPromotion(id: number): Promise<Promotion | null> {
    try {
      return await this.prisma.promotion.findUnique({
        where: { id },
      });
    } catch (_error) {
      throw new AppError('Failed to get promotion', 500);
    }
  }

  // Get all promotions
  async getAllPromotions(filters: {
    isActive?: boolean;
    includeExpired?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    promotions: Promotion[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        isActive,
        includeExpired = false,
        page = 1,
        limit = 10,
      } = filters;
      const skip = (page - 1) * limit;

      const where: Prisma.PromotionWhereInput = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (!includeExpired) {
        const now = new Date();
        where.OR = [{ endDate: null }, { endDate: { gte: now } }];
      }

      const [promotions, total] = await Promise.all([
        this.prisma.promotion.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.promotion.count({ where }),
      ]);

      return {
        promotions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (_error) {
      throw new AppError('Failed to get promotions', 500);
    }
  }

  // Get active promotions
  async getActivePromotions(): Promise<Promotion[]> {
    try {
      const now = new Date();

      return await this.prisma.promotion.findMany({
        where: {
          isActive: true,
          startDate: { lte: now },
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
        orderBy: { discountValue: 'desc' },
      });
    } catch (_error) {
      throw new AppError('Failed to get active promotions', 500);
    }
  }

  // Validate and apply promotion
  async validatePromotion(
    promotionCode: string,
    orderTotal: number
  ): Promise<{
    valid: boolean;
    promotion?: Promotion;
    discountAmount?: number;
    message?: string;
  }> {
    try {
      // For this implementation, we'll use promotion title as code
      const promotion = await this.prisma.promotion.findFirst({
        where: {
          title: promotionCode,
        },
      });

      if (!promotion) {
        return {
          valid: false,
          message: 'Invalid promotion code',
        };
      }

      // Check if promotion is active
      if (!promotion.isActive) {
        return {
          valid: false,
          message: 'This promotion is no longer active',
        };
      }

      // Check date validity
      const now = new Date();
      if (promotion.startDate > now) {
        return {
          valid: false,
          message: 'This promotion has not started yet',
        };
      }

      if (promotion.endDate && promotion.endDate < now) {
        return {
          valid: false,
          message: 'This promotion has expired',
        };
      }

      // Check minimum purchase requirement
      if (promotion.minPurchase && orderTotal < promotion.minPurchase) {
        return {
          valid: false,
          message: `Minimum purchase of $${promotion.minPurchase} required`,
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (promotion.discountType === 'PERCENTAGE') {
        discountAmount = (orderTotal * promotion.discountValue) / 100;
      } else if (promotion.discountType === 'FIXED') {
        discountAmount = Math.min(promotion.discountValue, orderTotal);
      }

      return {
        valid: true,
        promotion,
        discountAmount,
      };
    } catch (_error) {
      throw new AppError('Failed to validate promotion', 500);
    }
  }

  // Delete promotion
  async deletePromotion(id: number): Promise<void> {
    try {
      const promotion = await this.prisma.promotion.findUnique({
        where: { id },
      });

      if (!promotion) {
        throw new AppError('Promotion not found', 404);
      }

      await this.prisma.promotion.delete({
        where: { id },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to delete promotion', 500);
    }
  }

  // Toggle promotion status
  async togglePromotionStatus(id: number): Promise<Promotion> {
    try {
      const promotion = await this.prisma.promotion.findUnique({
        where: { id },
      });

      if (!promotion) {
        throw new AppError('Promotion not found', 404);
      }

      return await this.prisma.promotion.update({
        where: { id },
        data: { isActive: !promotion.isActive },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to toggle promotion status', 500);
    }
  }

  // Get promotion statistics
  async getPromotionStats(): Promise<{
    totalActive: number;
    totalInactive: number;
    totalExpired: number;
    upcomingPromotions: number;
  }> {
    try {
      const now = new Date();

      const [totalActive, totalInactive, totalExpired, upcomingPromotions] =
        await Promise.all([
          this.prisma.promotion.count({
            where: {
              isActive: true,
              startDate: { lte: now },
              OR: [{ endDate: null }, { endDate: { gte: now } }],
            },
          }),
          this.prisma.promotion.count({
            where: { isActive: false },
          }),
          this.prisma.promotion.count({
            where: {
              endDate: { lt: now },
            },
          }),
          this.prisma.promotion.count({
            where: {
              startDate: { gt: now },
            },
          }),
        ]);

      return {
        totalActive,
        totalInactive,
        totalExpired,
        upcomingPromotions,
      };
    } catch (_error) {
      throw new AppError('Failed to get promotion stats', 500);
    }
  }
}
