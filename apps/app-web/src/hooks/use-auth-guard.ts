import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@app/shared-types';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

/**
 * Hook to protect routes based on authentication status and user role
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { 
    redirectTo = '/auth/login', 
    requiredRole,
    allowedRoles 
  } = options;

  useEffect(() => {
    if (isLoading) return;

    // Check if user is authenticated
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements
    if (requiredRole && user.role !== requiredRole) {
      router.push('/');
      return;
    }

    // Check allowed roles
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role as UserRole)) {
        router.push('/');
        return;
      }
    }
  }, [user, isLoading, router, redirectTo, requiredRole, allowedRoles]);

  return { user, isLoading, isAuthenticated: !!user };
}

/**
 * Hook to redirect authenticated users away from auth pages
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}