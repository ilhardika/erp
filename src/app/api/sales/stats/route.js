import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// Get sales order statistics and dashboard data
export async function GET() {
  try {
    // Get order counts by status
    const statusCounts = await sql`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total_value
      FROM sales_orders 
      GROUP BY status
      ORDER BY status
    `;

    // Get recent orders (last 10)
    const recentOrders = await sql`
      SELECT 
        so.id,
        so.order_number,
        so.order_date,
        so.status,
        so.total_amount,
        c.name as customer_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      ORDER BY so.created_at DESC
      LIMIT 10
    `;

    // Get monthly sales trend (last 6 months)
    const monthlySales = await sql`
      SELECT 
        DATE_TRUNC('month', order_date) as month,
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue
      FROM sales_orders 
      WHERE order_date >= CURRENT_DATE - INTERVAL '6 months'
        AND status != 'cancelled'
      GROUP BY DATE_TRUNC('month', order_date)
      ORDER BY month DESC
    `;

    // Get top customers by order value
    const topCustomers = await sql`
      SELECT 
        c.id,
        c.name,
        c.code,
        COUNT(so.id) as order_count,
        SUM(so.total_amount) as total_value
      FROM customers c
      INNER JOIN sales_orders so ON c.id = so.customer_id
      WHERE so.status != 'cancelled'
      GROUP BY c.id, c.name, c.code
      ORDER BY total_value DESC
      LIMIT 10
    `;

    // Get top salesperson performance
    const topSalesperson = await sql`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        COUNT(so.id) as order_count,
        SUM(so.total_amount) as total_value
      FROM users u
      INNER JOIN sales_orders so ON u.id = so.salesperson_id
      WHERE so.status != 'cancelled'
      GROUP BY u.id, u.full_name, u.email
      ORDER BY total_value DESC
      LIMIT 10
    `;

    // Calculate overall metrics
    const totalStats = await sql`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as completed_revenue,
        SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as pending_revenue,
        AVG(total_amount) as average_order_value
      FROM sales_orders
    `;

    return NextResponse.json({
      success: true,
      data: {
        status_counts: statusCounts,
        recent_orders: recentOrders,
        monthly_sales: monthlySales,
        top_customers: topCustomers,
        top_salesperson: topSalesperson,
        total_stats: totalStats[0],
      },
    });
  } catch (error) {
    console.error("Error fetching sales statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sales statistics" },
      { status: 500 }
    );
  }
}
