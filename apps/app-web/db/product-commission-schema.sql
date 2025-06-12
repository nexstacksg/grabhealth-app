-- Product Commission Structure Tables for GrabHealth

-- Create product_commission_tiers table to define product-specific pricing and commission rates
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
);

-- Create user_role_types table to define different roles in the commission structure
CREATE TABLE IF NOT EXISTS user_role_types (
  id SERIAL PRIMARY KEY,
  role_name TEXT NOT NULL,
  description TEXT,
  commission_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_name)
);

-- Create user_roles table to assign roles to users
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES user_role_types(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role_id)
);

-- Create volume_bonus_tiers table to define volume-based bonus rates
CREATE TABLE IF NOT EXISTS volume_bonus_tiers (
  id SERIAL PRIMARY KEY,
  min_volume DECIMAL(10, 2) NOT NULL,
  max_volume DECIMAL(10, 2),
  bonus_percentage DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default product commission tiers
INSERT INTO product_commission_tiers (
  product_id, product_name, retail_price, trader_price, distributor_price,
  trader_commission_min, trader_commission_max, distributor_commission_min, distributor_commission_max
)
SELECT 
  p.id, 'Golden GinSeng Water (480ml)', 18.70, 14.00, 11.00, 10.00, 15.00, 8.00, 12.00
FROM 
  products p 
WHERE 
  p.name LIKE 'Golden GinSeng Water%' AND
  NOT EXISTS (SELECT 1 FROM product_commission_tiers WHERE product_name = 'Golden GinSeng Water (480ml)')
LIMIT 1;

INSERT INTO product_commission_tiers (
  product_id, product_name, retail_price, trader_price, distributor_price,
  trader_commission_min, trader_commission_max, distributor_commission_min, distributor_commission_max
)
SELECT 
  p.id, 'Honey Wild GinSeng', 997.00, 747.00, 587.00, 12.00, 18.00, 10.00, 15.00
FROM 
  products p 
WHERE 
  p.name LIKE 'Honey Wild GinSeng%' AND
  NOT EXISTS (SELECT 1 FROM product_commission_tiers WHERE product_name = 'Honey Wild GinSeng')
LIMIT 1;

INSERT INTO product_commission_tiers (
  product_id, product_name, retail_price, trader_price, distributor_price,
  trader_commission_min, trader_commission_max, distributor_commission_min, distributor_commission_max
)
SELECT 
  p.id, 'RealMan (Men''s Health)', 3697.00, 2678.00, 2097.00, 15.00, 20.00, 12.00, 17.00
FROM 
  products p 
WHERE 
  p.name LIKE 'RealMan%' AND
  NOT EXISTS (SELECT 1 FROM product_commission_tiers WHERE product_name = 'RealMan (Men''s Health)')
LIMIT 1;

-- Insert default user role types
INSERT INTO user_role_types (role_name, description, commission_multiplier)
VALUES ('Distributor', 'Base level distributor role', 1.0)
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO user_role_types (role_name, description, commission_multiplier)
VALUES ('Trader', 'Mid-level trader role with higher commission rates', 1.2)
ON CONFLICT (role_name) DO NOTHING;

-- Insert default volume bonus tiers
INSERT INTO volume_bonus_tiers (min_volume, max_volume, bonus_percentage)
VALUES (0, 1000, 0.0)
ON CONFLICT DO NOTHING;

INSERT INTO volume_bonus_tiers (min_volume, max_volume, bonus_percentage)
VALUES (1000, 5000, 2.0)
ON CONFLICT DO NOTHING;

INSERT INTO volume_bonus_tiers (min_volume, max_volume, bonus_percentage)
VALUES (5000, 10000, 3.5)
ON CONFLICT DO NOTHING;

INSERT INTO volume_bonus_tiers (min_volume, max_volume, bonus_percentage)
VALUES (10000, NULL, 5.0)
ON CONFLICT DO NOTHING;
