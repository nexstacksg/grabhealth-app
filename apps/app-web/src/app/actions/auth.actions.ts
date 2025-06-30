'use server';

import { serverApiGet, serverApiPost } from '@/lib/server-api';
import { authService } from '@/services';
import { LoginRequest, RegisterRequest } from '@app/shared-types';
import { transformStrapiUser } from '@/services/strapi-base';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth-utils-server';

/**
 * Server action for user login
 * Sets httpOnly cookies for secure authentication
 */
export async function loginAction(data: LoginRequest) {
  try {
    const authData = await authService.login(data);
    
    // Set httpOnly cookies for security
    // Extract role properly - authData.user.role is already a string after transformation
    const userRole = authData.user.role || 'authenticated';
    await setAuthCookies(authData.accessToken, authData.refreshToken, userRole);
    
    return { success: true as const, user: authData.user };
  } catch (error: any) {
    return { 
      success: false as const, 
      error: error.message || 'Invalid email or password' 
    };
  }
}

/**
 * Server action for user registration
 * Sets httpOnly cookies upon successful registration
 */
export async function registerAction(data: RegisterRequest) {
  try {
    const authData = await authService.register(data);
    
    // Set httpOnly cookies for security
    // Extract role properly - authData.user.role is already a string after transformation
    const userRole = authData.user.role || 'authenticated';
    await setAuthCookies(authData.accessToken, authData.refreshToken, userRole);
    
    return { success: true as const, user: authData.user };
  } catch (error: any) {
    return { 
      success: false as const, 
      error: error.message || 'Registration failed' 
    };
  }
}

/**
 * Server action for user logout
 * Clears authentication cookies
 */
export async function logoutAction() {
  await clearAuthCookies();
  
  return { success: true };
}

/**
 * Server action to get current authenticated user
 * Uses httpOnly cookies for authentication
 */
export async function getCurrentUserAction() {
  const result = await serverApiGet('/users/me?populate=*');
  
  if (result.success && result.data) {
    const transformedUser = transformStrapiUser(result.data);
    return { success: true, user: transformedUser };
  }
  
  return { success: false, user: null };
}