import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'sales_orders'
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      success: true,
      table_structure: tableInfo,
      message: "Table structure retrieved successfully",
    });
  } catch (error) {
    console.error("Error checking table structure:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check table structure",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
