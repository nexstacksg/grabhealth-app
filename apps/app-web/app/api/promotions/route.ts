import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Get all promotions with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isPremiumOnly = searchParams.get("isPremiumOnly")
    const isActive = searchParams.get("isActive")

    let query = `
      SELECT * FROM promotions
      WHERE 1=1
    `

    const queryParams: any[] = []
    const paramIndex = 1

    if (isPremiumOnly === "true") {
      query += ` AND is_premium_only = true`
    }

    if (isActive === "true") {
      query += ` AND start_date <= NOW() AND end_date >= NOW()`
    }

    query += ` ORDER BY start_date DESC`

    const result = await sql.query(query, queryParams)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 })
  }
}

// Create a new promotion
export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      discount_percentage,
      start_date,
      end_date,
      image_url,
      is_premium_only = false,
    } = await request.json()

    // Validate required fields
    if (!title || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO promotions (
        title, 
        description, 
        discount_percentage, 
        start_date, 
        end_date, 
        image_url, 
        is_premium_only
      )
      VALUES (
        ${title}, 
        ${description}, 
        ${discount_percentage}, 
        ${start_date}, 
        ${end_date}, 
        ${image_url}, 
        ${is_premium_only}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating promotion:", error)
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 })
  }
}
