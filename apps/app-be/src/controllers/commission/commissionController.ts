import { Request, Response, NextFunction } from 'express';
import { CommissionService } from '../../services/commission/commissionService';
import prisma from '../../database/client';
import { AppError } from '../../middleware/error/errorHandler';

const commissionService = new CommissionService(prisma);

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const commissionController = {
  // Initialize commission system for a user
  async initializeCommissionSystem(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      // Check if user already has a relationship entry
      const existingRelationship = await prisma.userRelationship.findFirst({
        where: { userId: req.user.id },
      });

      if (!existingRelationship) {
        // Create a root relationship entry for the user
        await prisma.userRelationship.create({
          data: {
            userId: req.user.id,
            uplineId: null,
            relationshipLevel: 0,
          },
        });
      }

      res.json({
        success: true,
        message: 'Commission system initialized',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get combined commission data
  async getCommissionData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      // Get user's relationship data (upline and downlines)
      const userRelationship = await prisma.userRelationship.findFirst({
        where: { userId: req.user.id },
        include: {
          upline: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Get downlines
      const downlines = await prisma.userRelationship.findMany({
        where: { uplineId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Get user's commissions
      const commissions = await prisma.commission.findMany({
        where: { recipientId: req.user.id },
        include: {
          order: {
            select: {
              total: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to last 100 commissions
      });

      // Calculate total earnings
      const totalEarnings = commissions.reduce(
        (sum: number, commission: { amount: number }) => sum + commission.amount,
        0
      );

      // Generate referral link
      const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/register?referrer=${req.user.id}`;

      res.json({
        success: true,
        data: {
          upline: userRelationship?.upline
            ? {
                id: userRelationship.id,
                user_id: userRelationship.userId,
                upline_id: userRelationship.uplineId,
                relationship_level: userRelationship.relationshipLevel,
                created_at: userRelationship.createdAt,
                updated_at: userRelationship.updatedAt,
                name: `${userRelationship.upline.firstName} ${userRelationship.upline.lastName}`,
                email: userRelationship.upline.email,
              }
            : null,
          downlines: downlines.map((d: any) => ({
            id: d.id,
            user_id: d.userId,
            upline_id: d.uplineId,
            relationship_level: d.relationshipLevel,
            created_at: d.createdAt,
            updated_at: d.updatedAt,
            name: `${d.user.firstName} ${d.user.lastName}`,
            email: d.user.email,
          })),
          commissions: commissions.map((c: any) => ({
            id: c.id,
            order_id: c.orderId,
            user_id: c.userId,
            recipient_id: c.recipientId,
            amount: c.amount,
            commission_rate: c.commissionRate,
            relationship_level: c.relationshipLevel,
            status: c.status,
            created_at: c.createdAt,
            updated_at: c.updatedAt,
            order_total: c.order?.total,
            buyer_name: c.order?.user
              ? `${c.order.user.firstName} ${c.order.user.lastName}`
              : 'Unknown',
          })),
          points: 0, // Points are tracked separately in UserPoints table
          referralLink,
          totalEarnings,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get commission structure - Updated for 4-product model
  async getCommissionStructure(
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Get the new 4-product commission structure from database
      const structure = await commissionService.getProductCommissionStructure();

      res.json({
        success: true,
        data: structure,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user commissions
  async getUserCommissions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const status = req.query.status as string;

      const result = await commissionService.getUserCommissions(
        req.user.id,
        status as 'earned' | 'generated' | undefined
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // Get commission details
  async getCommissionDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const commission = await commissionService.getCommissionDetails(
        Number(id)
      );

      if (!commission) {
        throw new AppError('Commission not found', 404);
      }

      // Check if user has access to this commission
      if (
        req.user?.role !== 'SUPER_ADMIN' &&
        commission.recipientId !== req.user?.id
      ) {
        throw new AppError('Unauthorized access', 403);
      }

      res.json(commission);
    } catch (error) {
      next(error);
    }
  },

  // Get commission statistics
  async getCommissionStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const stats = await commissionService.getCommissionStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  // Get user network
  async getUserNetwork(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const network = await commissionService.getUserNetwork(req.user.id);
      res.json(network);
    } catch (error) {
      next(error);
    }
  },

  // Get network statistics
  async getNetworkStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const stats = await commissionService.getNetworkStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  // Process pending commissions (admin)
  async processPendingCommissions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') {
        throw new AppError('Unauthorized', 403);
      }

      const { commissionIds } = req.body;
      const results =
        await commissionService.processPendingCommissions(commissionIds);
      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get commission summary (admin)
  async getCommissionSummary(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') {
        throw new AppError('Unauthorized', 403);
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const summary = await commissionService.getCommissionSummary({
        startDate,
        endDate,
      });
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },
};
