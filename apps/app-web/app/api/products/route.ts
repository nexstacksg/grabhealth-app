import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Sample product data
const sampleCategories = [
  { name: "Vitamins", description: "Essential vitamins for daily health", icon: "pill" },
  { name: "Supplements", description: "Health supplements for specific needs", icon: "flask" },
  { name: "First Aid", description: "First aid supplies for emergencies", icon: "bandage" },
  { name: "Personal Care", description: "Personal care products for hygiene", icon: "shower" }
]

const sampleProducts = [
  {
    name: "Multivitamin Daily",
    description: "Complete daily multivitamin with essential nutrients",
    price: 19.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Vitamins",
    image_url: "https://placehold.co/300x300/e6f7ff/0a85ff?text=Multivitamin",
    in_stock: true
  },
  {
    name: "Vitamin C 1000mg",
    description: "High-strength vitamin C for immune support",
    price: 14.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Vitamins",
    image_url: "https://placehold.co/300x300/fff9e6/ffaa0a?text=Vitamin+C",
    in_stock: true
  },
  {
    name: "Omega-3 Fish Oil",
    description: "Pure fish oil with omega-3 fatty acids for heart health",
    price: 24.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Supplements",
    image_url: "https://placehold.co/300x300/e6fff9/0affaa?text=Omega-3",
    in_stock: true
  },
  {
    name: "Protein Powder",
    description: "High-quality protein powder for muscle recovery",
    price: 29.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Supplements",
    image_url: "https://placehold.co/300x300/f9e6ff/aa0aff?text=Protein",
    in_stock: true
  },
  {
    name: "First Aid Kit",
    description: "Comprehensive first aid kit for home emergencies",
    price: 34.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "First Aid",
    image_url: "https://placehold.co/300x300/ffe6e6/ff0a0a?text=First+Aid",
    in_stock: true
  },
  {
    name: "Bandages Pack",
    description: "Assorted bandages for minor cuts and scrapes",
    price: 9.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "First Aid",
    image_url: "https://placehold.co/300x300/e6e6ff/0a0aff?text=Bandages",
    in_stock: true
  },
  {
    name: "Hand Sanitizer",
    description: "Alcohol-based hand sanitizer for on-the-go hygiene",
    price: 7.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Personal Care",
    image_url: "https://placehold.co/300x300/e6ffe6/0aff0a?text=Sanitizer",
    in_stock: true
  },
  {
    name: "Moisturizing Lotion",
    description: "Hydrating body lotion for dry skin",
    price: 12.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Personal Care",
    image_url: "https://placehold.co/300x300/fff0e6/ffa50a?text=Lotion",
    in_stock: true
  },
  {
    name: "Vitamin D3",
    description: "Vitamin D3 supplement for bone health",
    price: 15.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Vitamins",
    image_url: "https://placehold.co/300x300/f0e6ff/a50aff?text=Vitamin+D",
    in_stock: true
  },
  {
    name: "Magnesium Tablets",
    description: "Magnesium supplement for muscle and nerve function",
    price: 18.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Supplements",
    image_url: "https://placehold.co/300x300/e6f0ff/0aa5ff?text=Magnesium",
    in_stock: true
  },
  {
    name: "Antiseptic Wipes",
    description: "Antiseptic wipes for cleaning wounds",
    price: 8.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "First Aid",
    image_url: "https://placehold.co/300x300/ffe6f0/ff0aa5?text=Wipes",
    in_stock: true
  },
  {
    name: "Facial Cleanser",
    description: "Gentle facial cleanser for all skin types",
    price: 13.99,
    discount_essential: 0.1,
    discount_premium: 0.25,
    category: "Personal Care",
    image_url: "https://placehold.co/300x300/f0ffe6/a5ff0a?text=Cleanser",
    in_stock: true
  }
]

