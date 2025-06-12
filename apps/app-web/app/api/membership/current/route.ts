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

// GET /api/membership/current - Get current user's membership
export async function GET() {
  try {
    // Initialize tables
    await initializeMembershipTables()
    
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has a membership
    const memberships = await sql`
      SELECT m.id, m.tier, m.points, m.created_at, m.updated_at
      FROM memberships m
      WHERE m.user_id = ${user.id}
    `
    
    if (!Array.isArray(memberships) || memberships.length === 0) {
      // Create a default membership for the user
      const newMembership = await sql`
        INSERT INTO memberships (user_id, tier, points)
        VALUES (${user.id}, 'level7', 0)
        RETURNING id, tier, points, created_at, updated_at
      `
      
      if (!Array.isArray(newMembership) || newMembership.length === 0) {
        return NextResponse.json({ error: "Failed to create membership" }, { status: 500 })
      }
      
      // Return the new membership with user info
      return NextResponse.json({
        ...newMembership[0],
        name: user.name,
        email: user.email
      })
    }
    
    // Return existing membership with user info
    return NextResponse.json({
      ...memberships[0],
      name: user.name,
      email: user.email
    })
  } catch (error) {
    console.error("Error fetching membership:", error)
    return NextResponse.json({ error: "Failed to fetch membership" }, { status: 500 })
  }
}

// PATCH /api/membership/current - Update current user's membership
export async function PATCH(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get request body
    const { points, tier } = await request.json()
    
    // Log the update attempt for debugging
    console.log(`Attempting to update membership for user ${user.id} with points=${points}, tier=${tier}`)
    
    // Check if user has a membership
    const existingMembership = await sql`
      SELECT id, tier, points
      FROM memberships
      WHERE user_id = ${user.id}
    `
    
    if (!Array.isArray(existingMembership) || existingMembership.length === 0) {
      // Create a new membership if it doesn't exist
      console.log(`No existing membership found for user ${user.id}, creating new one`)
      const newMembership = await sql`
        INSERT INTO memberships (user_id, tier, points)
        VALUES (${user.id}, ${tier || 'essential'}, ${points || 0})
        RETURNING id, tier, points, updated_at
      `
      
      return NextResponse.json(Array.isArray(newMembership) ? newMembership[0] : {})
    }
    
    // Update existing membership using direct SQL template literals instead of building a query string
    // This approach is safer and less prone to errors
    let result;
    
    if (points !== undefined && tier) {
      // Update both points and tier
      result = await sql`
        UPDATE memberships
        SET 
          points = ${points},
          tier = ${tier},
          updated_at = NOW()
        WHERE user_id = ${user.id}
        RETURNING id, tier, points, updated_at
      `
    } else if (points !== undefined) {
      // Determine tier based on points
      let newTier = existingMembership[0].tier;
      
      // Check if points qualify for a tier upgrade
      if (existingMembership[0].tier === 'level7' && points >= 100) {
        newTier = 'level6';
      } else if (existingMembership[0].tier === 'level6' && points >= 200) {
        newTier = 'level5';
      } else if (existingMembership[0].tier === 'level5' && points >= 400) {
        newTier = 'level4';
      } else if (existingMembership[0].tier === 'level4' && points >= 1000) {
        newTier = 'level3';
      }
      
      // Update points and potentially tier
      result = await sql`
        UPDATE memberships
        SET 
          points = ${points},
          tier = ${newTier},
          updated_at = NOW()
        WHERE user_id = ${user.id}
        RETURNING id, tier, points, updated_at
      `
    } else if (tier) {
      // Update only tier
      result = await sql`
        UPDATE memberships
        SET 
          tier = ${tier},
          updated_at = NOW()
        WHERE user_id = ${user.id}
        RETURNING id, tier, points, updated_at
      `
    } else {
      // No updates provided
      return NextResponse.json({ error: "No update parameters provided" }, { status: 400 })
    }
    
    if (!Array.isArray(result) || result.length === 0) {
      console.error("Update query executed but returned no results")
      return NextResponse.json({ error: "Membership update failed" }, { status: 500 })
    }
    
    console.log("Membership updated successfully:", result[0])
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating membership:", error)
    return NextResponse.json({ error: "Failed to update membership" }, { status: 500 })
  }
}
