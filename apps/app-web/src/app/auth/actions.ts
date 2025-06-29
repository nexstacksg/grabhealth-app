'use server';

import { cookies } from 'next/headers';
import { authService } from '@/services';
import { LoginRequest, RegisterRequest } from '@app/shared-types';
import { transformStrapiUser } from '@/services/strapi-base';

export async function loginAction(data: LoginRequest) {
  try {
    const authData = await authService.login(data);
    
    const cookieStore = await cookies();
    
    // Set httpOnly cookies for security
    cookieStore.set('accessToken', authData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    if (authData.refreshToken) {
      cookieStore.set('refreshToken', authData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }
    
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
    
    const cookieStore = await cookies();
    
    // Set httpOnly cookies for security
    cookieStore.set('accessToken', authData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    if (authData.refreshToken) {
      cookieStore.set('refreshToken', authData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }
    
    return { success: true as const, user: authData.user };
  } catch (error: any) {
    return { 
      success: false as const, 
      error: error.message || 'Registration failed' 
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  
  return { success: true };
}

export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken');
    
    if (!token) {
      return { success: false, user: null };
    }
    
    // Make direct API call with token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/users/me?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    const userData = await response.json();
    const transformedUser = transformStrapiUser(userData);
    
    return { success: true, user: transformedUser };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return { success: false, user: null };
  }
}