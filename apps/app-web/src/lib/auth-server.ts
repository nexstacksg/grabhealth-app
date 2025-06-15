import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiClient } from '@/services/api-client';
import { IUserPublic, ApiResponse } from '@app/shared-types';

/**
 * Server-side authentication utilities for use in Server Components and Server Actions
 */

/**
 * Get the current authenticated user from server-side context
 * Returns null if not authenticated
 */
export async function getServerUser(): Promise<IUserPublic | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      return null;
    }

    // Call backend with auth header
    const response = await apiClient.get<ApiResponse<{ user: IUserPublic }>>('/auth/profile', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });

    const data = response as unknown as ApiResponse<{ user: IUserPublic }>;

    if (!data.success || !data.data) {
      return null;
    }

    return data.data.user;
  } catch (error) {
    console.error('Failed to get server user:', error);
    return null;
  }
}

/**
 * Get the current authenticated user, redirecting to login if not authenticated
 */
export async function requireServerUser(): Promise<IUserPublic> {
  const user = await getServerUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

/**
 * Check if user is authenticated on server-side
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return user !== null;
}

/**
 * Require specific user role, redirecting if not authorized
 */
export async function requireServerRole(requiredRole: string): Promise<IUserPublic> {
  const user = await requireServerUser();
  
  if (user.role !== requiredRole) {
    redirect('/'); // Redirect to home if not authorized
  }
  
  return user;
}

/**
 * Require admin role
 */
export async function requireServerAdmin(): Promise<IUserPublic> {
  return requireServerRole('ADMIN');
}

/**
 * Get auth headers for making authenticated requests from server
 */
export async function getServerAuthHeaders(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    
    return accessToken ? { Authorization: `Bearer ${accessToken.value}` } : {};
  } catch {
    return {};
  }
}

/**
 * Clear authentication cookies (for server actions)
 */
export async function clearServerAuth(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}