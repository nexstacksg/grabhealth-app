import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Initialize membership tables
async function initializeMembershipTables() {
  try {
    // Create membership_tiers table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS membership_tiers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create memberships table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS memberships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tier TEXT NOT NULL DEFAULT 'essential',
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Check if membership_tiers has data, if not, insert default tiers
    const tiersCount = await sql`SELECT COUNT(*) FROM membership_tiers`
    
    if (Array.isArray(tiersCount) && tiersCount.length > 0) {
      const count = tiersCount[0].count
      
      if (count === '0' || count === 0) {
        await sql`
          INSERT INTO membership_tiers (name, description)
          VALUES 
            ('Level 1', '30% discount on all products and services'),
            ('Level 2', '10% discount on all products and services'),
            ('Level 3', '5% discount on all products and services'),
            ('Level 4', 'Requires 1000 points to unlock'),
            ('Level 5', 'Requires 400 points to unlock'),
            ('Level 6', 'Requires 200 points to unlock'),
            ('Level 7', 'Requires 100 points to unlock')
        `
      }
    }

    return true
  } catch (error) {
    console.error("Error initializing membership tables:", error)
    throw error
  }
}

// POST /api/membership/join - Join membership program
export async function POST(request: Request) {
  try {
    // Initialize tables
    await initializeMembershipTables()
    
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to join the membership program" }, { status: 401 })
    }
    
    // Get request body
    const { tier = "level7" } = await request.json()
    
    // Check if user already has a membership
    const existingMembership = await sql`
      SELECT id, tier, points
      FROM memberships
      WHERE user_id = ${user.id}
    `
    
    if (Array.isArray(existingMembership) && existingMembership.length > 0) {
      return NextResponse.json({ 
        error: "You are already a member", 
        membership: existingMembership[0] 
      }, { status: 400 })
    }
    
    // Create new membership
    const newMembership = await sql`
      INSERT INTO memberships (user_id, tier, points)
      VALUES (${user.id}, ${tier}, 0)
      RETURNING id, tier, points, created_at, updated_at
    `
    
    if (!Array.isArray(newMembership) || newMembership.length === 0) {
      return NextResponse.json({ error: "Failed to create membership" }, { status: 500 })
    }
    
    // Return the new membership
    return NextResponse.json({
      success: true,
      message: `Successfully joined ${tier} tier!`,
      membership: newMembership[0]
    })
  } catch (error) {
    console.error("Error joining membership:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to join membership" 
    }, { status: 500 })
  }
}
