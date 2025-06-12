import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// Initialize database connection with proper error handling
let sql: NeonQueryFunction<false, false>;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not defined")
  }
  sql = neon(process.env.DATABASE_URL)
} catch (error) {
  console.error("Failed to initialize database connection:", error)
  // Provide a fallback to prevent the app from crashing in development
  sql = neon(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname')
}

// Helper function for typed queries
export async function query<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]> {
  const result = await sql(strings, ...values)
  return result as T[]
}

// Export the SQL client
export { sql }

export default sql
