import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/admin',
  '/commission',
  '/orders',
  '/cart/checkout',
  '/membership',
  '/rank-rewards'
];

// Auth pages that should redirect to home if already authenticated
const authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/products',
  '/faq',
  '/terms',
  '/privacy',
  '/shipping-policy',
  '/refund-policy',
  '/partners',
  '/promotions'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken');

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));
  const isPublicPath = publicPaths.some((path) => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Redirect to login if accessing protected path without token
  if (isProtectedPath && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if accessing auth pages while authenticated
  if (isAuthPath && accessToken) {
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
