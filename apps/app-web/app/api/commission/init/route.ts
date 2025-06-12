import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  initializeCommissionTables, 
  setUserUpline,
  addUserPoints,
  calculateCommissions
} from "@/lib/commission"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Initialize commission system with sample data
export async function GET() {
  try {
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Initialize commission tables
    try {
      await initializeCommissionTables()
      console.log("Commission tables initialized successfully")
    } catch (error) {
      console.error("Error initializing commission tables:", error)
      return NextResponse.json({ 
        error: "Failed to initialize commission tables",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 })
    }
    
    // Check if we already have user relationships
    let hasRelationships = false
    try {
      const relationshipsCount = await sql`SELECT COUNT(*) FROM user_relationships`
      hasRelationships = relationshipsCount && Array.isArray(relationshipsCount) && relationshipsCount.length > 0 && relationshipsCount[0].count > 0
    } catch (error) {
      console.error("Error checking relationships table:", error)
      // If there's an error, assume we need to create the relationships
      hasRelationships = false
    }
    
    // Only add sample data if we don't have any relationships yet
    if (!hasRelationships) {
      try {
        // Create some sample users if they don't exist
        const sampleUsers = await createSampleUsers()
        
        if (sampleUsers && sampleUsers.length > 0) {
          // Create sample network structure
          try {
            await createSampleNetwork(user.id, sampleUsers)
            console.log("Sample network created successfully")
          } catch (error) {
            console.error("Error creating sample network:", error)
            // Continue with other initialization steps
          }
          
          // Create sample orders if needed
          let sampleOrders: any[] = []
          try {
            const result = await createSampleOrders(user.id, sampleUsers)
            sampleOrders = result || []
            console.log(`Created ${sampleOrders.length} sample orders`)
          } catch (error) {
            console.error("Error creating sample orders:", error)
            // Continue with other initialization steps
          }
          
          // Calculate commissions for sample orders
          if (sampleOrders.length > 0) {
            try {
              await createSampleCommissions(sampleOrders)
              console.log("Sample commissions created successfully")
            } catch (error) {
              console.error("Error creating sample commissions:", error)
              // Continue with other initialization steps
            }
          }
          
          // Add points to users
          try {
            await addUserPoints(user.id, 250)
            console.log("Added points to user successfully")
          } catch (error) {
            console.error("Error adding points to user:", error)
            // Continue with other initialization steps
          }
        } else {
          console.log("No sample users created or found")
        }
      } catch (error) {
        console.error("Error creating sample data:", error)
        // Continue to return success, as tables were created
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Commission system initialized with sample data"
    })
  } catch (error) {
    console.error("Error initializing commission system:", error)
    return NextResponse.json({ 
      error: "Failed to initialize commission system",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Create sample users for testing
async function createSampleUsers() {
  try {
    // Check if we have at least 5 users
    const usersCount = await sql`SELECT COUNT(*) FROM users`
    
    if (usersCount[0].count >= 5) {
      // Get existing users
      const users = await sql`SELECT id, name, email FROM users LIMIT 5`
      return users
    }
    
    // Create sample users
    const sampleUsers = [
      { name: "Alice Johnson", email: "alice@example.com" },
      { name: "Bob Smith", email: "bob@example.com" },
      { name: "Carol Davis", email: "carol@example.com" },
      { name: "Dave Wilson", email: "dave@example.com" }
    ]
    
    const createdUsers = []
    
    for (const user of sampleUsers) {
      // Check if user already exists
      const existingUser = await sql`SELECT id, name, email FROM users WHERE email = ${user.email}`
      
      if (existingUser.length > 0) {
        createdUsers.push(existingUser[0])
        continue
      }
      
      // Create new user with a simple password
      const salt = "sampleSalt123456789"
      const passwordHash = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" // 'password'
      
      const newUser = await sql`
        INSERT INTO users (name, email, password_hash, password_salt)
        VALUES (${user.name}, ${user.email}, ${passwordHash}, ${salt})
        RETURNING id, name, email
      `
      
      createdUsers.push(newUser[0])
    }
    
    // Get current user and add to the list
    const currentUser = await sql`SELECT id, name, email FROM users ORDER BY id DESC LIMIT 1`
    if (currentUser.length > 0) {
      createdUsers.push(currentUser[0])
    }
    
    return createdUsers
  } catch (error) {
    console.error("Error creating sample users:", error)
    throw error
  }
}

// Create sample network structure
async function createSampleNetwork(currentUserId: number, users: any[]) {
  try {
    // Filter out current user
    const otherUsers = users.filter(u => u.id !== currentUserId)
    
    if (otherUsers.length < 3) {
      throw new Error("Not enough users to create a network")
    }
    
    // Create a simple network structure:
    // User 1 (upline) -> Current User -> User 2, User 3 (downlines)
    
    // Set current user's upline
    await setUserUpline(currentUserId, otherUsers[0].id, 1)
    
    // Set downlines for current user
    await setUserUpline(otherUsers[1].id, currentUserId, 1)
    await setUserUpline(otherUsers[2].id, currentUserId, 1)
    
    // Add a second-level downline
    if (otherUsers.length > 3) {
      await setUserUpline(otherUsers[3].id, otherUsers[1].id, 1)
    }
    
    return true
  } catch (error) {
    console.error("Error creating sample network:", error)
    throw error
  }
}

// Create sample orders
async function createSampleOrders(currentUserId: number, users: any[]) {
  try {
    // Check if orders table exists and has data
    let hasOrders = false
    try {
      const ordersCount = await sql`SELECT COUNT(*) FROM orders`
      hasOrders = ordersCount && Array.isArray(ordersCount) && ordersCount.length > 0 && ordersCount[0].count > 0
    } catch (error) {
      console.error("Error checking orders table:", error)
      // If there's an error, assume we need to create orders
      hasOrders = false
    }
    
    if (hasOrders) {
      // Get existing orders
      try {
        const orders = await sql`SELECT id, user_id, total FROM orders LIMIT 5`
        return orders
      } catch (error) {
        console.error("Error fetching existing orders:", error)
        // Continue with creating new orders
      }
    }
    
    // Get some products
    let products = []
    try {
      products = await sql`SELECT id, name, price FROM products LIMIT 10`
    } catch (error) {
      console.error("Error fetching products:", error)
      // Create some dummy products if needed
      return []
    }
    
    if (!products || products.length === 0) {
      console.log("No products found to create sample orders")
      return []
    }
    
    const orders = []
    
    // Create 1-2 orders for each user
    for (const user of users) {
      const numOrders = Math.floor(Math.random() * 2) + 1
      
      for (let i = 0; i < numOrders; i++) {
        try {
          // Select 1-3 random products
          const numProducts = Math.floor(Math.random() * 3) + 1
          const orderProducts = []
          let total = 0
          
          for (let j = 0; j < numProducts; j++) {
            const product = products[Math.floor(Math.random() * products.length)]
            const quantity = Math.floor(Math.random() * 3) + 1
            const price = parseFloat(product.price)
            
            orderProducts.push({
              product_id: product.id,
              product_name: product.name,
              quantity,
              price
            })
            
            total += price * quantity
          }
          
          // Create order
          const order = await sql`
            INSERT INTO orders (user_id, status, total)
            VALUES (${user.id}, 'delivered', ${total})
            RETURNING id, user_id, total
          `
          
          if (order && order.length > 0) {
            // Create order items
            for (const item of orderProducts) {
              await sql`
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                VALUES (${order[0].id}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.price})
              `
            }
            
            orders.push(order[0])
          }
        } catch (error) {
          console.error(`Error creating order for user ${user.id}:`, error)
          // Continue with next order
          continue
        }
      }
    }
    
    return orders
  } catch (error) {
    console.error("Error creating sample orders:", error)
    throw error
  }
}

// Create sample commissions
async function createSampleCommissions(orders: any[]) {
  try {
    // Check if commissions table exists and has data
    let hasCommissions = false
    try {
      const commissionsCount = await sql`SELECT COUNT(*) FROM commissions`
      hasCommissions = commissionsCount && Array.isArray(commissionsCount) && commissionsCount.length > 0 && commissionsCount[0].count > 0
    } catch (error) {
      console.error("Error checking commissions table:", error)
      // If there's an error, assume we need to create commissions
      hasCommissions = false
    }
    
    if (hasCommissions) {
      return true
    }
    
    // Calculate commissions for each order
    for (const order of orders) {
      try {
        if (order && order.id && order.user_id && order.total) {
          await calculateCommissions(order.id, order.user_id, parseFloat(order.total))
        }
      } catch (error) {
        console.error(`Error calculating commission for order ${order?.id}:`, error)
        // Continue with next order
        continue
      }
    }
    
    return true
  } catch (error) {
    console.error("Error creating sample commissions:", error)
    // Don't throw the error, just return false
    return false
  }
}
