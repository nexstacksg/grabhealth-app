/**
 * Server-Side Authentication Utilities
 * 
 * For use in Server Components, Server Actions, and API Routes only
 */

import { cookies } from 'next/headers';
import { IUserPublic } from '@app/shared-types';
import { apiClient } from './api-client';
import { transformStrapiUser } from '@/services/strapi-base';

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Set authentication cookies (server-side only)
 */
export async function setAuthCookies(accessToken: string, refreshToken?: string, userRole?: string) {
  const cookieStore = await cookies();
  
  cookieStore.set('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  
  if (refreshToken) {
    cookieStore.set('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
  
  if (userRole) {
    cookieStore.set('userRole', userRole, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  }
}

/**
 * Clear authentication cookies (server-side only)
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('userRole');
}

/**
 * Get current user from server context
 */
export async function getServerUser(): Promise<IUserPublic | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    
    if (!accessToken) {
      return null;
    }
    
    const strapiUser = await apiClient.get('/users/me?populate=*');
    return transformStrapiUser(strapiUser);
  } catch (error) {
    console.error('Failed to get server user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated on server
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has('accessToken');
}

/**
 * Transform login/register data to auth cookies
 */
export interface AuthData {
  user: IUserPublic;
  accessToken: string;
  refreshToken?: string;
}