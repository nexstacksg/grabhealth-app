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
    // For registration, we need to call the custom auth API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    const url = `${baseUrl}/api/custom-auth/register`;
    
    console.log('[RegisterAction] Calling custom auth:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
      }),
    });
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { error: { message: await response.text() } };
    }
    
    if (!response.ok) {
      console.error('[RegisterAction] Error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      throw new Error(responseData?.error?.message || responseData?.message || `Registration failed: ${response.statusText}`);
    }
    
    // Transform the response
    console.log('[RegisterAction] Raw user data:', responseData.user);
    const user = transformStrapiUser(responseData.user);
    console.log('[RegisterAction] Transformed user:', user);
    
    // Set httpOnly cookies for security
    const userRole = user.role || 'public';
    await setAuthCookies(responseData.jwt, responseData.jwt, userRole);
    
    return { 
      success: true as const, 
      user,
      message: responseData.message 
    };
  } catch (error: any) {
    console.error('[RegisterAction] Exception:', error);
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