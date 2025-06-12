import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Get all gift items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tierName = searchParams.get("tier")

    let query = `
      SELECT 
        gi.*,
        mt.name as tier_name
      FROM gift_items gi
      JOIN membership_tiers mt ON gi.tier_id = mt.id
    `

    const queryParams: any[] = []
    let paramIndex = 1

    if (tierName) {
      query += ` WHERE mt.name = $${paramIndex}`
      queryParams.push(tierName)
      paramIndex++
    }

    query += ` ORDER BY mt.name, gi.name`

    const result = await sql.query(query, queryParams)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching gift items:", error)
    return NextResponse.json({ error: "Failed to fetch gift items" }, { status: 500 })
  }
}

// Create a new gift item
export async function POST(request: Request) {
  try {
    const { name, description, tier_id, image_url } = await request.json()

    // Validate required fields
    if (!name || !tier_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO gift_items (name, description, tier_id, image_url)
      VALUES (${name}, ${description}, ${tier_id}, ${image_url})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating gift item:", error)
    return NextResponse.json({ error: "Failed to create gift item" }, { status: 500 })
  }
}
