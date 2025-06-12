import { NextResponse } from "next/server"
import { verifyCredentials } from "@/lib/auth"
import { createVerificationCode, sendVerificationEmail } from "@/lib/email-verification"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Verify credentials
    const user = await verifyCredentials(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create verification code
    const verification = await createVerificationCode(user.id, email, 'login')

    // Send verification email
    await sendVerificationEmail(email, verification.code)

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      message: "Verification code sent to your email",
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
