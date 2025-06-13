import { PrismaClient } from '@prisma/client';
import { neon } from '@neondatabase/serverless';

// Initialize clients
const prisma = new PrismaClient();
const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL!);

// Feature flags for gradual migration
const USE_PRISMA = process.env.USE_PRISMA === 'true';
const USE_PRISMA_AUTH = process.env.USE_PRISMA_AUTH === 'true';
const USE_PRISMA_PRODUCTS = process.env.USE_PRISMA_PRODUCTS === 'true';
const USE_PRISMA_ORDERS = process.env.USE_PRISMA_ORDERS === 'true';
const USE_PRISMA_COMMISSIONS = process.env.USE_PRISMA_COMMISSIONS === 'true';

export const db = {
  // User/Auth operations
  async getUserById(id: number) {
    if (USE_PRISMA_AUTH) {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          points: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    }
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0];
  },

  async getUserByEmail(email: string) {
    if (USE_PRISMA_AUTH) {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          points: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    }
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0];
  },

  async createUser(data: {
    email: string;
    name?: string;
    password: string;
    role?: string;
  }) {
    if (USE_PRISMA_AUTH) {
      return await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: data.password,
          role: data.role || 'customer',
        },
      });
    }
    const result = await sql`
      INSERT INTO users (email, name, password, role)
      VALUES (${data.email}, ${data.name}, ${data.password}, ${data.role || 'customer'})
      RETURNING *
    `;
    return result[0];
  },

  async updateUser(id: number, data: any) {
    if (USE_PRISMA_AUTH) {
      return await prisma.user.update({
        where: { id },
        data,
      });
    }
    // Build dynamic update query for Neon
    const updates = Object.entries(data)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');

    const result = await sql`
      UPDATE users 
      SET ${updates}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  // Product operations
  async getAllProducts() {
    if (USE_PRISMA_PRODUCTS) {
      return await prisma.product.findMany({
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    return await sql`
      SELECT * FROM products 
      WHERE in_stock = true 
      ORDER BY created_at DESC
    `;
  },

  async getProductById(id: number) {
    if (USE_PRISMA_PRODUCTS) {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          productCommissions: true,
        },
      });
    }
    const result = await sql`SELECT * FROM products WHERE id = ${id}`;
    return result[0];
  },

  // Order operations
  async createOrder(data: {
    userId: number;
    total: number;
    items: Array<{
      productId: number;
      quantity: number;
      price: number;
    }>;
  }) {
    if (USE_PRISMA_ORDERS) {
      return await prisma.order.create({
        data: {
          userId: data.userId,
          total: data.total,
          status: 'pending',
          items: {
            create: data.items,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Neon implementation with transaction
    // First create order
    const orderResult = await sql`
      INSERT INTO orders (user_id, total, status)
      VALUES (${data.userId}, ${data.total}, 'pending')
      RETURNING *
    `;
    const order = orderResult[0];

    // Then create order items
    for (const item of data.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${order.id}, ${item.productId}, ${item.quantity}, ${item.price})
      `;
    }

    return order;
  },

  async getOrderById(id: number) {
    if (USE_PRISMA_ORDERS) {
      return await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
          commissions: true,
        },
      });
    }
    const result = await sql`SELECT * FROM orders WHERE id = ${id}`;
    return result[0];
  },

  async getUserOrders(userId: number) {
    if (USE_PRISMA_ORDERS) {
      return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }
    return await sql`
      SELECT * FROM orders 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
  },

  // Commission operations
  async getUserUpline(userId: number) {
    if (USE_PRISMA_COMMISSIONS) {
      return await prisma.userRelationship.findFirst({
        where: { userId },
        include: {
          upline: true,
        },
        orderBy: { relationshipLevel: 'asc' },
      });
    }
    const result = await sql`
      SELECT * FROM user_relationships
      WHERE user_id = ${userId}
      ORDER BY relationship_level ASC
      LIMIT 1
    `;
    return result[0];
  },

  async setUserUpline(userId: number, uplineId: number, level: number = 1) {
    if (USE_PRISMA_COMMISSIONS) {
      return await prisma.userRelationship.upsert({
        where: {
          userId_uplineId: {
            userId,
            uplineId,
          },
        },
        update: {
          relationshipLevel: level,
        },
        create: {
          userId,
          uplineId,
          relationshipLevel: level,
        },
      });
    }

    // Check if relationship exists
    const existing = await sql`
      SELECT * FROM user_relationships
      WHERE user_id = ${userId} AND upline_id = ${uplineId}
    `;

    if (existing.length > 0) {
      const result = await sql`
        UPDATE user_relationships
        SET relationship_level = ${level}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND upline_id = ${uplineId}
        RETURNING *
      `;
      return result[0];
    }

    const result = await sql`
      INSERT INTO user_relationships (user_id, upline_id, relationship_level)
      VALUES (${userId}, ${uplineId}, ${level})
      RETURNING *
    `;
    return result[0];
  },

  async getCommissionTiers() {
    if (USE_PRISMA_COMMISSIONS) {
      return await prisma.commissionTier.findMany({
        orderBy: { tierLevel: 'asc' },
      });
    }
    return await sql`SELECT * FROM commission_tiers ORDER BY tier_level ASC`;
  },

  async createCommission(data: {
    orderId: number;
    userId: number;
    recipientId: number;
    amount: number;
    commissionRate: number;
    relationshipLevel: number;
  }) {
    if (USE_PRISMA_COMMISSIONS) {
      return await prisma.commission.create({
        data: {
          orderId: data.orderId,
          userId: data.userId,
          recipientId: data.recipientId,
          amount: data.amount,
          commissionRate: data.commissionRate,
          relationshipLevel: data.relationshipLevel,
          status: 'pending',
        },
      });
    }

    const result = await sql`
      INSERT INTO commissions (
        order_id, user_id, recipient_id, amount, commission_rate, relationship_level, status
      )
      VALUES (
        ${data.orderId}, ${data.userId}, ${data.recipientId}, 
        ${data.amount}, ${data.commissionRate}, ${data.relationshipLevel}, 'pending'
      )
      RETURNING *
    `;
    return result[0];
  },

  async getUserCommissions(userId: number) {
    if (USE_PRISMA_COMMISSIONS) {
      return await prisma.commission.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          order: true,
          user: true,
        },
      });
    }

    return await sql`
      SELECT c.*, o.total as order_total, u.name as buyer_name
      FROM commissions c
      JOIN orders o ON c.order_id = o.id
      JOIN users u ON c.user_id = u.id
      WHERE c.recipient_id = ${userId}
      ORDER BY c.created_at DESC
    `;
  },

  // Sales volume calculation
  async getSellerSalesVolume(sellerId: number) {
    if (USE_PRISMA_ORDERS) {
      const result = await prisma.order.aggregate({
        where: {
          userId: sellerId,
          status: 'completed',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
          },
        },
        _sum: {
          total: true,
        },
      });
      return result._sum.total || 0;
    }

    const result = await sql`
      SELECT COALESCE(SUM(o.total), 0) as total_volume
      FROM orders o
      WHERE o.user_id = ${sellerId}
      AND o.status = 'completed'
      AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    if (!Array.isArray(result) || result.length === 0) {
      return 0;
    }

    return parseFloat(result[0].total_volume);
  },

  // Helper function to close Prisma connection
  async disconnect() {
    await prisma.$disconnect();
  },
};

// Export Prisma client for direct use when needed
export { prisma };
