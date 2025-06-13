import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Get all partners
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withGiftCounts = searchParams.get('withGiftCounts') === 'true';

    let query;
    if (withGiftCounts) {
      query = `
        SELECT 
          p.*,
          COUNT(gc.id) as gift_claims
        FROM partners p
        LEFT JOIN gift_claims gc ON p.id = gc.partner_id
        GROUP BY p.id
        ORDER BY p.name
      `;
    } else {
      query = `
        SELECT * FROM partners
        ORDER BY name
      `;
    }

    const result = await sql.query(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// Create a new partner
export async function POST(request: Request) {
  try {
    const { name, address, latitude, longitude } = await request.json();

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO partners (name, address, latitude, longitude)
      VALUES (${name}, ${address}, ${latitude}, ${longitude})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
