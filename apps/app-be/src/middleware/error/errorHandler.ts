import { Request, Response } from "express";
import { ErrorCode, HttpStatus, ApiErrorResponse } from "@app/shared-types";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string = ErrorCode.INTERNAL_ERROR,
    details?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Alias for compatibility
export const AppError = ApiError;

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response
): void => {
  const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = error.message || "Internal Server Error";
  const code = error.code || ErrorCode.INTERNAL_ERROR;

  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    statusCode,
    path: req.path,
    method: req.method,
  });

  const errorResponse: ApiErrorResponse = {
    code,
    message,
    details: error.details,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json({
    error: errorResponse,
  });
};
