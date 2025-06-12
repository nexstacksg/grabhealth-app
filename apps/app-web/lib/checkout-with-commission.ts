import { neon } from "@neondatabase/serverless"
import { calculateCommissions, initializeCommissionTables } from "./commission"

const sql = neon(process.env.DATABASE_URL!)

// Process checkout with commission calculation
export async function processCheckoutWithCommission(
  userId: number,
  cartItems: any[],
  orderTotal: number
) {
  try {
    // Initialize commission tables if needed
    await initializeCommissionTables()
    
    // Create the order
    const order = await sql`
      INSERT INTO orders (user_id, status, total)
      VALUES (${userId}, 'completed', ${orderTotal})
      RETURNING id
    `
    
    if (!Array.isArray(order) || order.length === 0) {
      throw new Error("Failed to create order")
    }
    
    const orderId = order[0].id
    
    // Add order items
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES (${orderId}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.price})
      `
    }
    
    // Calculate and record commissions for this order
    const commissions = await calculateCommissions(orderId, userId, orderTotal)
    
    return {
      orderId,
      commissions
    }
  } catch (error) {
    console.error("Error processing checkout with commission:", error)
    throw error
  }
}
