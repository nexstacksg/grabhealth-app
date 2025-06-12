import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const claims = await sql`
      SELECT 
        gc.id,
        gc.claimed_at,
        u.name as user_name,
        u.email as user_email,
        gi.name as gift_name,
        gi.description as gift_description,
        p.name as partner_name,
        p.address as partner_address,
        mt.name as tier_name
      FROM gift_claims gc
      JOIN users u ON gc.user_id = u.id
      JOIN gift_items gi ON gc.gift_id = gi.id
      JOIN partners p ON gc.partner_id = p.id
      JOIN membership_tiers mt ON gi.tier_id = mt.id
      ORDER BY gc.claimed_at DESC
      LIMIT 20
    `

    return NextResponse.json(claims)
  } catch (error) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 })
  }
}
