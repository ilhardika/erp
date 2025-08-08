import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET /api/purchases/orders/[id] - Get single purchase order by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get purchase order with supplier details
    const purchaseOrderResult = await sql.query(
      `
      SELECT 
        po.*,
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone,
        s.address as supplier_address,
        s.code as supplier_code,
        creator.full_name as created_by_name,
        approver.full_name as approved_by_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users creator ON po.created_by = creator.id
      LEFT JOIN users approver ON po.approved_by = approver.id
      WHERE po.id = $1
    `,
      [id]
    );

    if (purchaseOrderResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase order not found",
        },
        { status: 404 }
      );
    }

    // Get purchase order items with product details
    const itemsResult = await sql.query(
      `
      SELECT 
        poi.*,
        p.name as product_name,
        p.code as product_code,
        p.unit as product_unit,
        p.category as product_category
      FROM purchase_order_items poi
      LEFT JOIN products p ON poi.product_id = p.id
      WHERE poi.po_id = $1
      ORDER BY poi.id
    `,
      [id]
    );

    const purchaseOrder = {
      ...purchaseOrderResult[0],
      items: itemsResult || [],
    };

    return NextResponse.json({
      success: true,
      data: purchaseOrder,
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

// PUT /api/purchases/orders/[id] - Update purchase order
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      supplier_id,
      order_date,
      expected_date,
      status,
      subtotal,
      discount_amount,
      tax_amount,
      total_amount,
      payment_status,
      notes,
      items = [],
    } = body;

    // Check if purchase order exists and is editable
    const existingPO = await sql.query(
      `
      SELECT * FROM purchase_orders WHERE id = $1
    `,
      [id]
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

    // Check if PO can be edited (only draft and pending_approval can be edited)
    if (!["draft", "pending_approval"].includes(existingPO[0].status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot edit purchase order in current status",
        },
        { status: 400 }
      );
    }

    // Update purchase order
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (supplier_id !== undefined) {
      updateFields.push(`supplier_id = $${paramIndex}`);
      updateValues.push(supplier_id);
      paramIndex++;
    }
    if (order_date !== undefined) {
      updateFields.push(`order_date = $${paramIndex}`);
      updateValues.push(order_date);
      paramIndex++;
    }
    if (expected_date !== undefined) {
      updateFields.push(`expected_date = $${paramIndex}`);
      updateValues.push(expected_date);
      paramIndex++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(status);
      paramIndex++;
    }
    if (subtotal !== undefined) {
      updateFields.push(`subtotal = $${paramIndex}`);
      updateValues.push(subtotal);
      paramIndex++;
    }
    if (discount_amount !== undefined) {
      updateFields.push(`discount_amount = $${paramIndex}`);
      updateValues.push(discount_amount);
      paramIndex++;
    }
    if (tax_amount !== undefined) {
      updateFields.push(`tax_amount = $${paramIndex}`);
      updateValues.push(tax_amount);
      paramIndex++;
    }
    if (total_amount !== undefined) {
      updateFields.push(`total_amount = $${paramIndex}`);
      updateValues.push(total_amount);
      paramIndex++;
    }
    if (payment_status !== undefined) {
      updateFields.push(`payment_status = $${paramIndex}`);
      updateValues.push(payment_status);
      paramIndex++;
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`);
      updateValues.push(notes);
      paramIndex++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE purchase_orders 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updatedPO = await sql.query(updateQuery, updateValues);

    // Update items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await sql.query(`DELETE FROM purchase_order_items WHERE po_id = $1`, [
        id,
      ]);

      // Insert new items
      for (const item of items) {
        await sql.query(
          `
          INSERT INTO purchase_order_items (
            po_id, product_id, quantity, unit_price, total_amount, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6
          )
        `,
          [
            id,
            item.product_id,
            item.quantity,
            item.unit_price || 0,
            item.total_amount || 0,
            item.notes || "",
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedPO[0],
      message: "Purchase order updated successfully",
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

// DELETE /api/purchases/orders/[id] - Delete purchase order
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if purchase order exists
    const existingPO = await sql.query(
      `
      SELECT * FROM purchase_orders WHERE id = $1
    `,
      [id]
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

    // Check if PO can be deleted (only draft can be deleted)
    if (existingPO[0].status !== "draft") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete purchase order in current status. Only draft orders can be deleted.",
        },
        { status: 400 }
      );
    }

    // Delete purchase order (items will be deleted by CASCADE)
    await sql.query(`DELETE FROM purchase_orders WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: "Purchase order deleted successfully",
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
