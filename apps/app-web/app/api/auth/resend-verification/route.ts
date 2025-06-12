import { NextRequest, NextResponse } from 'next/server'
import { createVerificationCode, sendVerificationEmail } from '@/lib/email-verification'
import { db } from '@/lib/db-adapter'

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'login' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Get user by email
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Create new verification code
    const verification = await createVerificationCode(user.id, email, type)

    // Send verification email
    await sendVerificationEmail(email, verification.code)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}