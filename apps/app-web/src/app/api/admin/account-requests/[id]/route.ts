import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
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
    const { status } = await request.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get the account request
    const accountRequests = await sql`
      SELECT * FROM account_requests WHERE id = ${requestId}
    `;

    if (!Array.isArray(accountRequests) || accountRequests.length === 0) {
      return NextResponse.json(
        { error: 'Account request not found' },
        { status: 404 }
      );
    }

    const accountRequest = accountRequests[0];

    // Update the account request status
    await sql`
      UPDATE account_requests 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
    `;

    // If approved, create the user account with a temporary password
    if (status === 'approved') {
      try {
        // Generate a temporary password (in a real app, you would email this to the user)
        const tempPassword = Math.random().toString(36).slice(-8);

        // Create the user
        await createUser(
          accountRequest.name,
          accountRequest.email,
          tempPassword
        );

        // Update the user's role
        await sql`
          UPDATE users 
          SET role = ${accountRequest.role}
          WHERE email = ${accountRequest.email}
        `;
      } catch (error) {
        console.error('Error creating user from account request:', error);

        // If user creation fails, revert the account request status
        await sql`
          UPDATE account_requests 
          SET status = 'pending', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${requestId}
        `;

        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Account request ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating account request:', error);
    return NextResponse.json(
      { error: 'Failed to update account request' },
      { status: 500 }
    );
  }
}
