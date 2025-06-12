import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  initializeCommissionTables, 
  setUserUpline,
  getUserUpline,
  getUserDownlines
} from "@/lib/commission"

// Create or update a user relationship
export async function POST(request: Request) {
  try {
    // Initialize commission tables
    await initializeCommissionTables()
    
    // Get current user (must be authenticated)
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Parse request body
    const { userId, uplineId, level = 1 } = await request.json()
    
    // Validate required fields
    if (!userId || !uplineId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Set user's upline
    const relationship = await setUserUpline(userId, uplineId, level)
    
    return NextResponse.json(relationship, { status: 201 })
  } catch (error) {
    console.error("Error creating relationship:", error)
    return NextResponse.json({ error: "Failed to create relationship" }, { status: 500 })
  }
}

// Get user relationships
export async function GET(request: Request) {
  try {
    // Initialize commission tables
    await initializeCommissionTables()
    
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || user.id.toString()
    
    // Get user's upline
    const upline = await getUserUpline(parseInt(userId))
    
    // Get user's downlines
    const downlines = await getUserDownlines(parseInt(userId))
    
    return NextResponse.json({
      upline,
      downlines
    })
  } catch (error) {
    console.error("Error fetching relationships:", error)
    return NextResponse.json({ error: "Failed to fetch relationships" }, { status: 500 })
  }
}
