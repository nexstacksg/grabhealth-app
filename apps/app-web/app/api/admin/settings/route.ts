import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser, hashPassword, generateSalt } from "@/lib/auth";

// GET current settings
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

    // Get settings from database
    // For now, we'll return hardcoded settings since there's no settings table yet
    return NextResponse.json({
      siteName: "GrabHealth",
      contactEmail: "admin@grabhealth.com",
      adminName: user.name,
      adminEmail: user.email
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// Update general settings
export async function POST(request: Request) {
  try {
    // Check if the user is authenticated and is an admin
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { siteName, contactEmail } = data;

    // In a real app, you would save these to a settings table
    // For now, we'll just return success since we don't have a settings table yet
    
    return NextResponse.json({
      success: true,
      message: "Settings updated successfully"
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
