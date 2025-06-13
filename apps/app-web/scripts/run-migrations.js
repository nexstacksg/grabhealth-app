// This script runs the database migrations to add the role column and create the admin user
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

// Initialize database connection
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

if (!sql) {
  console.error(
    'Database connection not initialized. Make sure DATABASE_URL is set in your environment.'
  );
  process.exit(1);
}

// Helper functions
function hashPassword(password, salt) {
  return crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Add role column to users table if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'role') THEN
          ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer';
          RAISE NOTICE 'Added role column to users table';
        ELSE
          RAISE NOTICE 'Role column already exists';
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
    console.log('Ensured account_requests table exists');

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
    console.log('Ensured user_networks table exists');

    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations();
