import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';
import { createHash, randomBytes } from 'crypto';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Initialize database connection
let sql: ReturnType<typeof neon>;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  sql = neon(process.env.DATABASE_URL);
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw new Error('Database connection failed');
}

// Hash password with salt
function hashPassword(password: string, salt: string): string {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get the current user ID from the session cookie
    const cookieStore = await cookies();
    const sessionCookie = (
      cookieStore as unknown as {
        get: (name: string) => { value: string } | undefined;
      }
    ).get('session');

    if (!sessionCookie?.value) {
      console.error('No session cookie found');
      return NextResponse.json(
        { error: 'You must be signed in to change your password' },
        { status: 401 }
      );
    }

    // Parse the session data
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (error) {
      console.error('Error parsing session cookie:', error);
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessionData.userId;

    if (!userId) {
      console.error('No user ID found in session');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get the current user with their password hash and salt
    const users = await sql`
      SELECT id, email, password_hash, password_salt 
      FROM users 
      WHERE id = ${userId}
    `;

    // Convert to array if it's not already
    const userArray = Array.isArray(users) ? users : [users];

    if (!userArray.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userArray[0] as {
      id: number;
      email: string;
      password_hash: string;
      password_salt: string;
    };

    // Verify current password
    const hashedPassword = hashPassword(
      currentPassword,
      userData.password_salt
    );
    if (hashedPassword !== userData.password_hash) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Generate new salt and hash the new password
    const newSalt = randomBytes(16).toString('hex');
    const newHashedPassword = hashPassword(newPassword, newSalt);

    // Update the password in the database
    await sql`
      UPDATE users 
      SET password_hash = ${newHashedPassword}, password_salt = ${newSalt}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'An error occurred while changing your password' },
      { status: 500 }
    );
  }
}
