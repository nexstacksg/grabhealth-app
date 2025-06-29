/**
 * Client-Side Authentication Utilities
 * 
 * For use in Client Components only
 */

/**
 * Client-side cookie utilities
 */
export const clientAuth = {
  /**
   * Get auth token from browser cookies
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = 'accessToken=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated (client-side)
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  /**
   * Clear auth cookies (client-side)
   * Note: Only works for non-httpOnly cookies
   */
  clearCookies() {
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

/**
 * Standard auth error messages
 */
export const AUTH_ERRORS = {
  UNAUTHORIZED: 'Please log in to continue',
  FORBIDDEN: 'You do not have permission to access this resource',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  NETWORK_ERROR: 'Unable to connect to server. Please try again',
} as const;

/**
 * Check if error is auth-related
 */
export function isAuthError(error: any): boolean {
  return error?.status === 401 || error?.status === 403;
}

/**
 * Get appropriate error message for auth errors
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return AUTH_ERRORS.NETWORK_ERROR;
  
  switch (error.status) {
    case 401:
      return AUTH_ERRORS.UNAUTHORIZED;
    case 403:
      return AUTH_ERRORS.FORBIDDEN;
    default:
      return error.message || AUTH_ERRORS.NETWORK_ERROR;
  }
}