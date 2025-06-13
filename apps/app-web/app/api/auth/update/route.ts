import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// PATCH /api/auth/update - Update current user's profile
export async function PATCH(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { name, email } = await request.json();

    // Log the update attempt for debugging
    console.log(
      `Attempting to update user ${user.id} with name=${name}, email=${email}`
    );

    // Update user profile
    const updatedUser = await sql`
      UPDATE users
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email)
      WHERE id = ${user.id}
      RETURNING id, name, email
    `;

    if (!Array.isArray(updatedUser) || updatedUser.length === 0) {
      console.error('Update query executed but returned no results');
      return NextResponse.json(
        { error: 'User update failed' },
        { status: 500 }
      );
    }

    console.log('User updated successfully:', updatedUser[0]);

    // Return updated user
    return NextResponse.json({
      user: updatedUser[0],
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
