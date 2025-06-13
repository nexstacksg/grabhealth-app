import { NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { setUserUpline, initializeCommissionTables } from '@/lib/commission';

export async function POST(request: Request) {
  try {
    const { name, email, password, referrerId } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser(name, email, password);

    // Process referral if referrerId is provided
    if (referrerId) {
      try {
        // Initialize commission tables if needed
        await initializeCommissionTables();

        // Set the referrer as the user's upline
        await setUserUpline(user.id, parseInt(referrerId), 1);
      } catch (referralError) {
        console.error('Error processing referral:', referralError);
        // We don't want to fail registration if referral processing fails
        // Just log the error and continue
      }
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate email error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
