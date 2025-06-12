import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/types/user";

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

    // Get all users with their roles
    const users = await sql`
      SELECT id, name, email, image_url, role, created_at 
      FROM users 
      ORDER BY id ASC
    `;

    return NextResponse.json({
      users: users as User[]
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
