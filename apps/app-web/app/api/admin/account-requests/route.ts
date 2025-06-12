import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // Check if the user is authenticated and is an admin
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get all account requests
    const requests = await sql`
      SELECT * FROM account_requests
      ORDER BY 
        CASE 
          WHEN status = 'pending' THEN 1
          WHEN status = 'approved' THEN 2
          ELSE 3
        END,
        created_at DESC
    `;

    return NextResponse.json({
      requests
    });
  } catch (error) {
    console.error("Error fetching account requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch account requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // This endpoint can be accessed by anyone to request an account
    const { name, email, role } = await request.json();
    
    // Validate input
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email and role are required" },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['customer', 'sales', 'leader', 'manager', 'company'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role requested" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if request already exists
    const existingRequest = await sql`SELECT * FROM account_requests WHERE email = ${email}`;
    if (existingRequest.length > 0) {
      return NextResponse.json(
        { error: "Account request with this email already exists" },
        { status: 400 }
      );
    }

    // Create account request
    await sql`
      INSERT INTO account_requests (name, email, role, status)
      VALUES (${name}, ${email}, ${role}, 'pending')
    `;

    return NextResponse.json({
      success: true,
      message: "Account request submitted successfully",
    });
  } catch (error) {
    console.error("Error creating account request:", error);
    return NextResponse.json(
      { error: "Failed to create account request" },
      { status: 500 }
    );
  }
}
