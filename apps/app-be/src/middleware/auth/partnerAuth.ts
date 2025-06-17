import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import prisma from '../../database/client';

export async function requirePartnerAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // First check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    // Check if user has PARTNER role
    if (req.user.role !== 'PARTNER' && req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Partner access required'
        }
      });
      return;
    }

    // Get partner details if user is a partner
    if (req.user.role === 'PARTNER' && req.user.partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: req.user.partnerId }
      });

      if (!partner || !partner.isActive) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Partner account is not active'
          }
        });
        return;
      }

      // Attach partner info to request
      (req as any).partner = partner;
    }

    next();
  } catch (error) {
    console.error('Partner auth error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication error'
      }
    });
    return;
  }
}

export function getPartnerId(req: AuthRequest): string | null {
  if (req.user?.role === 'PARTNER' && req.user.partnerId) {
    return req.user.partnerId;
  }
  
  // For super admin, they might be viewing a specific partner
  if (req.user?.role === 'SUPER_ADMIN' && req.params.partnerId) {
    return req.params.partnerId;
  }
  
  return null;
}