import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    // Check if the user is authenticated and is an admin
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get network leaders with their downline counts
    // This query gets users who are leaders or have downlines
    const networks = await sql`
      WITH downline_counts AS (
        SELECT 
          parent_id,
          COUNT(*) as count
        FROM user_networks
        GROUP BY parent_id
      )
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        COALESCE(dc.count, 0) as downline_count
      FROM users u
      LEFT JOIN downline_counts dc ON u.id = dc.parent_id
      WHERE 
        u.role IN ('leader', 'manager') 
        OR dc.count > 0
      ORDER BY downline_count DESC, u.name ASC
    `;

    return NextResponse.json({
      networks,
    });
  } catch (error) {
    console.error('Error fetching networks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch networks' },
      { status: 500 }
    );
  }
}
