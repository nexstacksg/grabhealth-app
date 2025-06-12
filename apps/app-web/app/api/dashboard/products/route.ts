import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const products = await sql`
      SELECT 
        p.*,
        pc.name as category_name,
        pc.icon as category_icon
      FROM products p
      JOIN product_categories pc ON p.category_id = pc.id
      ORDER BY p.name
    `

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
