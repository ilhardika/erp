import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// Get purchase orders with pagination, filtering, and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 20;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const supplier_id = searchParams.get("supplier_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    const offset = (page - 1) * pageSize;

    // Build dynamic WHERE clause
    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (po.po_number ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex} OR po.notes ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND po.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (supplier_id) {
      whereClause += ` AND po.supplier_id = $${paramIndex}`;
      queryParams.push(supplier_id);
      paramIndex++;
    }

    if (date_from) {
      whereClause += ` AND po.order_date >= $${paramIndex}`;
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereClause += ` AND po.order_date <= $${paramIndex}`;
      queryParams.push(date_to);
      paramIndex++;
    }

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
        COALESCE(po.subtotal, 0) as subtotal,
        COALESCE(po.discount_amount, 0) as discount_amount,
        COALESCE(po.tax_amount, 0) as tax_amount,
        COALESCE(po.total_amount, 0) as total_amount,
        COALESCE(po.shipping_cost, 0) as shipping_cost,
        po.notes,
        po.terms_conditions,
        po.created_at,
        po.updated_at,
        s.name as supplier_name,
        s.code as supplier_code,
        s.email as supplier_email,
        s.phone as supplier_phone,
        u.full_name as created_by_name,
        COUNT(poi.id) as item_count,
        SUM(poi.quantity) as total_quantity
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.created_by = u.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
      ${whereClause}
      GROUP BY po.id, s.name, s.code, s.email, s.phone, u.full_name
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

// Create new purchase order
export async function POST(request) {
  try {
    const {
      supplier_id,
      order_date,
      expected_date,
      notes,
      terms_conditions,
      discount_percentage = 0,
      tax_percentage = 10,
      shipping_cost = 0,
      items,
      created_by,
    } = await request.json();

    // Validate required fields
    if (!supplier_id || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Supplier dan minimal 1 item harus diisi",
        },
        { status: 400 }
      );
    }

    // Generate PO number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const poNumber = `PO${today}${randomNum}`;

    // Calculate totals
    let subtotal = 0;
    const validatedItems = [];

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

    const discountAmount = (subtotal * discount_percentage) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * tax_percentage) / 100;
    const totalAmount = taxableAmount + taxAmount + shipping_cost;

    // Insert purchase order
    const newOrder = await sql`
      INSERT INTO purchase_orders (
        po_number, supplier_id, order_date, expected_date,
        status, subtotal, discount_amount, discount_percentage,
        tax_amount, tax_percentage, total_amount, shipping_cost,
        notes, terms_conditions, created_by
      ) VALUES (
        ${poNumber}, ${supplier_id}, ${order_date}, ${expected_date},
        'draft', ${subtotal}, ${discountAmount}, ${discount_percentage},
        ${taxAmount}, ${tax_percentage}, ${totalAmount}, ${shipping_cost},
        ${notes || ""}, ${terms_conditions || ""}, ${created_by}
      ) RETURNING *
    `;

    const poId = newOrder[0].id;

    // Insert order items
    for (const item of validatedItems) {
      await sql`
        INSERT INTO purchase_order_items (
          po_id, product_id, quantity, unit_cost, 
          discount_amount, discount_percentage, total_cost, notes
        ) VALUES (
          ${poId}, ${item.product_id}, ${item.quantity}, ${item.unit_cost},
          ${item.discount_amount}, ${item.discount_percentage}, ${
        item.total_cost
      }, ${item.notes || ""}
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Purchase order berhasil dibuat",
      data: newOrder[0],
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
