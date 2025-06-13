import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if the user is authenticated and is an admin
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get the user's downline (all users in their network)
    const downline = await sql`
      WITH RECURSIVE user_tree AS (
        -- Base case: direct downline
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          un.parent_id,
          un.level
        FROM users u
        JOIN user_networks un ON u.id = un.user_id
        WHERE un.parent_id = ${userId}
        
        UNION ALL
        
        -- Recursive case: downline of downline
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          un.parent_id,
          un.level
        FROM users u
        JOIN user_networks un ON u.id = un.user_id
        JOIN user_tree ut ON un.parent_id = ut.id
      )
      SELECT * FROM user_tree
      ORDER BY level, name
    `;

    return NextResponse.json({
      downline,
    });
  } catch (error) {
    console.error('Error fetching user downline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user downline' },
      { status: 500 }
    );
  }
}
