import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Get partner by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`
      SELECT * FROM partners
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get gift claims for this partner
    const giftClaims = await sql`
      SELECT 
        gc.id,
        gc.claimed_at,
        u.name as user_name,
        gi.name as gift_name,
        gi.description as gift_description,
        mt.name as tier_name
      FROM gift_claims gc
      JOIN users u ON gc.user_id = u.id
      JOIN gift_items gi ON gc.gift_id = gi.id
      JOIN membership_tiers mt ON gi.tier_id = mt.id
      WHERE gc.partner_id = ${id}
      ORDER BY gc.claimed_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      ...result[0],
      gift_claims: giftClaims,
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

// Update partner
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, address, latitude, longitude } = await request.json();

    const updateFields = [];
    const values: any[] = [];

    if (name) {
      updateFields.push(`name = $${updateFields.length + 1}`);
      values.push(name);
    }

    if (address) {
      updateFields.push(`address = $${updateFields.length + 1}`);
      values.push(address);
    }

    if (latitude) {
      updateFields.push(`latitude = $${updateFields.length + 1}`);
      values.push(latitude);
    }

    if (longitude) {
      updateFields.push(`longitude = $${updateFields.length + 1}`);
      values.push(longitude);
    }

    values.push(id);

    const query = `
      UPDATE partners
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await sql.query(query, values);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// Delete partner
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if partner exists
    const partner = await sql`
      SELECT id FROM partners
      WHERE id = ${id}
    `;

    if (partner.length === 0) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Delete gift claims associated with this partner
    await sql`
      DELETE FROM gift_claims
      WHERE partner_id = ${id}
    `;

    // Delete partner
    await sql`
      DELETE FROM partners
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
