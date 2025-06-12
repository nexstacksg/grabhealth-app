-- Commission System Tables for GrabHealth

-- Create user_relationships table to track upline/downline connections
CREATE TABLE IF NOT EXISTS user_relationships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upline_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  relationship_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, upline_id)
);

-- Create commission_tiers table to define commission rates by level
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
);

-- Create commissions table to track earned commissions
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
);

-- Create user_points table to track points earned from commissions
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Insert default commission tiers if the table is empty
INSERT INTO commission_tiers (tier_level, tier_name, direct_commission_rate, indirect_commission_rate, points_rate)
SELECT 1, 'Tier 1 (Direct Sales)', 0.30, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM commission_tiers WHERE tier_level = 1);

INSERT INTO commission_tiers (tier_level, tier_name, direct_commission_rate, indirect_commission_rate, points_rate)
SELECT 2, 'Tier 2 (Indirect Sales)', 0.30, 0.10, 0
WHERE NOT EXISTS (SELECT 1 FROM commission_tiers WHERE tier_level = 2);

INSERT INTO commission_tiers (tier_level, tier_name, direct_commission_rate, indirect_commission_rate, points_rate)
SELECT 3, 'Tier 3 (Points)', 0.30, 0.00, 10
WHERE NOT EXISTS (SELECT 1 FROM commission_tiers WHERE tier_level = 3);

INSERT INTO commission_tiers (tier_level, tier_name, direct_commission_rate, indirect_commission_rate, points_rate)
SELECT 4, 'Tier 4+ (Legacy)', 0.30, 0.00, 5
WHERE NOT EXISTS (SELECT 1 FROM commission_tiers WHERE tier_level = 4);
