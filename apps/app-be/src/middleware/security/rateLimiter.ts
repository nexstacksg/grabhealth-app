import rateLimit from 'express-rate-limit';

// General rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs (increased from 100)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for authenticated users on certain endpoints
    const isAuthenticated = req.headers.authorization || req.cookies?.accessToken;
    const isUserEndpoint = req.path.includes('/users/') || req.path.includes('/bookings');
    return !!(isAuthenticated && isUserEndpoint);
  }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Very strict rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification rate limiter
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 email verification requests per hour
  message: 'Too many email verification attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create account limiter
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creation requests per hour
  message: 'Too many accounts created from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true, // Don't count failed requests (e.g., validation errors)
});
