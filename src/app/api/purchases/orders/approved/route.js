import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// POST /api/purchases/orders/approved - Approve/Reject purchase order
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      po_id,
      action, // 'approve' or 'reject'
      approved_by = 1, // Should come from auth session
      notes,
    } = body;

    // Validate required fields
    if (!po_id || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase order ID and action are required",
        },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Action must be 'approve' or 'reject'",
        },
        { status: 400 }
      );
    }

    // Check if purchase order exists and is in correct status
    const existingPO = await sql.query(
      `
      SELECT * FROM purchase_orders WHERE id = $1
    `,
      [po_id]
    );

    if (existingPO.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase order not found",
        },
        { status: 404 }
      );
    }

    // Only pending_approval orders can be approved/rejected
    if (existingPO[0].status !== "pending_approval") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Purchase order must be in 'pending_approval' status to approve/reject",
        },
        { status: 400 }
      );
    }

    // Update purchase order status
    const newStatus = action === "approve" ? "approved" : "rejected";
    const updateNotes = notes
      ? `${existingPO[0].notes || ""}\n\nApproval ${action}: ${notes}`
      : existingPO[0].notes;

    const updatedPO = await sql.query(
      `
      UPDATE purchase_orders 
      SET 
        status = $1,
        approved_by = $2,
        approved_at = CURRENT_TIMESTAMP,
        notes = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
      [newStatus, approved_by, updateNotes, po_id]
    );

    return NextResponse.json({
      success: true,
      data: updatedPO[0],
      message: `Purchase order ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error processing approval:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process approval",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET /api/purchases/orders/approved - Get purchase orders pending approval
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 20;
    const offset = (page - 1) * pageSize;

    // Get purchase orders pending approval
    const pendingOrders = await sql.query(
      `
      SELECT 
        po.id,
        po.po_number,
        po.supplier_id,
        po.order_date,
        po.expected_date,
        po.total_amount,
        po.notes,
        po.created_at,
        s.name as supplier_name,
        creator.full_name as created_by_name,
        COUNT(poi.id) as item_count
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users creator ON po.created_by = creator.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
      WHERE po.status = 'pending_approval'
      GROUP BY po.id, s.name, creator.full_name
      ORDER BY po.created_at ASC
      LIMIT $1 OFFSET $2
    `,
      [pageSize, offset]
    );

    // Get total count
    const countResult = await sql.query(`
      SELECT COUNT(*) as total 
      FROM purchase_orders 
      WHERE status = 'pending_approval'
    `);
    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: pendingOrders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pending approvals",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
