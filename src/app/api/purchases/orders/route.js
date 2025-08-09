import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET /api/purchases/orders - List purchase orders with pagination and filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 20;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const supplier_id = searchParams.get("supplier_id") || "";
    const date_from = searchParams.get("date_from") || "";
    const date_to = searchParams.get("date_to") || "";

    const offset = (page - 1) * pageSize;

    // Build dynamic WHERE clause
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(
        `(po.po_number ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex})`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`po.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (supplier_id) {
      whereConditions.push(`po.supplier_id = $${paramIndex}`);
      queryParams.push(supplier_id);
      paramIndex++;
    }

    if (date_from) {
      whereConditions.push(`po.order_date >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`po.order_date <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ${whereClause}
    `;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult[0].total);

    // Get purchase orders with pagination
    const purchaseOrdersQuery = `
      SELECT 
        po.id,
        po.po_number,
        po.supplier_id,
        po.order_date,
        po.expected_date,
        po.status,
        po.subtotal,
        po.tax_amount,
        po.discount_amount,
        po.total_amount,
        po.payment_status,
        po.notes,
        po.created_at,
        po.updated_at,
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone,
        creator.full_name as created_by_name,
        approver.full_name as approved_by_name,
        po.approved_at,
        COUNT(poi.id) as item_count,
        SUM(poi.quantity) as total_quantity
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users creator ON po.created_by = creator.id
      LEFT JOIN users approver ON po.approved_by = approver.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
      ${whereClause}
      GROUP BY po.id, s.name, s.email, s.phone, creator.full_name, approver.full_name
      ORDER BY po.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(pageSize, offset);
    const purchaseOrders = await sql.query(purchaseOrdersQuery, queryParams);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: purchaseOrders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch purchase orders",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/purchases/orders - Create new purchase order
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      supplier_id,
      order_date,
      expected_date,
      status = "draft",
      subtotal = 0,
      discount_amount = 0,
      tax_amount = 0,
      total_amount = 0,
      payment_status = "pending",
      notes,
      items = [],
      created_by = 1, // Should come from auth session
    } = body;

    // Validate required fields
    if (!supplier_id || !order_date) {
      return NextResponse.json(
        {
          success: false,
          error: "Supplier and order date are required",
        },
        { status: 400 }
      );
    }

    // Generate PO number
    const poNumberResult = await sql.query(`
      SELECT COALESCE(
        'PO-' || LPAD((
          COALESCE(
            MAX(CAST(SUBSTRING(po_number FROM 4) AS INTEGER)), 
            0
          ) + 1
        )::text, 6, '0'),
        'PO-000001'
      ) as next_po_number
      FROM purchase_orders 
      WHERE po_number ~ '^PO-[0-9]{6}$'
    `);

    const po_number = poNumberResult[0].next_po_number;

    // Create purchase order
    const purchaseOrderResult = await sql.query(
      `
      INSERT INTO purchase_orders (
        po_number, supplier_id, order_date, expected_date, status,
        subtotal, discount_amount, tax_amount, total_amount,
        payment_status, notes, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) 
      RETURNING *
    `,
      [
        po_number,
        supplier_id,
        order_date,
        expected_date || null, // Handle empty string
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        payment_status,
        notes,
        created_by,
      ]
    );

    const newPO = purchaseOrderResult[0];

    // Create purchase order items if provided
    let orderItems = [];
    if (items && items.length > 0) {
      for (const item of items) {
        const orderItemResult = await sql.query(
          `
          INSERT INTO purchase_order_items (
            po_id, product_id, quantity, unit_cost, discount_amount, discount_percentage, total_cost, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          RETURNING *
        `,
          [
            newPO.id,
            item.product_id,
            item.quantity,
            item.unit_cost || 0,
            item.discount_amount || 0,
            item.discount_percentage || 0,
            item.total_cost || 0,
            item.notes || "",
          ]
        );
        orderItems.push(orderItemResult[0]);
      }

      // Recalculate totals based on items
      const itemsTotal = orderItems.reduce(
        (sum, item) => sum + parseFloat(item.total_cost || 0),
        0
      );
      const finalTotal =
        itemsTotal -
        parseFloat(discount_amount || 0) +
        parseFloat(tax_amount || 0);

      await sql.query(
        `
        UPDATE purchase_orders 
        SET 
          subtotal = $1,
          total_amount = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `,
        [itemsTotal, finalTotal, newPO.id]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        purchase_order: newPO,
        items: orderItems,
      },
      message: "Purchase order created successfully",
    });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create purchase order",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
