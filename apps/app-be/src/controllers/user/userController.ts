import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth/authenticate';
import { ApiError } from '../../middleware/error/errorHandler';
import {
  ApiResponse,
  HttpStatus,
  ErrorCode,
  UserRole,
} from '@app/shared-types';
import userService from '../../services/user/userService';

export const createUser = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    // Only admins and managers can create users
    if (req.user.role === UserRole.USER) {
      throw new ApiError(
        'Permission denied',
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN
      );
    }

    const user = await userService.createUser(req.body);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserList = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const { page, limit, sortBy, sortOrder, role, status, search } = req.query;

    const filters: any = {};
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await userService.getUserList(filters, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const user = await userService.getUserById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    // Users can update their own profile, managers/admins can update others
    if (req.user.id !== req.params.id && req.user.role === UserRole.USER) {
      throw new ApiError(
        'Permission denied',
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN
      );
    }

    const user = await userService.updateUser(req.params.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    // Only admins can delete users
    if (
      req.user.role !== UserRole.SUPER_ADMIN &&
      req.user.role !== UserRole.MANAGER
    ) {
      throw new ApiError(
        'Permission denied',
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN
      );
    }

    await userService.deleteUser(req.params.id);

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    // Only managers and admins can update user status
    if (req.user.role === UserRole.USER) {
      throw new ApiError(
        'Permission denied',
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN
      );
    }

    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.status
    );

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const user = await userService.updateUser(req.user.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const user = await userService.getUserById(req.user.id);

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const { oldPassword, newPassword } = req.body;

    await userService.changePassword(req.user.id, oldPassword, newPassword);

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getFreeCheckupStatus = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const { id } = req.params;
    const status = await userService.getFreeCheckupStatus(id);

    const response: ApiResponse = {
      success: true,
      data: status,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const claimFreeCheckup = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const { id } = req.params;
    await userService.claimFreeCheckup(id);

    const response: ApiResponse = {
      success: true,
      message: 'Free checkup claimed successfully',
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};
