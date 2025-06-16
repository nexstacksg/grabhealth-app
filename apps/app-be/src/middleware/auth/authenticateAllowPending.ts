import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../config/jwt';
import { extractBearerToken } from '../../utils/auth';
import { ApiError } from '../error/errorHandler';
import prisma from '../../database/client';
import { UserRole, UserStatus } from '@app/shared-types';
import cacheService from '../../services/cache';
import { AuthRequest } from './authenticate';

/**
 * Authentication middleware that allows PENDING_VERIFICATION users
 * Used for endpoints that pending users need to access (like verification endpoints)
 */
export const authenticateAllowPending = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header or cookies
    let token = extractBearerToken(req.headers.authorization);

    // If no token in header, check cookies
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError('No token provided', 401, 'NO_TOKEN');
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Try to get user from cache first
    const cacheKey = cacheService.generateKey('user', payload.userId);
    const cachedUser = await cacheService.get(cacheKey);

    let user;
    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      // Get user from database
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (user) {
        // Cache user for 5 minutes
        await cacheService.set(cacheKey, JSON.stringify(user), 300);
      }
    }

    if (!user) {
      throw new ApiError('User not found', 401, 'USER_NOT_FOUND');
    }

    // Allow ACTIVE and PENDING_VERIFICATION users
    if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING_VERIFICATION) {
      throw new ApiError('Account is not allowed', 403, 'ACCOUNT_NOT_ALLOWED');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      status: user.status as UserStatus,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError('Invalid token', 401, 'INVALID_TOKEN'));
    }
  }
};