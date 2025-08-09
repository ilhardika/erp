import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET /api/purchases/orders/stats - Get purchase order statistics
export async function GET() {
  try {
    // Get total orders
    const totalQuery = `SELECT COUNT(*) as total FROM purchase_orders`;
    const totalResult = await sql.query(totalQuery);
    const totalOrders = parseInt(totalResult[0].total);

    // Get pending orders
    const pendingQuery = `SELECT COUNT(*) as total FROM purchase_orders WHERE status = 'pending'`;
    const pendingResult = await sql.query(pendingQuery);
    const pendingOrders = parseInt(pendingResult[0].total);

    // Get approved orders
    const approvedQuery = `SELECT COUNT(*) as total FROM purchase_orders WHERE status = 'approved'`;
    const approvedResult = await sql.query(approvedQuery);
    const approvedOrders = parseInt(approvedResult[0].total);

    // Get total value
    const valueQuery = `SELECT COALESCE(SUM(total_amount), 0) as total FROM purchase_orders WHERE status != 'cancelled'`;
    const valueResult = await sql.query(valueQuery);
    const totalValue = parseFloat(valueResult[0].total) || 0;

    return NextResponse.json({
      success: true,
      totalOrders,
      pendingOrders,
      approvedOrders,
      totalValue,
    });
  } catch (error) {
    console.error("Error fetching purchase order stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch purchase order statistics",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
