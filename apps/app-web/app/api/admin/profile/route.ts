import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser, hashPassword, generateSalt } from '@/lib/auth';

// Update admin profile
export async function POST(request: Request) {
  try {
    // Check if the user is authenticated and is an admin
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { name, password, confirmPassword } = data;

    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update user name
    await sql`
      UPDATE users
      SET name = ${name}
      WHERE id = ${user.id}
    `;

    // If password is provided, update it
    if (password) {
      if (password !== confirmPassword) {
        return NextResponse.json(
          { error: 'Passwords do not match' },
          { status: 400 }
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);

      await sql`
        UPDATE users
        SET password_hash = ${passwordHash}, password_salt = ${salt}
        WHERE id = ${user.id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
