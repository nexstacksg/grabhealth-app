import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/commission',
  '/orders',
  '/cart/checkout',
  '/membership'
];

// Partner paths that require partner role
const partnerPaths = ['/partner'];

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
  '/partners'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');
  const userRole = request.cookies.get('userRole')?.value;

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isPartnerPath = partnerPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Handle partner routes - require both authentication and partner role
  if (isPartnerPath) {
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user has partner role (role is stored in uppercase)
    if (userRole !== 'PARTNER') {
      // Redirect to home page if not a partner
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect to login if accessing protected path without token
  if (isProtectedPath && !accessToken && !refreshToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // Create response with cache headers to prevent showing stale content
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }

  // Redirect to home if accessing auth pages while authenticated
  if (isAuthPath && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // For protected paths, add cache headers to prevent stale content
  if (isProtectedPath || isPartnerPath) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
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
