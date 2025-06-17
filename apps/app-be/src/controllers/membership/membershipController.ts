import { Request, Response, NextFunction } from 'express';
import { MembershipService } from '../../services/membership/membershipService';
import prisma from '../../database/client';
import { AppError } from '../../middleware/error/errorHandler';
import { IMembershipCreate, MembershipStatus } from '@app/shared-types';

const membershipService = new MembershipService(prisma);

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const membershipController = {
  // Get all membership tiers
  async getMembershipTiers(_req: Request, res: Response, next: NextFunction) {
    try {
      const tiers = await membershipService.getMembershipTiers();
      res.json({
        success: true,
        data: tiers,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get membership tier by ID
  async getMembershipTier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tier = await membershipService.getMembershipTier(Number(id));

      if (!tier) {
        throw new AppError('Membership tier not found', 404);
      }

      res.json({
        success: true,
        data: tier,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create membership tier (admin)
  async createMembershipTier(req: Request, res: Response, next: NextFunction) {
    try {
      const tierData: IMembershipCreate = req.body;
      const tier = await membershipService.createMembershipTier(tierData);
      res.status(201).json({
        success: true,
        data: tier,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update membership tier (admin)
  async updateMembershipTier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: Partial<IMembershipCreate> = req.body;
      const tier = await membershipService.updateMembershipTier(
        Number(id),
        updateData
      );
      res.json({
        success: true,
        data: tier,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user membership
  async getUserMembership(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const membership = await membershipService.getUserMembership(req.user.id);
      res.json({
        success: true,
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  },

  // Subscribe to membership
  async subscribeMembership(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { tierId } = req.body;
      const membership = await membershipService.createUserMembership(
        req.user.id,
        tierId
      );
      res.status(201).json({
        success: true,
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  },

  // Cancel membership
  async cancelMembership(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const membership = await membershipService.cancelUserMembership(
        req.user.id
      );
      res.json({
        success: true,
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update auto-renewal
  async updateAutoRenew(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { autoRenew } = req.body;
      const membership = await membershipService.updateAutoRenew(
        req.user.id,
        autoRenew
      );
      res.json({
        success: true,
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all user memberships (admin)
  async getAllUserMemberships(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as MembershipStatus,
        tierId: req.query.tierId ? Number(req.query.tierId) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await membershipService.getAllUserMemberships(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get membership statistics (admin)
  async getMembershipStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await membershipService.getMembershipStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  // Process expired memberships (admin)
  async processExpiredMemberships(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const count = await membershipService.processExpiredMemberships();
      res.json({
        success: true,
        data: {
          processedCount: count,
          message: `Processed ${count} expired memberships`,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