// Initialize database tables and sample data
async function initializeDatabase() {
  try {
    console.log("Initializing product database...")
    
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        discount_essential DECIMAL(10, 2),
        discount_premium DECIMAL(10, 2),
        category_id INTEGER REFERENCES product_categories(id),
        image_url TEXT,
        in_stock BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Check if we have categories
    const existingCategories = await sql`SELECT COUNT(*) as count FROM product_categories`
    const categoryCount = parseInt(existingCategories[0]?.count?.toString() || "0")
    
    // Insert sample categories if none exist
    if (categoryCount === 0) {
      console.log("Adding sample categories...")
      for (const category of sampleCategories) {
        await sql`
          INSERT INTO product_categories (name, description, icon)
          VALUES (${category.name}, ${category.description}, ${category.icon})
        `
      }
    }
    
    // Check if we have products
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`
    const productCount = parseInt(existingProducts[0]?.count?.toString() || "0")
    
    // Insert sample products if none exist
    if (productCount === 0) {
      console.log("Adding sample products...")
      for (const product of sampleProducts) {
        // Get category ID
        const categoryResult = await sql`
          SELECT id FROM product_categories WHERE name = ${product.category}
        `
        
        if (categoryResult.length > 0) {
          const categoryId = categoryResult[0].id
          
          await sql`
            INSERT INTO products (
              name, description, price, discount_essential, discount_premium,
              category_id, image_url, in_stock
            )
            VALUES (
              ${product.name}, ${product.description}, ${product.price},
              ${product.discount_essential}, ${product.discount_premium},
              ${categoryId}, ${product.image_url}, ${product.in_stock}
            )
          `
        }
      }
    }
    
    console.log("Database initialization complete")
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

// Get all products with optional filtering and pagination
export async function GET(request: Request) {
  try {
    const dbInitialized = await initializeDatabase()
    if (!dbInitialized) {
      return NextResponse.json({ error: "Database initialization failed" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const inStock = searchParams.get("inStock")
    const membershipTier = searchParams.get("membershipTier") || "essential"
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

    try {
      // Simpler approach using neon's SQL template literals
      let productsQuery = sql`
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.price, 
          p.discount_essential, 
          p.discount_premium, 
          p.image_url, 
          p.in_stock,
          c.name as category_name,
          c.icon as category_icon,
          CASE 
            WHEN ${membershipTier} = 'essential' THEN p.price * (1 - COALESCE(p.discount_essential, 0))
            WHEN ${membershipTier} = 'premium' THEN p.price * (1 - COALESCE(p.discount_premium, 0))
            ELSE p.price
          END as discounted_price
        FROM products p
        JOIN product_categories c ON p.category_id = c.id
      `
      
      // Build conditions
      let conditions = []
      
      if (category && category !== 'all') {
        conditions.push(sql`c.name ILIKE ${`%${category}%`}`)
      }
      
      if (search) {
        const searchPattern = `%${search}%`
        conditions.push(sql`(p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern})`)
      }
      
      if (inStock === "true") {
        conditions.push(sql`p.in_stock = true`)
      }
      
      // Add WHERE clause if we have conditions
      if (conditions.length > 0) {
        // Use array reduce instead of sql.join which doesn't exist
        const whereConditions = conditions.reduce((result, condition, index) => {
          if (index === 0) return condition
          return sql`${result} AND ${condition}`
        }, sql``)
        
        productsQuery = sql`${productsQuery} WHERE ${whereConditions}`
      }
      
      // Count query for pagination
      const countQuery = sql`SELECT COUNT(*) as total FROM (${productsQuery}) as filtered_products`
      const countResult = await countQuery
      const totalCount = parseInt(countResult[0]?.total?.toString() || "0")
      const totalPages = Math.ceil(totalCount / limit)
      
      // Add ORDER BY, LIMIT and OFFSET
      const finalQuery = sql`
        ${productsQuery}
        ORDER BY p.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      
      const products = await finalQuery
      
      return NextResponse.json({
        products,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages
        }
      })
    } catch (dbError) {
      console.error("Database query error:", dbError)
      return NextResponse.json({ error: "Failed to query products" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in products API:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}


// Create a new product
export async function POST(request: Request) {
  try {
    await initializeDatabase()

    const {
      name,
      description,
      price,
      discountEssential,
      discountPremium,
      categoryId,
      imageUrl,
      inStock = true,
    } = await request.json()

    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO products (
        name, 
        description, 
        price, 
        discount_essential, 
        discount_premium, 
        category_id, 
        image_url, 
        in_stock
      )
      VALUES (
        ${name}, 
        ${description}, 
        ${price}, 
        ${discountEssential || 0.1}, 
        ${discountPremium || 0.25}, 
        ${categoryId}, 
        ${imageUrl}, 
        ${inStock}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
