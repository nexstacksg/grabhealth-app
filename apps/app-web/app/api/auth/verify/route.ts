import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/email-verification'
import { db } from '@/lib/db-adapter'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, code, type = 'login' } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Verify the code
    const result = await verifyCode(email, code, type)

    if (result.success && result.userId) {
      // Get user details
      const user = await db.getUserById(result.userId)
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        )
      }

      // Set session cookie for login
      if (type === 'login') {
        const sessionData = JSON.stringify({
          userId: user.id,
          email: user.email,
          role: user.role,
          created_at: Date.now()
        })

        cookies().set('user_session', sessionData, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        })
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    }

    return NextResponse.json(
      { success: false, message: result.message },
      { status: 400 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during verification' },
      { status: 500 }
    )
  }
}