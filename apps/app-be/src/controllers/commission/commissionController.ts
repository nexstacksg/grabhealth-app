import { Request, Response, NextFunction } from "express";
import { CommissionService } from "../../services/commission.service";
import prisma from "../../database/client";
import { AppError } from "../../middleware/error/errorHandler";

const commissionService = new CommissionService(prisma);

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const commissionController = {
  // Get user commissions
  async getUserCommissions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const status = req.query.status as string;

      const result = await commissionService.getUserCommissions(
        req.user.id,
        status as "earned" | "generated" | undefined
      );

      res.json({
        success: true,
        data: result,
      });
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
        throw new AppError("Commission not found", 404);
      }

      // Check if user has access to this commission
      if (
        req.user?.role !== "SUPER_ADMIN" &&
        commission.recipientId !== req.user?.id
      ) {
        throw new AppError("Unauthorized access", 403);
      }

      res.json({
        success: true,
        data: commission,
      });
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
        throw new AppError("Unauthorized", 401);
      }

      const stats = await commissionService.getCommissionStats(req.user.id);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user network
  async getUserNetwork(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const network = await commissionService.getUserNetwork(req.user.id);
      res.json({
        success: true,
        data: network,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get network statistics
  async getNetworkStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const stats = await commissionService.getNetworkStats(req.user.id);
      res.json({
        success: true,
        data: stats,
      });
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
      if (req.user?.role !== "SUPER_ADMIN") {
        throw new AppError("Unauthorized", 403);
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
      if (req.user?.role !== "SUPER_ADMIN") {
        throw new AppError("Unauthorized", 403);
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
