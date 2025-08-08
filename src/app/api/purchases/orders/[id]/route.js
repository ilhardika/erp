import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// Get single purchase order with items
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get purchase order with supplier info
    const purchaseOrder = await sql`
      SELECT 
        po.*,
        s.name as supplier_name,
        s.code as supplier_code,
        s.email as supplier_email,
        s.phone as supplier_phone,
        s.address as supplier_address,
        u.full_name as created_by_name,
        u.email as created_by_email
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.created_by = u.id
      WHERE po.id = ${id}
      LIMIT 1
    `;

    if (purchaseOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Purchase order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get order items with product info
    const orderItems = await sql`
      SELECT 
        poi.*,
        p.name as product_name,
        p.code as product_code,
        p.category as product_category,
        p.unit as product_unit,
        p.price as product_current_price
      FROM purchase_order_items poi
      LEFT JOIN products p ON poi.product_id = p.id
      WHERE poi.po_id = ${id}
      ORDER BY poi.id
    `;

    const result = {
      ...purchaseOrder[0],
      items: orderItems,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch purchase order",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Update purchase order
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const {
      supplier_id,
      order_date,
      expected_date,
      status,
      notes,
      terms_conditions,
      discount_percentage,
      tax_percentage,
      shipping_cost,
      items,
    } = await request.json();

    // Check if purchase order exists
    const existingOrder = await sql`
      SELECT id, status FROM purchase_orders WHERE id = ${id}
    `;

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Purchase order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validate status changes (progressive status - only forward movement)
    const currentStatus = existingOrder[0].status;

    const statusLevels = {
      draft: 0,
      sent: 1,
      received: 2,
      completed: 3,
      cancelled: -1, // Special case - can be set from any status except completed
    };

    if (status && status !== currentStatus) {
      const currentLevel = statusLevels[currentStatus] || 0;
      const newLevel = statusLevels[status];

      // Allow cancelled from any status except completed, or forward progression only
      if (status !== "cancelled" && newLevel < currentLevel) {
        return NextResponse.json(
          {
            success: false,
            error: `Status hanya dapat dimajukan. Tidak dapat mengubah dari ${currentStatus} ke ${status}`,
          },
          { status: 400 }
        );
      }

      // Don't allow changes from completed status
      if (currentStatus === "completed" && status !== "completed") {
        return NextResponse.json(
          {
            success: false,
            error: `Purchase order sudah selesai dan tidak dapat diubah`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals if items are provided
    let subtotal = 0;
    let validatedItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        if (!item.product_id || !item.quantity || !item.unit_cost) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Semua item harus memiliki product_id, quantity, dan unit_cost",
            },
            { status: 400 }
          );
        }

        const itemDiscountAmount = item.discount_amount || 0;
        const itemTotal = item.quantity * item.unit_cost - itemDiscountAmount;

        validatedItems.push({
          ...item,
          discount_amount: itemDiscountAmount,
          total_cost: itemTotal,
        });

        subtotal += itemTotal;
      }
    } else {
      // If no items provided, calculate from existing items
      const existingItems = await sql`
        SELECT SUM(total_cost) as total FROM purchase_order_items WHERE po_id = ${id}
      `;
      subtotal = existingItems[0]?.total || 0;
    }

    const discountAmount = (subtotal * (discount_percentage || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * (tax_percentage || 10)) / 100;
    const totalAmount = taxableAmount + taxAmount + (shipping_cost || 0);

    // Update purchase order
    const updatedOrder = await sql`
      UPDATE purchase_orders SET
        supplier_id = COALESCE(${supplier_id}, supplier_id),
        order_date = COALESCE(${order_date}, order_date),
        expected_date = COALESCE(${expected_date}, expected_date),
        status = COALESCE(${status}, status),
        subtotal = ${subtotal},
        discount_amount = ${discountAmount},
        discount_percentage = COALESCE(${discount_percentage}, discount_percentage),
        tax_amount = ${taxAmount},
        tax_percentage = COALESCE(${tax_percentage}, tax_percentage),
        total_amount = ${totalAmount},
        shipping_cost = COALESCE(${shipping_cost}, shipping_cost),
        notes = COALESCE(${notes}, notes),
        terms_conditions = COALESCE(${terms_conditions}, terms_conditions),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    // Update items if provided
    if (validatedItems.length > 0) {
      // Delete existing items
      await sql`DELETE FROM purchase_order_items WHERE po_id = ${id}`;

      // Insert new items
      for (const item of validatedItems) {
        await sql`
          INSERT INTO purchase_order_items (
            po_id, product_id, quantity, unit_cost, 
            discount_amount, discount_percentage, total_cost, notes
          ) VALUES (
            ${id}, ${item.product_id}, ${item.quantity}, ${item.unit_cost},
            ${item.discount_amount}, ${item.discount_percentage}, ${
          item.total_cost
        }, ${item.notes || ""}
          )
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Purchase order berhasil diupdate",
      data: updatedOrder[0],
    });
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update purchase order",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Delete purchase order
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if purchase order exists
    const existingOrder = await sql`
      SELECT id, status FROM purchase_orders WHERE id = ${id}
    `;

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Purchase order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if order can be deleted (only draft and cancelled orders)
    const status = existingOrder[0].status;
    if (status !== "draft" && status !== "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Hanya purchase order dengan status 'draft' atau 'cancelled' yang dapat dihapus",
        },
        { status: 400 }
      );
    }

    // Delete purchase order (items will be deleted automatically due to CASCADE)
    await sql`DELETE FROM purchase_orders WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: "Purchase order berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete purchase order",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
