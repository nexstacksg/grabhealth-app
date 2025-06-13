import { createHash, randomBytes } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Define User type to match database schema
export interface User {
  id: number;
  name: string;
  email: string;
  image_url?: string;
  role?: 'admin' | 'customer' | 'sales' | 'leader' | 'manager' | 'company';
  created_at?: string;
  password_hash?: string;
  password_salt?: string;
}

// Initialize database connection with proper error handling
let sql: ReturnType<typeof neon>;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  sql = neon(process.env.DATABASE_URL);
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  // Provide a fallback to prevent the app from crashing
  sql = neon('postgresql://neondb_owner:placeholder@localhost:5432/neondb');
}

// Initialize users table
export async function initializeUsersTable() {
  try {
    // Drop the table if it exists with issues (CAUTION: This will delete all users data)
    // Uncomment this line if you want to reset the table completely
    // await sql`DROP TABLE IF EXISTS users`

    // Create the table if it doesn't exist with all required columns
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        image_url TEXT,
        password_hash TEXT,
        password_salt TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add image_url column if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'image_url') THEN
          ALTER TABLE users ADD COLUMN image_url TEXT;
        END IF;
      END $$;
    `;

    // Check if the table structure is correct
    const tableColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;

    // Log the current table structure for debugging
    if (Array.isArray(tableColumns) && tableColumns.length > 0) {
      const columns = tableColumns
        .map((col) => {
          // Safely access column_name property
          return col && typeof col === 'object' && 'column_name' in col
            ? col.column_name
            : 'unknown';
        })
        .join(', ');
      console.log(`Current users table columns: ${columns}`);
    }

    console.log('Users table initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing users table:', error);
    throw error;
  }
}

// Hash password with salt
export function hashPassword(password: string, salt: string): string {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

// Generate a random salt
export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

// Create a new user
export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  try {
    // Ensure the table is properly initialized
    await initializeUsersTable();

    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Generate salt and hash the password
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    // Log the values being inserted for debugging
    console.log(
      `Creating user with name: ${name}, email: ${email}, password hash and salt are set`
    );

    // Insert the new user with a simplified query
    try {
      const result = await sql`
        INSERT INTO users (name, email, password_hash, password_salt)
        VALUES (${name}, ${email}, ${passwordHash}, ${salt})
        RETURNING id, name, email, created_at
      `;

      // Check if the insert was successful
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('Failed to create user - no rows returned');
      }

      // Log success
      const newUser = result[0] as User;
      console.log(`User created successfully with ID: ${newUser.id}`);

      // Return the new user
      return newUser;
    } catch (insertError: unknown) {
      console.error('Error during user insertion:', insertError);

      // Try a more detailed error approach
      const tableInfo =
        await sql`SELECT * FROM information_schema.columns WHERE table_name = 'users'`;
      console.log('Table structure:', tableInfo);

      // Handle the error message safely
      const errorMessage =
        insertError instanceof Error ? insertError.message : 'Unknown error';
      throw new Error(`Failed to insert user: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Verify user credentials
export async function verifyCredentials(email: string, password: string) {
  await initializeUsersTable();

  const users = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (!Array.isArray(users) || users.length === 0) {
    return null;
  }

  const user = users[0] as User;

  // Check if password_salt exists
  if (!user.password_salt || !user.password_hash) {
    return null;
  }

  const passwordHash = hashPassword(password, user.password_salt);

  if (passwordHash !== user.password_hash) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'customer',
  };
}

// Set authentication cookie
export async function setAuthCookie(userId: number) {
  // In a real application, you would use JWT or another token system
  // For simplicity, we're just storing the user ID
  const sessionValue = JSON.stringify({
    userId,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  // In Next.js, cookies() returns a Promise in newer versions
  const cookieStore = await cookies();
  cookieStore.set('session', sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, // 1 week
    path: '/',
  });
}

// Clear authentication cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Get current user from cookie
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);

    if (session.expires < Date.now()) {
      await clearAuthCookie();
      return null;
    }

    const users =
      await sql`SELECT id, name, email, image_url, role FROM users WHERE id = ${session.userId}`;

    // Check if users is an array and has elements
    if (!Array.isArray(users) || users.length === 0) {
      return null;
    }

    return users[0] as User;
  } catch (error) {
    return null;
  }
}

// Require authentication for protected routes
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    // Redirect to login page if user is not authenticated
    redirect('/auth/login');
  }

  return user;
}
