import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Initialize database connection with proper error handling
let sql: ReturnType<typeof neon>;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not defined")
  }
  sql = neon(process.env.DATABASE_URL)
} catch (error) {
  console.error("Failed to initialize database connection:", error)
  // Provide a fallback that will still allow the code to run but will properly error when used
  sql = neon("postgresql://placeholder:placeholder@localhost:5432/placeholder")
}

export async function GET() {
  try {
    // Check if the product_categories table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_categories'
      )
    `;
    
    // If table doesn't exist, create it with sample data
    const exists = Array.isArray(tableExists) && tableExists.length > 0 && tableExists[0] && 'exists' in tableExists[0] && tableExists[0].exists;
    if (!exists) {
      await createProductCategoriesTable();
    }
    
    const categories = await sql`
      SELECT * FROM product_categories
      ORDER BY name
    `;
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return NextResponse.json({ error: "Failed to fetch product categories" }, { status: 500 });
  }
}

// Function to create the product_categories table with sample data
async function createProductCategoriesTable() {
  try {
    // Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Insert sample data
    await sql`
      INSERT INTO product_categories (name, description, icon) VALUES
      ('Supplements', 'Vitamins and dietary supplements', 'Pill'),
      ('First Aid', 'Bandages and first aid supplies', 'Bandage'),
      ('Pain Relief', 'Pain relief medications', 'Thermometer'),
      ('Cold & Flu', 'Cold and flu treatments', 'Thermometer'),
      ('Digestive Health', 'Digestive health products', 'Droplet'),
      ('Heart Health', 'Products for heart health', 'Heart'),
      ('Vitamins', 'Essential vitamins', 'Vitamins'),
      ('Medical Devices', 'Health monitoring devices', 'Stethoscope')
      ON CONFLICT (name) DO NOTHING
    `;
    
    console.log('Product categories table created with sample data');
  } catch (error) {
    console.error('Error creating product categories table:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, icon } = await request.json()

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO product_categories (name, description, icon)
      VALUES (${name}, ${description}, ${icon})
      RETURNING *
    `

    // Safely handle the result with proper type checking
    if (Array.isArray(result) && result.length > 0) {
      return NextResponse.json(result[0], { status: 201 })
    } else {
      return NextResponse.json({ error: "Failed to create product category" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating product category:", error)
    return NextResponse.json({ error: "Failed to create product category" }, { status: 500 })
  }
}
