import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Direct database connection for simplicity
const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching product with ID:', id);

    // Ensure we're using a number for the ID
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Fetch product directly from the database
    const products = await sql`SELECT * FROM products WHERE id = ${numericId}`;
    console.log('Database query result:', JSON.stringify(products));

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    try {
      // Get related products
      const relatedProducts = await sql`
        SELECT * FROM products 
        WHERE category = ${product.category} 
        AND id != ${numericId} 
        LIMIT 3
      `;

      // Return the product and related products
      return NextResponse.json({
        product,
        relatedProducts: relatedProducts || [],
      });
    } catch (relatedError) {
      console.error('Error fetching related products:', relatedError);
      // If we can't get related products, still return the main product
      return NextResponse.json({
        product,
        relatedProducts: [],
      });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
