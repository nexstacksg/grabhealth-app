import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/services/api-client';
import { ApiResponse } from '@app/shared-types';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken');

    if (!refreshToken) {
      return NextResponse.json(
        { error: { message: 'No refresh token' } },
        { status: 401 }
      );
    }

    // Call backend refresh endpoint
    const response = await apiClient.post<ApiResponse<RefreshResponse>>('/auth/refresh', {
      refreshToken: refreshToken.value,
    });

    const data = response as unknown as ApiResponse<RefreshResponse>;

    if (!data.success || !data.data) {
      // Clear invalid cookies
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      
      return NextResponse.json(
        { error: { message: 'Token refresh failed' } },
        { status: 401 }
      );
    }

    // Set new tokens
    cookieStore.set('accessToken', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    cookieStore.set('refreshToken', data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear cookies on error
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    
    const err = error as { message?: string; status?: number; code?: string };
    
    return NextResponse.json(
      { 
        error: { 
          message: err.message || 'Token refresh failed',
          code: err.code 
        } 
      },
      { status: err.status || 401 }
    );
  }
}