import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Create a new membership
export async function POST(request: Request) {
  try {
    const { userId, tier = 'essential', email, name } = await request.json();

    // Validate required fields
    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS memberships (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        tier TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert user if not exists
    await sql`
      INSERT INTO users (id, email, name)
      VALUES (${userId}, ${email}, ${name})
      ON CONFLICT (id) DO NOTHING
    `;

    // Insert membership
    const result = await sql`
      INSERT INTO memberships (user_id, tier)
      VALUES (${userId}, ${tier})
      RETURNING id, tier, points, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating membership:', error);
    return NextResponse.json(
      { error: 'Failed to create membership' },
      { status: 500 }
    );
  }
}

// Get membership by user ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT m.id, m.tier, m.points, m.created_at, m.updated_at, u.name, u.email
      FROM memberships m
      JOIN users u ON m.user_id = u.id
      WHERE m.user_id = ${userId}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch membership' },
      { status: 500 }
    );
  }
}

// Update membership tier
export async function PATCH(request: Request) {
  try {
    const { userId, tier, points } = await request.json();

    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'User ID and tier are required' },
        { status: 400 }
      );
    }

    const updateFields = [];
    const values: any[] = [];

    if (tier) {
      updateFields.push(`tier = $${updateFields.length + 1}`);
      values.push(tier);
    }

    if (points !== undefined) {
      updateFields.push(`points = $${updateFields.length + 1}`);
      values.push(points);
    }

    updateFields.push(`updated_at = $${updateFields.length + 1}`);
    values.push(new Date());

    values.push(userId);

    const query = `
      UPDATE memberships
      SET ${updateFields.join(', ')}
      WHERE user_id = $${values.length}
      RETURNING id, tier, points, updated_at
    `;

    const result = await sql.query(query, values);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating membership:', error);
    return NextResponse.json(
      { error: 'Failed to update membership' },
      { status: 500 }
    );
  }
}
