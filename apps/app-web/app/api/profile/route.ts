import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      console.error("No user found in session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log("User found in session:", user.id)
    
    // Get user profile from database
    const profile = await sql`
      SELECT id, name, email, image
      FROM users
      WHERE id = ${user.id}
    `
    
    if (!Array.isArray(profile) || profile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }
    
    // Get membership info
    const membership = await sql`
      SELECT tier, points
      FROM memberships
      WHERE user_id = ${user.id}
    `
    
    // Return profile with membership info
    return NextResponse.json({
      ...profile[0],
      membership: Array.isArray(membership) && membership.length > 0 ? membership[0] : null
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get request body
    const { name, email, image } = await request.json()
    
    // Log the update attempt for debugging
    console.log(`Attempting to update profile for user ${user.id} with name=${name}, email=${email}`)
    
    // Update user profile
    const updatedProfile = await sql`
      UPDATE users
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        image = COALESCE(${image}, image)
      WHERE id = ${user.id}
      RETURNING id, name, email, image
    `
    
    if (!Array.isArray(updatedProfile) || updatedProfile.length === 0) {
      console.error("Update query executed but returned no results")
      return NextResponse.json({ error: "Profile update failed" }, { status: 500 })
    }
    
    console.log("Profile updated successfully:", updatedProfile[0])
    
    // Get membership info
    const membership = await sql`
      SELECT tier, points
      FROM memberships
      WHERE user_id = ${user.id}
    `
    
    // Return updated profile with membership info
    return NextResponse.json({
      ...updatedProfile[0],
      membership: Array.isArray(membership) && membership.length > 0 ? membership[0] : null
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
