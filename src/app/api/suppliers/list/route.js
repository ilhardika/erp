import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - Get simplified suppliers list for dropdowns
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let whereClause = "WHERE status = 'active'";
    let queryParams = [];

    if (search) {
      whereClause += " AND (name ILIKE $1 OR code ILIKE $1)";
      queryParams.push(`%${search}%`);
    }

    const suppliers = await sql.query(
      `SELECT id, code, name FROM suppliers ${whereClause} ORDER BY name ASC`,
      queryParams
    );

    return NextResponse.json({
      success: true,
      data: suppliers,
      total: suppliers.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

