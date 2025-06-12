import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "./auth"

const sql = neon(process.env.DATABASE_URL!)

// Types for product commission system
export type ProductCommissionTier = {
  id: number
  product_id: number
  product_name: string
  retail_price: number
  trader_price: number
  distributor_price: number
  trader_commission_min: number
  trader_commission_max: number
  distributor_commission_min: number
  distributor_commission_max: number
  created_at: string
  updated_at: string
}

export type UserRoleType = {
  id: number
  role_name: string
  description: string
  commission_multiplier: number
  created_at: string
  updated_at: string
}

export type UserRole = {
  id: number
  user_id: number
  role_id: number
  created_at: string
  updated_at: string
  role_name?: string
  commission_multiplier?: number
}

export type VolumeBonus = {
  id: number
  min_volume: number
  max_volume: number | null
  bonus_percentage: number
  created_at: string
  updated_at: string
}

// Initialize product commission tables
export async function initializeProductCommissionTables() {
  try {
    console.log("Initializing product commission tables...")
    
    // Execute the SQL from the product-commission-schema.sql file
    // In a real implementation, we would read the file and execute it
    // For simplicity, we'll just execute the key table creation statements
    
    // Create products table if it doesn't exist (to avoid reference errors)
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Create product_commission_tiers table
    await sql`
      CREATE TABLE IF NOT EXISTS product_commission_tiers (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        product_name TEXT NOT NULL,
        retail_price DECIMAL(10, 2) NOT NULL,
        trader_price DECIMAL(10, 2) NOT NULL,
        distributor_price DECIMAL(10, 2) NOT NULL,
        trader_commission_min DECIMAL(5, 2) NOT NULL,
        trader_commission_max DECIMAL(5, 2) NOT NULL,
        distributor_commission_min DECIMAL(5, 2) NOT NULL,
        distributor_commission_max DECIMAL(5, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id)
      )
    `
    
    // Create user_role_types table
    await sql`
      CREATE TABLE IF NOT EXISTS user_role_types (
        id SERIAL PRIMARY KEY,
        role_name TEXT NOT NULL,
        description TEXT,
        commission_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role_name)
      )
    `
    
    // Create user_roles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES user_role_types(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, role_id)
      )
    `
    
    // Create volume_bonus_tiers table
    await sql`
      CREATE TABLE IF NOT EXISTS volume_bonus_tiers (
        id SERIAL PRIMARY KEY,
        min_volume DECIMAL(10, 2) NOT NULL,
        max_volume DECIMAL(10, 2),
        bonus_percentage DECIMAL(5, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Check if tables have data, if not, insert default values
    await insertDefaultData()
    
    console.log("Product commission tables initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing product commission tables:", error)
    throw error
  }
}

// Insert default data for product commission system
async function insertDefaultData() {
  try {
    // Check if product_commission_tiers has data
    const tiersCount = await sql`SELECT COUNT(*) FROM product_commission_tiers`
    
    if (Array.isArray(tiersCount) && tiersCount.length > 0) {
      const count = tiersCount[0].count
      
      if (count === '0' || count === 0) {
        // Insert product commission tiers for known products
        const products = await sql`SELECT id, name FROM products`
        
        if (Array.isArray(products)) {
          // Golden GinSeng Water
          const ginSengWater = products.find(p => p.name.includes('Golden GinSeng Water'))
          if (ginSengWater) {
            await sql`
              INSERT INTO product_commission_tiers (
                product_id, product_name, retail_price, trader_price, distributor_price,
                trader_commission_min, trader_commission_max, distributor_commission_min, distributor_commission_max
              )
              VALUES (
                ${ginSengWater.id}, 'Golden GinSeng Water (480ml)', 18.70, 14.00, 11.00, 10.00, 15.00, 8.00, 12.00
              )
            `
          }
          
          // Honey Wild GinSeng
          const honeyGinSeng = products.find(p => p.name.includes('Honey Wild GinSeng'))
          if (honeyGinSeng) {
            await sql`
              INSERT INTO product_commission_tiers (
                product_id, product_name, retail_price, trader_price, distributor_price,
                trader_commission_min, trader_commission_max, distributor_commission_min, distributor_commission_max
              )
              VALUES (
                ${honeyGinSeng.id}, 'Honey Wild GinSeng', 997.00, 747.00, 587.00, 12.00, 18.00, 10.00, 15.00
              )
            `
          }
          
          // RealMan
          const realMan = products.find(p => p.name.includes('RealMan'))
          if (realMan) {
            await sql`
              INSERT INTO product_commission_tiers (
                product_id, product_name, retail_price, trader_price, distributor_price,
                trader_commission_min, trader_commission_max, distributor_commission_min, distributor_commission_max
              )
              VALUES (
                ${realMan.id}, 'RealMan (Men''s Health)', 3697.00, 2678.00, 2097.00, 15.00, 20.00, 12.00, 17.00
              )
            `
          }
        }
      }
    }
    
    // Check if user_role_types has data
    const rolesCount = await sql`SELECT COUNT(*) FROM user_role_types`
    
    if (Array.isArray(rolesCount) && rolesCount.length > 0) {
      const count = rolesCount[0].count
      
      if (count === '0' || count === 0) {
        // Insert default role types
        await sql`
          INSERT INTO user_role_types (role_name, description, commission_multiplier)
          VALUES ('Distributor', 'Base level distributor role', 1.0)
        `
        
        await sql`
          INSERT INTO user_role_types (role_name, description, commission_multiplier)
          VALUES ('Trader', 'Mid-level trader role with higher commission rates', 1.2)
        `
      }
    }
    
    // Check if volume_bonus_tiers has data
    const bonusCount = await sql`SELECT COUNT(*) FROM volume_bonus_tiers`
    
    if (Array.isArray(bonusCount) && bonusCount.length > 0) {
      const count = bonusCount[0].count
      
      if (count === '0' || count === 0) {
        // Insert default volume bonus tiers
        await sql`
          INSERT INTO volume_bonus_tiers (min_volume, max_volume, bonus_percentage)
          VALUES (0, 1000, 0.0)
        `
        
        await sql`
          INSERT INTO volume_bonus_tiers (min_volume, max_volume, bonus_percentage)
          VALUES (1000, 5000, 2.0)
        `
        
        await sql`
          INSERT INTO volume_bonus_tiers (min_volume, max_volume, bonus_percentage)
          VALUES (5000, 10000, 3.5)
        `
        
        await sql`
          INSERT INTO volume_bonus_tiers (min_volume, max_volume, bonus_percentage)
          VALUES (10000, NULL, 5.0)
        `
      }
    }
  } catch (error) {
    console.error("Error inserting default data:", error)
    throw error
  }
}

// Get all product commission tiers
export async function getProductCommissionTiers(): Promise<ProductCommissionTier[]> {
  try {
    const tiers = await sql`
      SELECT * FROM product_commission_tiers
      ORDER BY retail_price ASC
    `
    
    if (!Array.isArray(tiers)) {
      return []
    }
    
    return tiers as ProductCommissionTier[]
  } catch (error) {
    console.error("Error getting product commission tiers:", error)
    throw error
  }
}

// Get user's role
export async function getUserRole(userId: number): Promise<UserRole | null> {
  try {
    const roles = await sql`
      SELECT ur.*, urt.role_name, urt.commission_multiplier
      FROM user_roles ur
      JOIN user_role_types urt ON ur.role_id = urt.id
      WHERE ur.user_id = ${userId}
    `
    
    if (!Array.isArray(roles) || roles.length === 0) {
      return null
    }
    
    return roles[0] as UserRole
  } catch (error) {
    console.error("Error getting user role:", error)
    throw error
  }
}

// Set user's role
export async function setUserRole(userId: number, roleName: string): Promise<UserRole> {
  try {
    // Get role ID from role_name
    const roles = await sql`
      SELECT id FROM user_role_types
      WHERE role_name = ${roleName}
    `
    
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error(`Role "${roleName}" not found`)
    }
    
    const roleId = roles[0].id
    
    // Check if user already has a role
    const existingRole = await getUserRole(userId)
    
    if (existingRole) {
      // Update existing role
      const updated = await sql`
        UPDATE user_roles
        SET role_id = ${roleId}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
        RETURNING *
      `
      
      // Get the full role details
      const fullRole = await getUserRole(userId)
      return fullRole as UserRole
    }
    
    // Create new role
    const result = await sql`
      INSERT INTO user_roles (user_id, role_id)
      VALUES (${userId}, ${roleId})
      RETURNING *
    `
    
    // Get the full role details
    const fullRole = await getUserRole(userId)
    return fullRole as UserRole
  } catch (error) {
    console.error("Error setting user role:", error)
    throw error
  }
}

