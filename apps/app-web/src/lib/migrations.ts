import { sql } from './db';
import { hashPassword, generateSalt } from './auth';

export async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Add role column to users table if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'role') THEN
          ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer';
        END IF;
      END $$;
    `;

    // Check if admin user exists
    const adminExists = await sql`
      SELECT * FROM users WHERE email = 'kyits485@gmail.com'
    `;

    if (adminExists.length === 0) {
      // Create admin user
      const salt = generateSalt();
      const passwordHash = hashPassword('password', salt);

      await sql`
        INSERT INTO users (name, email, password_hash, password_salt, role)
        VALUES ('Admin User', 'kyits485@gmail.com', ${passwordHash}, ${salt}, 'admin')
      `;
      console.log('Created admin user with email: kyits485@gmail.com');
    } else {
      // Update existing user to admin role
      await sql`
        UPDATE users 
        SET role = 'admin' 
        WHERE email = 'kyits485@gmail.com'
      `;
      console.log('Updated existing user to admin role');
    }

    // Create account_requests table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS account_requests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create user_networks table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS user_networks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        level INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}
