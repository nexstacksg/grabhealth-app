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

    // Get total users count
    const totalUsersResult = await sql`SELECT COUNT(*) as count FROM users`;
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get pending account requests count
    const pendingRequestsResult = await sql`
      SELECT COUNT(*) as count FROM account_requests WHERE status = 'pending'
    `;
    const pendingRequests = pendingRequestsResult[0]?.count || 0;

    // Get users by role
    const usersByRoleResult = await sql`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `;

    // Convert to a more usable format
    const usersByRole: Record<string, number> = {};
    if (Array.isArray(usersByRoleResult)) {
      usersByRoleResult.forEach((row) => {
        if (row && typeof row === 'object' && 'role' in row && 'count' in row) {
          const role = row.role as string || 'customer';
          usersByRole[role] = Number(row.count) || 0;
        }
      });
    }

    return NextResponse.json({
      totalUsers,
      pendingRequests,
      usersByRole
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
