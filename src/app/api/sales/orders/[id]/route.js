import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// Get single sales order with items
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get sales order with customer and salesperson info
    const salesOrder = await sql`
      SELECT 
        so.*,
        c.name as customer_name,
        c.code as customer_code,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        u.full_name as salesperson_name,
        u.email as salesperson_email
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN users u ON so.salesperson_id = u.id
      WHERE so.id = ${id}
      LIMIT 1
    `;

    if (salesOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sales order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get order items with product info
    const orderItems = await sql`
      SELECT 
        soi.*,
        p.name as product_name,
        p.code as product_code,
        p.category as product_category,
        p.unit as product_unit,
        p.price as product_current_price
      FROM sales_order_items soi
      LEFT JOIN products p ON soi.product_id = p.id
      WHERE soi.order_id = ${id}
      ORDER BY soi.id
    `;

    const result = {
      ...salesOrder[0],
      items: orderItems,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching sales order:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data sales order" },
      { status: 500 }
    );
  }
}

// Update sales order
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      customer_id,
      salesperson_id,
      order_date,
      delivery_date,
      status,
      discount_percentage,
      tax_percentage,
      shipping_cost,
      notes,
      terms_conditions,
      shipping_address,
      items = [],
    } = body;

    // Check if order exists
    const existingOrder = await sql`
      SELECT id, status FROM sales_orders WHERE id = ${id} LIMIT 1
    `;

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sales order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validate status changes (progressive status - only forward movement)
    const currentStatus = existingOrder[0].status;

    // Progressive status validation (only allow forward movement)
    const statusLevels = {
      draft: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: -1, // Special case - can be set from any status
    };

    if (status && status !== currentStatus) {
      const currentLevel = statusLevels[currentStatus] || 0;
      const newLevel = statusLevels[status];

      // Allow cancelled from any status, or forward progression only
      if (status !== "cancelled" && newLevel < currentLevel) {
        return NextResponse.json(
          {
            success: false,
            error: `Status hanya dapat dimajukan. Tidak dapat mengubah dari ${currentStatus} ke ${status}`,
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
        if (!item.product_id || !item.quantity || !item.unit_price) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Semua item harus memiliki product_id, quantity, dan unit_price",
            },
            { status: 400 }
          );
        }

        const itemDiscountAmount = item.discount_amount || 0;
        const itemTotal = item.quantity * item.unit_price - itemDiscountAmount;

        validatedItems.push({
          ...item,
          discount_amount: itemDiscountAmount,
          total_price: itemTotal,
        });

        subtotal += itemTotal;
      }
    } else {
      // If no items provided, calculate from existing items
      const existingItems = await sql`
        SELECT SUM(total_price) as total FROM sales_order_items WHERE order_id = ${id}
      `;
      subtotal = existingItems[0]?.total || 0;
    }

    const discountAmount = (subtotal * (discount_percentage || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * (tax_percentage || 10)) / 100;
    const totalAmount = taxableAmount + taxAmount + (shipping_cost || 0);

    // Update sales order
    const updatedOrder = await sql`
      UPDATE sales_orders SET
        customer_id = COALESCE(${customer_id}, customer_id),
        salesperson_id = COALESCE(${salesperson_id}, salesperson_id),
        order_date = COALESCE(${order_date}, order_date),
        delivery_date = COALESCE(${delivery_date}, delivery_date),
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
        shipping_address = COALESCE(${shipping_address}, shipping_address),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    // Update items if provided
    if (validatedItems.length > 0) {
      // Delete existing items
      await sql`DELETE FROM sales_order_items WHERE order_id = ${id}`;

      // Insert new items
      for (const item of validatedItems) {
        await sql`
          INSERT INTO sales_order_items (
            order_id, product_id, quantity, unit_price, 
            discount_amount, discount_percentage, total_price, notes
          ) VALUES (
            ${id}, ${item.product_id}, ${item.quantity}, ${item.unit_price},
            ${item.discount_amount}, ${item.discount_percentage || 0}, ${
          item.total_price
        }, ${item.notes || ""}
          )
        `;
      }
    }

    // Get updated order with relations
    const completeOrder = await sql`
      SELECT 
        so.*,
        c.name as customer_name,
        u.full_name as salesperson_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN users u ON so.salesperson_id = u.id
      WHERE so.id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: "Sales order berhasil diupdate",
      data: completeOrder[0],
    });
  } catch (error) {
    console.error("Error updating sales order:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate sales order" },
      { status: 500 }
    );
  }
}

// Delete sales order
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if order exists and get status
    const existingOrder = await sql`
      SELECT id, status, order_number FROM sales_orders WHERE id = ${id} LIMIT 1
    `;

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sales order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Business rule: only draft orders can be deleted
    if (existingOrder[0].status !== "draft") {
      return NextResponse.json(
        {
          success: false,
          error: "Hanya sales order dengan status draft yang dapat dihapus",
        },
        { status: 400 }
      );
    }

    // Delete order (items will be deleted automatically due to CASCADE)
    await sql`DELETE FROM sales_orders WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: `Sales order ${existingOrder[0].order_number} berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deleting sales order:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus sales order" },
      { status: 500 }
    );
  }
}
