import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that require authentication
const protectedPaths = ['/users', '/companies', '/settings', '/reports'];

// Add paths that should redirect to home if already authenticated
const authPaths = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken');
  const adminRole = request.cookies.get('adminRole');

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Redirect to login if accessing protected path without token or admin role
  if (isProtectedPath && (!accessToken || !adminRole)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify admin role (simplified)
  if (
    isProtectedPath &&
    adminRole &&
    adminRole.value !== 'MANAGER' &&
    adminRole.value !== 'SUPER_ADMIN'
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to home if accessing auth pages while authenticated as admin
  if (isAuthPath && accessToken && adminRole) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
