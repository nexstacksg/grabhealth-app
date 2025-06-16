import { Request, Response, NextFunction } from 'express';
import { PromotionService } from '../../services/promotion.service';
import prisma from '../../database/client';
import { AppError } from '../../middleware/error/errorHandler';
import { IPromotionCreate } from '@app/shared-types';

const promotionService = new PromotionService(prisma);

export const promotionController = {
  // Get all promotions
  async getAllPromotions(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        isActive:
          req.query.active === 'true'
            ? true
            : req.query.active === 'false'
              ? false
              : req.query.isActive === 'true'
                ? true
                : req.query.isActive === 'false'
                  ? false
                  : undefined,
        includeExpired: req.query.includeExpired === 'true',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await promotionService.getAllPromotions(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // Get active promotions
  async getActivePromotions(_req: Request, res: Response, next: NextFunction) {
    try {
      const promotions = await promotionService.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      next(error);
    }
  },

  // Get promotion by ID
  async getPromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const promotion = await promotionService.getPromotion(Number(id));

      if (!promotion) {
        throw new AppError('Promotion not found', 404);
      }

      res.json(promotion);
    } catch (error) {
      next(error);
    }
  },

  // Create promotion (admin)
  async createPromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const promotionData: IPromotionCreate = req.body;
      const promotion = await promotionService.createPromotion(promotionData);
      res.status(201).json(promotion);
    } catch (error) {
      next(error);
    }
  },

  // Update promotion (admin)
  async updatePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: Partial<IPromotionCreate> = req.body;
      const promotion = await promotionService.updatePromotion(
        Number(id),
        updateData
      );
      res.json(promotion);
    } catch (error) {
      next(error);
    }
  },

  // Delete promotion (admin)
  async deletePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await promotionService.deletePromotion(Number(id));
      res.json({
        message: 'Promotion deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Toggle promotion status (admin)
  async togglePromotionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const promotion = await promotionService.togglePromotionStatus(
        Number(id)
      );
      res.json(promotion);
    } catch (error) {
      next(error);
    }
  },

  // Validate promotion code
  async validatePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, orderTotal } = req.body;

      if (!code || !orderTotal) {
        throw new AppError('Promotion code and order total are required', 400);
      }

      const result = await promotionService.validatePromotion(code, orderTotal);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // Get promotion statistics (admin)
  async getPromotionStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await promotionService.getPromotionStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
