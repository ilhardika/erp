import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await sql`
      SELECT 
        id, 
        username, 
        full_name, 
        email, 
        role, 
        created_at
      FROM users 
      ORDER BY full_name ASC, username ASC
    `;

    return NextResponse.json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
