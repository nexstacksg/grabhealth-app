'use server';

import { serverApiGet, serverApiPost } from '@/lib/server-api';
import { authService } from '@/services';
import { LoginRequest, RegisterRequest } from '@app/shared-types';
import { transformStrapiUser } from '@/services/strapi-base';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth-utils-server';

// ============ Authentication Actions ============

export async function loginAction(data: LoginRequest) {
  try {
    const authData = await authService.login(data);
    
    // Set httpOnly cookies for security
    await setAuthCookies(authData.accessToken, authData.refreshToken);
    
    return { success: true as const, user: authData.user };
  } catch (error: any) {
    return { 
      success: false as const, 
      error: error.message || 'Invalid email or password' 
    };
  }
}

export async function registerAction(data: RegisterRequest) {
  try {
    const authData = await authService.register(data);
    
    // Set httpOnly cookies for security
    await setAuthCookies(authData.accessToken, authData.refreshToken);
    
    return { success: true as const, user: authData.user };
  } catch (error: any) {
    return { 
      success: false as const, 
      error: error.message || 'Registration failed' 
    };
  }
}

export async function logoutAction() {
  await clearAuthCookies();
  
  return { success: true };
}

export async function getCurrentUserAction() {
  const result = await serverApiGet('/users/me?populate=*');
  
  if (result.success && result.data) {
    const transformedUser = transformStrapiUser(result.data);
    return { success: true, user: transformedUser };
  }
  
  return { success: false, user: null };
}

// ============ Booking Actions ============

interface CreateBookingData {
  partnerId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
  isFreeCheckup?: boolean;
}

export async function createBookingAction(data: CreateBookingData) {
  const result = await serverApiPost(
    `/partners/${data.partnerId}/book`,
    {
      serviceId: data.serviceId,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      notes: data.notes || '',
      isFreeCheckup: data.isFreeCheckup || false,
    }
  );
  
  if (result.success) {
    return { success: true, booking: result.data };
  }
  
  return { 
    success: false, 
    error: result.error || 'Failed to create booking',
    details: result.details
  };
}

// ============ Generic API Action ============

/**
 * Generic server action for any authenticated API call
 * This can be used for any endpoint that requires authentication
 */
export async function apiAction<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  body?: any
) {
  const { serverApi } = await import('@/lib/server-api');
  return serverApi<T>(endpoint, { method, body });
}