// Get volume bonus tier for a given sales volume
export async function getVolumeBonus(salesVolume: number): Promise<VolumeBonus | null> {
  try {
    const bonusTiers = await sql`
      SELECT * FROM volume_bonus_tiers
      WHERE min_volume <= ${salesVolume}
      AND (max_volume IS NULL OR max_volume > ${salesVolume})
      ORDER BY min_volume DESC
      LIMIT 1
    `
    
    if (!Array.isArray(bonusTiers) || bonusTiers.length === 0) {
      return null
    }
    
    return bonusTiers[0] as VolumeBonus
  } catch (error) {
    console.error("Error getting volume bonus:", error)
    throw error
  }
}

// Calculate commission for a product sale
export async function calculateProductCommission(
  productId: number,
  quantity: number,
  sellerId: number,
  buyerId: number
): Promise<number> {
  try {
    // Get product commission tier
    const tiers = await sql`
      SELECT * FROM product_commission_tiers
      WHERE product_id = ${productId}
    `
    
    if (!Array.isArray(tiers) || tiers.length === 0) {
      // Default commission rate if product not found in tiers
      return 0
    }
    
    const tier = tiers[0] as ProductCommissionTier
    
    // Get seller's role
    const sellerRole = await getUserRole(sellerId)
    const isTrader = sellerRole?.role_name === 'Trader'
    
    // Determine base commission rate based on role
    let minCommissionRate, maxCommissionRate
    if (isTrader) {
      minCommissionRate = tier.trader_commission_min
      maxCommissionRate = tier.trader_commission_max
    } else {
      // Default to distributor rates
      minCommissionRate = tier.distributor_commission_min
      maxCommissionRate = tier.distributor_commission_max
    }
    
    // Get seller's sales volume for volume bonus calculation
    const salesVolume = await getSellerSalesVolume(sellerId)
    const volumeBonus = await getVolumeBonus(salesVolume)
    
    // Calculate final commission rate with volume bonus
    let finalCommissionRate = minCommissionRate
    if (volumeBonus && volumeBonus.bonus_percentage > 0) {
      // Scale the commission rate based on volume bonus, not exceeding max rate
      const bonusAdjustedRate = minCommissionRate + (volumeBonus.bonus_percentage / 100)
      finalCommissionRate = Math.min(bonusAdjustedRate, maxCommissionRate)
    }
    
    // Calculate commission amount based on retail price
    const commissionAmount = (tier.retail_price * quantity) * (finalCommissionRate / 100)
    
    return commissionAmount
  } catch (error) {
    console.error("Error calculating product commission:", error)
    throw error
  }
}

