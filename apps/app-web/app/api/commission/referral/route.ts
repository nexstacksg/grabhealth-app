import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  initializeCommissionTables, 
  setUserUpline,
  generateReferralLink
} from "@/lib/commission"

// Generate a referral link for the current user
export async function GET() {
  try {
    // Initialize commission tables
    await initializeCommissionTables()
    
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Generate referral link
    const referralLink = await generateReferralLink(user.id)
    
    return NextResponse.json({ referralLink })
  } catch (error) {
    console.error("Error generating referral link:", error)
    return NextResponse.json({ error: "Failed to generate referral link" }, { status: 500 })
  }
}

// Process a referral registration
export async function POST(request: Request) {
  try {
    // Initialize commission tables
    await initializeCommissionTables()
    
    // Parse request body
    const { userId, referrerId } = await request.json()
    
    // Validate required fields
    if (!userId || !referrerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Set referrer as user's upline (Tier 1 relationship)
    const relationship = await setUserUpline(userId, referrerId, 1)
    
    return NextResponse.json(relationship, { status: 201 })
  } catch (error) {
    console.error("Error processing referral:", error)
    return NextResponse.json({ error: "Failed to process referral" }, { status: 500 })
  }
}
