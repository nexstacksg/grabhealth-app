import { neon } from '@neondatabase/serverless';
import { User } from './auth';

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

// Define order types
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  created_at?: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at: string;
  items?: OrderItem[];
}

// Initialize orders tables
export async function initializeOrdersTables() {
  try {
    console.log('Initializing orders tables...');

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create order items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Check if tables were created successfully
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('orders', 'order_items')
    `;

    if (Array.isArray(tablesCheck)) {
      const tableNames = tablesCheck
        .map((t) => {
          return typeof t === 'object' && t !== null && 'table_name' in t
            ? t.table_name
            : 'unknown';
        })
        .join(', ');
      console.log(`Created tables: ${tableNames}`);
    }

    console.log('Orders tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing orders tables:', error);
    throw error;
  }
}

// Initialize tables on module load
initializeOrdersTables().catch((error) => {
  console.error('Failed to initialize orders tables on startup:', error);
});

// Create a new order
export async function createOrder(
  userId: number,
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[]
): Promise<Order> {
  try {
    // Calculate total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (user_id, status, total)
      VALUES (${userId}, 'processing', ${total})
      RETURNING id, user_id, status, total, created_at
    `;

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      throw new Error('Failed to create order');
    }

    const order = orderResult[0] as Order;

    // Create order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES (${order.id}, ${item.productId}, ${item.productName}, ${item.quantity}, ${item.price})
      `;
    }

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Get orders for a user
export async function getOrdersByUserId(userId: number): Promise<Order[]> {
  try {
    const orders = await sql`
      SELECT id, user_id, status, total, created_at
      FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    if (!Array.isArray(orders)) {
      return [];
    }

    // Ensure total is properly converted to a number
    return orders.map((order) => {
      // Safely access order properties with type checking
      if (typeof order === 'object' && order !== null) {
        const orderObj = order as Record<string, any>;
        const total = orderObj.total;
        return {
          ...orderObj,
          // Convert total to number regardless of its original type
          total:
            typeof total === 'string' ? parseFloat(total) : Number(total || 0),
        };
      }
      return order;
    }) as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Get order details by ID
export async function getOrderById(
  orderId: number,
  userId: number
): Promise<Order | null> {
  try {
    // Get order
    const orders = await sql`
      SELECT id, user_id, status, total, created_at
      FROM orders
      WHERE id = ${orderId} AND user_id = ${userId}
    `;

    if (!Array.isArray(orders) || orders.length === 0) {
      return null;
    }

    // Safely convert order data with proper type handling
    const orderData = orders[0];
    if (typeof orderData !== 'object' || orderData === null) {
      return null;
    }

    // Create order object with properly typed total
    const orderObj = orderData as Record<string, any>;
    const order: Order = {
      id: Number(orderObj.id),
      user_id: Number(orderObj.user_id),
      status: orderObj.status as Order['status'],
      total:
        typeof orderObj.total === 'string'
          ? parseFloat(orderObj.total)
          : Number(orderObj.total || 0),
      created_at: orderObj.created_at,
      items: [],
    };

    // Get order items
    const items = await sql`
      SELECT id, order_id, product_id, product_name, quantity, price, created_at
      FROM order_items
      WHERE order_id = ${orderId}
    `;

    if (Array.isArray(items)) {
      // Convert item prices to numbers
      order.items = items.map((item) => {
        if (typeof item === 'object' && item !== null) {
          const itemObj = item as Record<string, any>;
          return {
            id: Number(itemObj.id),
            order_id: Number(itemObj.order_id),
            product_id: Number(itemObj.product_id),
            product_name: String(itemObj.product_name),
            quantity: Number(itemObj.quantity),
            price:
              typeof itemObj.price === 'string'
                ? parseFloat(itemObj.price)
                : Number(itemObj.price || 0),
            created_at: itemObj.created_at,
          } as OrderItem;
        }
        return item as OrderItem;
      });
    } else {
      order.items = [];
    }

    return order;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: number,
  userId: number,
  status: Order['status']
): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${orderId} AND user_id = ${userId}
      RETURNING id
    `;

    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Add some sample data for testing (only if tables are empty)
export async function addSampleOrders(userId: number) {
  try {
    // Check if orders already exist for this user
    const existingOrders =
      await sql`SELECT COUNT(*) FROM orders WHERE user_id = ${userId}`;

    if (Array.isArray(existingOrders) && existingOrders.length > 0) {
      const firstResult = existingOrders[0];
      const count =
        typeof firstResult === 'object' &&
        firstResult !== null &&
        'count' in firstResult
          ? parseInt(String(firstResult.count))
          : 0;

      if (count > 0) {
        return; // Don't add sample data if orders already exist
      }
    }

    // Sample products
    const products = [
      { id: 1, name: 'Vitamin C Supplement', price: 15.99 },
      { id: 2, name: 'Digital Thermometer', price: 24.5 },
      { id: 3, name: 'Blood Pressure Monitor', price: 59.99 },
      { id: 4, name: 'Pain Relief Tablets', price: 8.75 },
      { id: 5, name: 'First Aid Kit', price: 29.99 },
    ];

    // Create sample orders
    const sampleOrders = [
      {
        status: 'delivered' as const,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 4, quantity: 1 },
        ],
        daysAgo: 14,
      },
      {
        status: 'shipped' as const,
        items: [{ productId: 3, quantity: 1 }],
        daysAgo: 5,
      },
      {
        status: 'processing' as const,
        items: [
          { productId: 2, quantity: 1 },
          { productId: 5, quantity: 1 },
        ],
        daysAgo: 1,
      },
    ];

    for (const sampleOrder of sampleOrders) {
      const orderItems = sampleOrder.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
        };
      });

      // Create order
      const order = await createOrder(userId, orderItems);

      // Update status and created_at date
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - sampleOrder.daysAgo);

      await sql`
        UPDATE orders
        SET status = ${sampleOrder.status}, created_at = ${createdAt.toISOString()}
        WHERE id = ${order.id}
      `;
    }

    console.log('Sample orders added successfully');
  } catch (error) {
    console.error('Error adding sample orders:', error);
  }
}