// Get seller's total sales volume
async function getSellerSalesVolume(sellerId: number): Promise<number> {
  try {
    // Calculate actual sales volume from completed orders in current month
    const result = await sql`
      SELECT COALESCE(SUM(o.total), 0) as total_volume
      FROM orders o
      WHERE o.user_id = ${sellerId}
      AND o.status = 'completed'
      AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `
    
    if (!Array.isArray(result) || result.length === 0) {
      return 0
    }
    
    return parseFloat(result[0].total_volume)
  } catch (error) {
    console.error("Error getting seller sales volume:", error)
    return 0 // Return 0 instead of throwing to prevent commission calculation failures
  }
}

// Get all available user roles
export async function getUserRoleTypes(): Promise<UserRoleType[]> {
  try {
    const roleTypes = await sql`
      SELECT * FROM user_role_types
      ORDER BY commission_multiplier ASC
    `
    
    if (!Array.isArray(roleTypes)) {
      return []
    }
    
    return roleTypes as UserRoleType[]
  } catch (error) {
    console.error("Error getting user role types:", error)
    throw error
  }
}

// Get all volume bonus tiers
export async function getVolumeBonusTiers(): Promise<VolumeBonus[]> {
  try {
    const bonusTiers = await sql`
      SELECT * FROM volume_bonus_tiers
      ORDER BY min_volume ASC
    `
    
    if (!Array.isArray(bonusTiers)) {
      return []
    }
    
    return bonusTiers as VolumeBonus[]
  } catch (error) {
    console.error("Error getting volume bonus tiers:", error)
    throw error
  }
}
