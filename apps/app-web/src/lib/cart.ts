import { neon } from '@neondatabase/serverless';
import { User } from './auth';
import { calculateCommissions, initializeCommissionTables } from './commission';

// Initialize database connection with proper error handling
let sql: ReturnType<typeof neon>;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  sql = neon(process.env.DATABASE_URL);
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  // Provide a fallback to prevent the app from crashing
  sql = neon('postgresql://neondb_owner:placeholder@localhost:5432/neondb');
}

// Define cart types
export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Initialize cart table
export async function initializeCartTable() {
  try {
    console.log('Initializing cart table...');

    // Create cart table
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Check if table was created successfully
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'cart_items'
    `;

    if (Array.isArray(tablesCheck) && tablesCheck.length > 0) {
      console.log('Cart table initialized successfully');
    }

    return true;
  } catch (error) {
    console.error('Error initializing cart table:', error);
    throw error;
  }
}

// Initialize table on module load
initializeCartTable().catch((error) => {
  console.error('Failed to initialize cart table on startup:', error);
});

// Add item to cart
export async function addToCart(
  userId: number,
  productId: number,
  productName: string,
  quantity: number,
  price: number,
  imageUrl?: string
): Promise<CartItem> {
  try {
    // Check if item already exists in cart
    const existingItems = await sql`
      SELECT id, quantity 
      FROM cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId}
    `;

    if (Array.isArray(existingItems) && existingItems.length > 0) {
      // Update existing item
      const existingItem = existingItems[0] as { id: number; quantity: number };
      const newQuantity = existingItem.quantity + quantity;

      const updatedItem = await sql`
        UPDATE cart_items 
        SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingItem.id}
        RETURNING *
      `;

      return Array.isArray(updatedItem)
        ? (updatedItem[0] as CartItem)
        : ({} as CartItem);
    } else {
      // Add new item
      const newItem = await sql`
        INSERT INTO cart_items (user_id, product_id, product_name, quantity, price, image_url)
        VALUES (${userId}, ${productId}, ${productName}, ${quantity}, ${price}, ${imageUrl})
        RETURNING *
      `;

      return Array.isArray(newItem)
        ? (newItem[0] as CartItem)
        : ({} as CartItem);
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
}

// Get cart items for a user
export async function getCartItems(userId: number): Promise<CartItem[]> {
  try {
    const items = await sql`
      SELECT * FROM cart_items
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return Array.isArray(items) ? (items as CartItem[]) : [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(
  userId: number,
  cartItemId: number,
  quantity: number
): Promise<CartItem | null> {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await sql`
        DELETE FROM cart_items
        WHERE id = ${cartItemId} AND user_id = ${userId}
      `;
      return null;
    }

    const updatedItem = await sql`
      UPDATE cart_items
      SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cartItemId} AND user_id = ${userId}
      RETURNING *
    `;

    return Array.isArray(updatedItem) && updatedItem.length > 0
      ? (updatedItem[0] as CartItem)
      : null;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
}

// Remove item from cart
export async function removeFromCart(
  userId: number,
  cartItemId: number
): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM cart_items
      WHERE id = ${cartItemId} AND user_id = ${userId}
    `;

    return true;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
}

// Clear cart
export async function clearCart(userId: number): Promise<boolean> {
  try {
    await sql`
      DELETE FROM cart_items
      WHERE user_id = ${userId}
    `;

    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// Convert cart to order
export async function convertCartToOrder(
  userId: number
): Promise<number | null> {
  try {
    // Get cart items
    const cartItems = await getCartItems(userId);

    if (cartItems.length === 0) {
      return null;
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Initialize commission tables if needed
    await initializeCommissionTables();

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (user_id, status, total)
      VALUES (${userId}, 'processing', ${total})
      RETURNING id
    `;

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      throw new Error('Failed to create order');
    }

    // Type assertion to ensure we can access the id property
    const orderData = orderResult[0] as { id: number };
    const orderId = orderData.id;

    // Create order items
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES (${orderId}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.price})
      `;
    }

    // Calculate and record commissions for this order
    try {
      const commissions = await calculateCommissions(orderId, userId, total);
      console.log(
        `Calculated ${commissions.length} commissions for order ${orderId}`
      );
    } catch (commissionError) {
      // Log commission error but don't fail the order process
      console.error('Error calculating commissions:', commissionError);
    }

    // Clear cart
    await clearCart(userId);

    return orderId;
  } catch (error) {
    console.error('Error converting cart to order:', error);
    throw error;
  }
}
