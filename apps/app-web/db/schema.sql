-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_essential DECIMAL(5, 2) DEFAULT 0.10,
  discount_premium DECIMAL(5, 2) DEFAULT 0.25,
  category VARCHAR(100),
  image_url TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products if the table is empty
INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Multivitamin Daily', 
  'Complete daily multivitamin with essential nutrients for overall health and wellbeing.', 
  19.99, 
  'Vitamins', 
  'https://placehold.co/300x300/e6f7ff/0a85ff?text=Multivitamin', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Omega-3 Fish Oil', 
  'High-quality fish oil supplement rich in EPA and DHA for heart and brain health.', 
  24.99, 
  'Supplements', 
  'https://placehold.co/300x300/fff5e6/ff8c00?text=Omega-3', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Vitamin C 1000mg', 
  'High-potency vitamin C with rose hips for immune support and antioxidant protection.', 
  15.99, 
  'Vitamins', 
  'https://placehold.co/300x300/f9f9f9/ff6b6b?text=Vitamin+C', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Digital Blood Pressure Monitor', 
  'Accurate and easy-to-use digital blood pressure monitor for home use.', 
  59.99, 
  'Personal Care', 
  'https://placehold.co/300x300/f0f0f0/4a90e2?text=BP+Monitor', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'First Aid Kit', 
  'Comprehensive first aid kit with essential supplies for emergency situations.', 
  29.99, 
  'First Aid', 
  'https://placehold.co/300x300/ffebeb/ff4d4d?text=First+Aid', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Probiotic Complex', 
  'Advanced probiotic formula with multiple strains for digestive health and immune support.', 
  34.99, 
  'Supplements', 
  'https://placehold.co/300x300/e8f5e9/43a047?text=Probiotic', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Magnesium Glycinate', 
  'Highly absorbable form of magnesium for muscle relaxation and nervous system support.', 
  22.99, 
  'Supplements', 
  'https://placehold.co/300x300/e3f2fd/2196f3?text=Magnesium', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Vitamin D3 5000 IU', 
  'High-potency vitamin D3 for bone health, immune function, and mood support.', 
  18.99, 
  'Vitamins', 
  'https://placehold.co/300x300/fffde7/fbc02d?text=Vitamin+D3', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Digital Thermometer', 
  'Fast and accurate digital thermometer for oral, rectal, or underarm temperature readings.', 
  12.99, 
  'Personal Care', 
  'https://placehold.co/300x300/e0f7fa/00bcd4?text=Thermometer', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, category, image_url, in_stock)
SELECT 
  'Zinc Lozenges', 
  'Soothing zinc lozenges with vitamin C for immune support during cold season.', 
  9.99, 
  'Supplements', 
  'https://placehold.co/300x300/f3e5f5/9c27b0?text=Zinc', 
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
