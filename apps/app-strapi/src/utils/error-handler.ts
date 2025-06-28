/**
 * Error handler utility for consistent error responses
 */

interface ErrorResponse {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

export class ApplicationError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, details);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Main error handler function
 */
export const handleError = (error: any, ctx: any): ErrorResponse => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Default error structure
  let errorResponse: ErrorResponse = {
    error: {
      status: 500,
      name: 'InternalServerError',
      message: 'An error occurred while processing your request',
    },
  };

  // Handle known application errors
  if (error instanceof ApplicationError) {
    errorResponse.error = {
      status: error.status,
      name: error.name,
      message: error.message,
      ...(isDevelopment && error.details && { details: error.details }),
    };
  } 
  // Handle Strapi errors
  else if (error.status) {
    errorResponse.error = {
      status: error.status,
      name: error.name || 'Error',
      message: error.message || 'An error occurred',
      ...(isDevelopment && error.details && { details: error.details }),
    };
  }
  // Handle validation errors from libraries
  else if (error.name === 'ValidationError') {
    errorResponse.error = {
      status: 400,
      name: 'ValidationError',
      message: error.message,
      ...(isDevelopment && error.errors && { details: error.errors }),
    };
  }
  // Handle generic errors
  else {
    errorResponse.error = {
      status: 500,
      name: error.name || 'InternalServerError',
      message: isDevelopment ? error.message : 'An error occurred while processing your request',
      ...(isDevelopment && { details: error.stack }),
    };
  }

  // Log error in development
  if (isDevelopment) {
    console.error('Error:', error);
  }

  // Set response status
  ctx.status = errorResponse.error.status;

  return errorResponse;
};

/**
 * Async error wrapper for controllers
 */
export const asyncHandler = (fn: Function) => {
  return async (ctx: any) => {
    try {
      await fn(ctx);
    } catch (error) {
      ctx.body = handleError(error, ctx);
    }
  };
};

/**
 * Validate required fields
 */
export const validateRequired = (data: any, fields: string[]): void => {
  const missingFields = fields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields }
    );
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

/**
 * Validate date format and ensure it's in the future
 */
export const validateFutureDate = (date: string | Date): void => {
  const inputDate = new Date(date);
  
  if (isNaN(inputDate.getTime())) {
    throw new ValidationError('Invalid date format');
  }
  
  if (inputDate <= new Date()) {
    throw new ValidationError('Date must be in the future');
  }
};

/**
 * Validate time format (HH:MM)
 */
export const validateTimeFormat = (time: string): void => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new ValidationError('Invalid time format. Expected HH:MM');
  }
};

/**
 * Validate that end time is after start time
 */
export const validateTimeRange = (startTime: string, endTime: string): void => {
  validateTimeFormat(startTime);
  validateTimeFormat(endTime);
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  if (endTotalMinutes <= startTotalMinutes) {
    throw new ValidationError('End time must be after start time');
  }
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<[^>]*>?/gm, '');
};

/**
 * Parse and validate pagination parameters
 */
export const parsePagination = (ctx: any) => {
  const page = parseInt(ctx.query.page as string) || 1;
  const pageSize = parseInt(ctx.query.pageSize as string) || 10;
  
  if (page < 1) {
    throw new ValidationError('Page must be greater than 0');
  }
  
  if (pageSize < 1 || pageSize > 100) {
    throw new ValidationError('Page size must be between 1 and 100');
  }
  
  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
};