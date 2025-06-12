import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "./auth"

const sql = neon(process.env.DATABASE_URL!)

// Types for commission system
export type UserRelationship = {
  id: number
  user_id: number
  upline_id: number | null
  relationship_level: number
  created_at: string
  updated_at: string
}

export type CommissionTier = {
  id: number
  tier_level: number
  tier_name: string
  direct_commission_rate: number
  indirect_commission_rate: number
  points_rate: number
  created_at: string
  updated_at: string
}

export type Commission = {
  id: number
  order_id: number
  user_id: number
  recipient_id: number
  amount: number
  commission_rate: number
  relationship_level: number
  status: string
  created_at: string
  updated_at: string
}

export type UserPoints = {
  id: number
  user_id: number
  points: number
  created_at: string
  updated_at: string
}

// Initialize commission tables
export async function initializeCommissionTables() {
  try {
    console.log("Initializing commission tables...")
    
    // Create user_relationships table
    await sql`
      CREATE TABLE IF NOT EXISTS user_relationships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        upline_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        relationship_level INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, upline_id)
      )
    `
    
    // Create commission_tiers table
    await sql`
      CREATE TABLE IF NOT EXISTS commission_tiers (
        id SERIAL PRIMARY KEY,
        tier_level INTEGER NOT NULL,
        tier_name TEXT NOT NULL,
        direct_commission_rate DECIMAL(5, 2) NOT NULL,
        indirect_commission_rate DECIMAL(5, 2) NOT NULL,
        points_rate INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tier_level)
      )
    `
    
    // Create orders table if it doesn't exist (to avoid reference errors)
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total DECIMAL(10, 2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Create commissions table
    await sql`
      CREATE TABLE IF NOT EXISTS commissions (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        commission_rate DECIMAL(5, 2) NOT NULL,
        relationship_level INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Create user_points table
    await sql`
      CREATE TABLE IF NOT EXISTS user_points (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `

    // Check if commission_tiers has data, if not, insert default tiers
    const tiersCount = await sql`SELECT COUNT(*) FROM commission_tiers`
    
    if (Array.isArray(tiersCount) && tiersCount.length > 0) {
      const count = tiersCount[0].count
      
      if (count === '0' || count === 0) {
        // Insert tiers one by one
        await sql`INSERT INTO commission_tiers (tier_level, tier_name, direct_commission_rate, indirect_commission_rate, points_rate) VALUES (1, 'Tier 1 (Direct Sales)', 0.30, 0.00, 0)`
        await sql`INSERT INTO commission_tiers (tier_level, tier_name, direct_commission_rate, indirect_commission_rate, points_rate) VALUES (2, 'Tier 2 (Indirect Sales)', 0.30, 0.10, 0)`
        await sql`INSERT INTO commission_tiers (tier_level, tier_name, direct_commission_rate, indirect_commission_rate, points_rate) VALUES (3, 'Tier 3 (Points)', 0.30, 0.00, 10)`
        await sql`INSERT INTO commission_tiers (tier_level, tier_name, direct_commission_rate, indirect_commission_rate, points_rate) VALUES (4, 'Tier 4+ (Legacy)', 0.30, 0.00, 5)`
      }
    }

    console.log("Commission tables initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing commission tables:", error)
    throw error
  }
}

// Get user's upline (supervisor)
export async function getUserUpline(userId: number): Promise<UserRelationship | null> {
  try {
    const relationships = await sql`
      SELECT * FROM user_relationships
      WHERE user_id = ${userId}
      ORDER BY relationship_level ASC
      LIMIT 1
    `
    
    if (!Array.isArray(relationships) || relationships.length === 0) {
      return null
    }
    
    return relationships[0] as UserRelationship
  } catch (error) {
    console.error("Error getting user upline:", error)
    throw error
  }
}

// Get user's downlines
export async function getUserDownlines(userId: number): Promise<UserRelationship[]> {
  try {
    const relationships = await sql`
      SELECT * FROM user_relationships
      WHERE upline_id = ${userId}
      ORDER BY relationship_level ASC
    `
    
    if (!Array.isArray(relationships)) {
      return []
    }
    
    return relationships as UserRelationship[]
  } catch (error) {
    console.error("Error getting user downlines:", error)
    throw error
  }
}

// Set user's upline (supervisor)
export async function setUserUpline(userId: number, uplineId: number, level: number = 1): Promise<UserRelationship> {
  try {
    // Prevent self-reference
    if (userId === uplineId) {
      throw new Error("User cannot be their own upline")
    }
    
    // Check if relationship already exists
    const existingRelationship = await sql`
      SELECT * FROM user_relationships
      WHERE user_id = ${userId} AND upline_id = ${uplineId}
    `
    
    if (Array.isArray(existingRelationship) && existingRelationship.length > 0) {
      // Update existing relationship
      const updated = await sql`
        UPDATE user_relationships
        SET relationship_level = ${level}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND upline_id = ${uplineId}
        RETURNING *
      `
      
      return updated[0] as UserRelationship
    }
    
    // Create new relationship
    const result = await sql`
      INSERT INTO user_relationships (user_id, upline_id, relationship_level)
      VALUES (${userId}, ${uplineId}, ${level})
      RETURNING *
    `
    
    return result[0] as UserRelationship
  } catch (error) {
    console.error("Error setting user upline:", error)
    throw error
  }
}

// Calculate and record commissions for an order
export async function calculateCommissions(orderId: number, userId: number, orderTotal: number): Promise<Commission[]> {
  try {
    // Get commission tiers
    const tiers = await sql`SELECT * FROM commission_tiers ORDER BY tier_level ASC` as CommissionTier[]
    
    // Get user's upline chain (up to 4 levels)
    const uplineChain = await getUplineChain(userId, 4)
    
    const commissions: Commission[] = []
    
    // Process each upline based on their level
    for (const upline of uplineChain) {
      const level = upline.relationship_level
      const tier = tiers.find(t => t.tier_level === level)
      
      if (!tier) continue
      
      // Calculate commission amount based on tier
      let commissionRate = 0
      let commissionAmount = 0
      
      if (level === 1) {
        // Direct upline (supervisor) gets direct commission
        commissionRate = tier.direct_commission_rate
        commissionAmount = orderTotal * commissionRate
      } else if (level === 2) {
        // Indirect upline gets indirect commission
        commissionRate = tier.indirect_commission_rate
        commissionAmount = orderTotal * commissionRate
      } else {
        // Higher levels get points instead of direct commission
        commissionRate = 0
        commissionAmount = 0
        
        // Add points if applicable
        if (tier.points_rate > 0) {
          await addUserPoints(upline.upline_id!, Math.floor(orderTotal * tier.points_rate / 100))
        }
      }
      
      // Record commission if amount > 0
      if (commissionAmount > 0) {
        const commission = await sql`
          INSERT INTO commissions (
            order_id, user_id, recipient_id, amount, commission_rate, relationship_level, status
          )
          VALUES (
            ${orderId}, ${userId}, ${upline.upline_id}, ${commissionAmount}, ${commissionRate}, ${level}, 'pending'
          )
          RETURNING *
        ` as Commission[]
        
        if (Array.isArray(commission) && commission.length > 0) {
          commissions.push(commission[0])
        }
      }
    }
    
    return commissions
  } catch (error) {
    console.error("Error calculating commissions:", error)
    throw error
  }
}

// Get user's upline chain (multiple levels)
async function getUplineChain(userId: number, maxLevels: number = 4): Promise<UserRelationship[]> {
  try {
    // This query gets all uplines for a user up to maxLevels
    const uplines = await sql`
      WITH RECURSIVE upline_chain AS (
        SELECT * FROM user_relationships
        WHERE user_id = ${userId} AND upline_id IS NOT NULL
        
        UNION
        
        SELECT ur.* FROM user_relationships ur
        JOIN upline_chain uc ON ur.user_id = uc.upline_id
        WHERE ur.upline_id IS NOT NULL AND uc.relationship_level < ${maxLevels}
      )
      SELECT * FROM upline_chain
      ORDER BY relationship_level ASC
    `
    
    if (!Array.isArray(uplines)) {
      return []
    }
    
    return uplines as UserRelationship[]
  } catch (error) {
    console.error("Error getting upline chain:", error)
    throw error
  }
}

// Add points to a user
export async function addUserPoints(userId: number, points: number): Promise<UserPoints> {
  try {
    // Check if user already has points
    const existingPoints = await sql`
      SELECT * FROM user_points
      WHERE user_id = ${userId}
    `
    
    if (Array.isArray(existingPoints) && existingPoints.length > 0) {
      // Update existing points
      const currentPoints = existingPoints[0].points || 0
      const newPoints = currentPoints + points
      
      const updated = await sql`
        UPDATE user_points
        SET points = ${newPoints}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
        RETURNING *
      `
      
      return updated[0] as UserPoints
    }
    
    // Create new points record
    const result = await sql`
      INSERT INTO user_points (user_id, points)
      VALUES (${userId}, ${points})
      RETURNING *
    `
    
    return result[0] as UserPoints
  } catch (error) {
    console.error("Error adding user points:", error)
    throw error
  }
}

// Get user's commissions
export async function getUserCommissions(userId: number): Promise<Commission[]> {
  try {
    const commissions = await sql`
      SELECT c.*, o.total as order_total, u.name as buyer_name
      FROM commissions c
      JOIN orders o ON c.order_id = o.id
      JOIN users u ON c.user_id = u.id
      WHERE c.recipient_id = ${userId}
      ORDER BY c.created_at DESC
    `
    
    if (!Array.isArray(commissions)) {
      return []
    }
    
    return commissions as Commission[]
  } catch (error) {
    console.error("Error getting user commissions:", error)
    throw error
  }
}

// Get user's points
export async function getUserPoints(userId: number): Promise<number> {
  try {
    const points = await sql`
      SELECT points FROM user_points
      WHERE user_id = ${userId}
    `
    
    if (!Array.isArray(points) || points.length === 0) {
      return 0
    }
    
    return points[0].points || 0
  } catch (error) {
    console.error("Error getting user points:", error)
    throw error
  }
}

// Generate QR code referral link for a user
export async function generateReferralLink(userId: number): Promise<string> {
  // In a real implementation, this would generate a unique QR code
  // For simplicity, we'll just return a URL that can be used to register a new user
  return `${process.env.NEXT_PUBLIC_APP_URL || 'https://grab-health-ai.vercel.app'}/auth/register?referrer=${userId}`
}
