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

// ============ Order Actions ============

export async function getMyOrdersAction(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  try {
    // Get current user first
    const userResult = await getCurrentUserAction();
    if (!userResult.success || !userResult.user) {
      return {
        success: false,
        orders: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }

    // Build query params
    const queryParams = new URLSearchParams();
    
    // Filter by current user ID
    queryParams.append('filters[user][id][$eq]', userResult.user.id.toString());
    
    if (params?.status) {
      queryParams.append('filters[status][$eq]', params.status);
    }
    
    if (params?.page) {
      queryParams.append('pagination[page]', params.page.toString());
    }
    
    if (params?.limit) {
      queryParams.append('pagination[pageSize]', params.limit.toString());
    }
    
    // Populate relations using Strapi 5 syntax
    queryParams.append('populate[user][fields]', 'id,username,email');
    queryParams.append('populate[items][populate]', 'product');
    
    // Sort by creation date (newest first)
    queryParams.append('sort', 'createdAt:desc');

    const result = await serverApiGet(`/orders?${queryParams.toString()}`);
    
    if (result.success && result.data) {
      const pagination = result.data.meta?.pagination || {};
      return {
        success: true,
        orders: result.data.data || [],
        total: pagination.total || 0,
        page: pagination.page || 1,
        totalPages: pagination.pageCount || 1,
      };
    }
    
    return {
      success: false,
      orders: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return {
      success: false,
      orders: [],
      total: 0,
      page: 1,
      totalPages: 0,
      error: error.message || 'Failed to fetch orders',
    };
  }
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