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

    // Fetch the user details
    const user = await sql`
      SELECT u.id, u.name, u.email, u.image_url, u.created_at, u.role, COALESCE(up.points, 0) as user_points
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      WHERE u.id = ${userId}
    `;

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Get the request body
    const { name, email, role, user_points } = await request.json();

    // Validate role if provided
    if (
      role &&
      !['admin', 'customer', 'sales', 'leader', 'manager', 'company'].includes(
        role
      )
    ) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate email if provided
    if (email && !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate points if provided
    if (user_points !== undefined) {
      const pointsValue = parseInt(user_points.toString());
      if (isNaN(pointsValue) || pointsValue < 0) {
        return NextResponse.json(
          { error: 'Invalid points value' },
          { status: 400 }
        );
      }
    }

    // Build SQL update query directly rather than using fragments
    const updateFields = [];
    const updateValues = [];

    // Check if fields are provided (including empty strings)
    if (name !== undefined) {
      updateFields.push('name');
      updateValues.push(name);
    }

    if (email !== undefined) {
      updateFields.push('email');
      updateValues.push(email);
    }

    if (role !== undefined) {
      updateFields.push('role');
      updateValues.push(role);
    }

    // Handle user_points separately since it's in a different table
    if (user_points !== undefined) {
      try {
        const pointsValue = parseInt(user_points.toString());

        if (isNaN(pointsValue)) {
          return NextResponse.json(
            { error: 'Invalid points value: must be a number' },
            { status: 400 }
          );
        }

        console.log(
          'Updating points for user:',
          userId,
          'to value:',
          pointsValue
        );

        // Check if user already has points record
        const existingPoints = await sql`
          SELECT id FROM user_points WHERE user_id = ${userId}
        `;

        if (existingPoints.length > 0) {
          // Update existing points
          await sql`
            UPDATE user_points 
            SET points = ${pointsValue}, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ${userId}
          `;
        } else {
          // Insert new points record
          await sql`
            INSERT INTO user_points (user_id, points)
            VALUES (${userId}, ${pointsValue})
          `;
        }
      } catch (pointsError) {
        console.error('Error updating user points:', pointsError);
        return NextResponse.json(
          {
            error: `Failed to update user points: ${pointsError instanceof Error ? pointsError.message : 'Unknown error'}`,
          },
          { status: 500 }
        );
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    console.log('Update fields:', updateFields);
    console.log('Update values:', updateValues);
    console.log('User ID:', userId);

    // Construct the SQL update statement
    try {
      // Build the SET clause with placeholders
      const setClause = updateFields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(', ');

      // Execute the update query
      await sql.query(
        `UPDATE users SET ${setClause} WHERE id = $${updateFields.length + 1}`,
        [...updateValues, userId]
      );
    } catch (error) {
      console.error('SQL Error:', error);
      return NextResponse.json(
        {
          error: `Database error: ${error instanceof Error ? error.message : 'Unknown SQL error'}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update user',
      },
      { status: 500 }
    );
  }
}
