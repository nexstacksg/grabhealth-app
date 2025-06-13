import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    const refreshToken = cookieStore.get('refreshToken');

    // Call backend logout if tokens exist
    if (accessToken && refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken.value}`,
          },
          body: JSON.stringify({ refreshToken: refreshToken.value }),
        });
      } catch {
        // Ignore backend logout errors
      }
    }

    // Clear cookies
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('adminRole');

    return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
  } catch {
    return NextResponse.json(
      { error: { message: 'Logout failed' } },
      { status: 500 }
    );
  }
}
