import { UserRole, AuthGuardOptions, AuthGuardResult } from '@app/shared-types';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

/**
 * AuthGuardService - Handles route protection logic
 * Extracted from useAuthGuard hook business logic
 */
export class AuthGuardService {
  /**
   * Check if user is authorized to access a route
   * @param user - Current user object (null if not authenticated)
   * @param options - Authorization options
   * @returns Authorization result with redirect information
   */
  checkAuthorization(
    user: User | null,
    options: AuthGuardOptions = {}
  ): AuthGuardResult {
    const { redirectTo = '/auth/login', requiredRole, allowedRoles } = options;

    // Check if user is authenticated
    if (!user) {
      return {
        isAuthorized: false,
        redirectPath: redirectTo,
        reason: 'not_authenticated',
      };
    }

    // Check specific role requirement
    if (requiredRole && user.role !== requiredRole) {
      return {
        isAuthorized: false,
        redirectPath: '/',
        reason: 'insufficient_role',
      };
    }

    // Check allowed roles list
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        return {
          isAuthorized: false,
          redirectPath: '/',
          reason: 'role_not_allowed',
        };
      }
    }

    return {
      isAuthorized: true,
    };
  }

  /**
   * Check if authenticated user should be redirected away from auth pages
   * @param user - Current user object
   * @param redirectTo - Where to redirect authenticated users
   * @returns Redirect information
   */
  checkRedirectIfAuthenticated(
    user: User | null,
    redirectTo: string = '/'
  ): { shouldRedirect: boolean; redirectPath?: string } {
    if (user) {
      return {
        shouldRedirect: true,
        redirectPath: redirectTo,
      };
    }

    return {
      shouldRedirect: false,
    };
  }

  /**
   * Get user-friendly error message for authorization failures
   * @param reason - The reason for authorization failure
   * @returns Human-readable error message
   */
  getAuthorizationErrorMessage(reason: string): string {
    switch (reason) {
      case 'not_authenticated':
        return 'Please log in to access this page.';
      case 'insufficient_role':
        return 'You do not have the required permissions to access this page.';
      case 'role_not_allowed':
        return 'Your account type is not authorized to access this page.';
      default:
        return 'Access denied. Please contact support if you believe this is an error.';
    }
  }

  /**
   * Check if user has any of the specified roles
   * @param user - Current user object
   * @param roles - Array of roles to check against
   * @returns True if user has any of the specified roles
   */
  hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    if (!user || !roles.length) return false;
    return roles.includes(user.role);
  }

  /**
   * Check if user has a specific role
   * @param user - Current user object
   * @param role - Role to check for
   * @returns True if user has the specified role
   */
  hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    return user.role === role;
  }

  /**
   * Check if user is a super admin
   * @param user - Current user object
   * @returns True if user is a super admin
   */
  isSuperAdmin(user: User | null): boolean {
    return this.hasRole(user, UserRole.SUPER_ADMIN);
  }

  /**
   * Check if user has admin-level privileges (SUPER_ADMIN, COMPANY, MANAGER)
   * @param user - Current user object
   * @returns True if user has admin-level privileges
   */
  hasAdminPrivileges(user: User | null): boolean {
    return this.hasAnyRole(user, [
      UserRole.SUPER_ADMIN,
      UserRole.COMPANY,
      UserRole.MANAGER,
    ]);
  }

  /**
   * Check if user is a partner
   * @param user - Current user object
   * @returns True if user is a partner
   */
  isPartner(user: User | null): boolean {
    return this.hasRole(user, UserRole.PARTNER);
  }
}
