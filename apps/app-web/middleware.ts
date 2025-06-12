import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth/")
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth/")

  // If trying to access auth pages while logged in, redirect to home
  if (isAuthRoute && session && !request.nextUrl.pathname.includes("/logout")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Allow API routes to handle their own authentication
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // For protected routes, redirect to login if not authenticated
  // Add your protected routes here
  // Note: Commission and rank-rewards pages use server-side authentication instead
  const protectedRoutes = ["/dashboard", "/profile", "/orders"]
  
  if (!session && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api/auth (API routes that handle authentication)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
