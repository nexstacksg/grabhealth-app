import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function POST() {
  try {
    // Clear the authentication cookie
    await clearAuthCookie()
    
    // For API calls, return success JSON
    return NextResponse.json({ success: true, redirectTo: '/' })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Clear the authentication cookie
    await clearAuthCookie()
    
    // Redirect to homepage
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
  }
}
