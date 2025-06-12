import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/migrations";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // Check if the user is authenticated and is an admin
    const user = await getCurrentUser();
    
    // Only allow initialization by admin or in development environment
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = user?.role === 'admin';
    
    if (!isDev && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Run migrations
    await runMigrations();
    
    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    });
  } catch (error) {
    console.error("Initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
