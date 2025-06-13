// This script initializes the database schema and populates it with sample data
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Connect to the database
    const client = await pool.connect();

    try {
      console.log('Connected to database. Executing schema...');

      // Execute the schema SQL
      await client.query(schemaSql);

      console.log('Schema executed successfully!');

      // Check if products were inserted
      const result = await client.query('SELECT COUNT(*) FROM products');
      console.log(`Products in database: ${result.rows[0].count}`);

      // Insert more sample products if needed
      if (parseInt(result.rows[0].count) < 10) {
        console.log('Adding more sample products...');

        // Read and execute additional product inserts if needed
        // This is where you could add more products if needed
      }
    } finally {
      client.release();
    }

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the setup function
setupDatabase();
