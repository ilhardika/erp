import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get total purchase orders count
    const totalOrdersResult = await sql`
      SELECT COUNT(*) as count FROM purchase_orders
    `;
    const totalOrders = parseInt(totalOrdersResult[0].count);

    // Get total purchase amount
    const totalAmountResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM purchase_orders
      WHERE status != 'cancelled'
    `;
    const totalAmount = parseFloat(totalAmountResult[0].total);

    // Get orders by status
    const statusStatsResult = await sql`
      SELECT status, COUNT(*) as count 
      FROM purchase_orders 
      GROUP BY status
    `;

    const statusStats = {};
    statusStatsResult.forEach((row) => {
      statusStats[row.status] = parseInt(row.count);
    });

    // Get active orders (not completed or cancelled)
    const activeOrdersResult = await sql`
      SELECT COUNT(*) as count FROM purchase_orders
      WHERE status NOT IN ('completed', 'cancelled')
    `;
    const activeOrders = parseInt(activeOrdersResult[0].count);

    // Get active suppliers (suppliers with orders in last 3 months)
    const activeSuppliersResult = await sql`
      SELECT COUNT(DISTINCT supplier_id) as count 
      FROM purchase_orders 
      WHERE created_at >= CURRENT_DATE - INTERVAL '3 months'
    `;
    const activeSuppliers = parseInt(activeSuppliersResult[0].count);

    // Get recent orders (last 5)
    const recentOrdersResult = await sql`
      SELECT 
        po.id,
        po.po_number,
        po.status,
        po.total_amount,
        po.created_at,
        s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.created_at DESC
      LIMIT 5
    `;

    // Get monthly stats for current year
    const monthlyStatsResult = await sql`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as orders_count,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM purchase_orders
      WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND status != 'cancelled'
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;

    const monthlyStats = monthlyStatsResult.map((row) => ({
      month: parseInt(row.month),
      orders_count: parseInt(row.orders_count),
      total_amount: parseFloat(row.total_amount),
    }));

    const stats = {
      total_orders: totalOrders,
      total_amount: totalAmount,
      active_orders: activeOrders,
      active_suppliers: activeSuppliers,
      draft_orders: statusStats.draft || 0,
      sent_orders: statusStats.sent || 0,
      received_orders: statusStats.received || 0,
      completed_orders: statusStats.completed || 0,
      cancelled_orders: statusStats.cancelled || 0,
      recent_orders: recentOrdersResult,
      monthly_stats: monthlyStats,
      status_breakdown: statusStats,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching purchase stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch purchase statistics",
      },
      { status: 500 }
    );
  }
}
