import { Request, Response, NextFunction } from 'express';
import authService from '../../services/auth/authService';
import { AuthRequest } from '../../middleware/auth/authenticate';
import { ApiError } from '../../middleware/error/errorHandler';
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  EmailVerificationRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ErrorCode,
  HttpStatus,
  ApiResponse,
} from '@app/shared-types';

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);

    // Set httpOnly cookies for tokens
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't send tokens in response body for security
    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        expiresIn: result.expiresIn,
      },
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);

    // Set httpOnly cookies for tokens
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send tokens in response body for frontend use (cookies are backup)
    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request<{}, {}, RefreshTokenRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Get refresh token from cookie instead of body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw new ApiError(
        'Refresh token required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const result = await authService.refreshToken(refreshToken);

    // Set new httpOnly cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send tokens in response body for frontend use (cookies are backup)
    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
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

    await authService.logout(req.user.id);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
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

    const user = await authService.getCurrentUser(req.user.id);

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request<{}, {}, EmailVerificationRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.verifyEmail(req.body.token);

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (
  req: Request<{}, {}, PasswordResetRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.requestPasswordReset(req.body.email);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset email sent if the email exists',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<{}, {}, PasswordResetConfirmRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const verifyEmailCode = async (
  req: Request<{}, {}, { email: string; code: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.verifyEmailCode(req.body.email, req.body.code);

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (
  req: Request<{}, {}, { email: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.resendVerificationCode(req.body.email);

    const response: ApiResponse = {
      success: true,
      message: 'Verification code sent successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
