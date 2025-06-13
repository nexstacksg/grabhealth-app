import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserRole } from '@app/shared-types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || { message: 'Login failed' } },
        { status: response.status }
      );
    }

    // Verify user is an admin or manager (simplified check)
    if (
      data.data.user.role !== UserRole.MANAGER &&
      data.data.user.role !== UserRole.SUPER_ADMIN
    ) {
      return NextResponse.json(
        { error: { message: 'Access denied. Admin privileges required.' } },
        { status: 403 }
      );
    }

    // Set secure HTTP-only cookies
    const cookieStore = await cookies();

    console.log('Login API - Setting cookies for user:', data.data.user.email);

    // Access token - shorter expiry
    cookieStore.set('accessToken', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // Refresh token - longer expiry
    cookieStore.set('refreshToken', data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Admin role cookie for quick checks
    cookieStore.set('adminRole', data.data.user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    console.log('Login API - Cookies set successfully');

    // Return user data without tokens
    return NextResponse.json({
      success: true,
      data: {
        user: data.data.user,
        company: data.data.company,
      },
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
