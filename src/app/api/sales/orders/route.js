import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// Get sales orders with pagination, filtering, and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 20;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const customer_id = searchParams.get("customer_id");
    const salesperson_id = searchParams.get("salesperson_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    const offset = (page - 1) * pageSize;

    // Build dynamic WHERE clause
    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (so.order_number ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex} OR so.notes ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND so.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (customer_id) {
      whereClause += ` AND so.customer_id = $${paramIndex}`;
      queryParams.push(customer_id);
      paramIndex++;
    }

    if (salesperson_id) {
      whereClause += ` AND so.salesperson_id = $${paramIndex}`;
      queryParams.push(salesperson_id);
      paramIndex++;
    }

    if (date_from) {
      whereClause += ` AND so.order_date >= $${paramIndex}`;
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereClause += ` AND so.order_date <= $${paramIndex}`;
      queryParams.push(date_to);
      paramIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN users u ON so.salesperson_id = u.id
      ${whereClause}
    `;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult[0].total);

    // Get sales orders with pagination
    const salesOrdersQuery = `
      SELECT 
        so.id,
        so.order_number,
        so.customer_id,
        so.salesperson_id,
        so.order_date,
        so.delivery_date,
        so.status,
        so.subtotal,
        so.discount_amount,
        so.discount_percentage,
        so.tax_amount,
        so.tax_percentage,
        so.total_amount,
        so.shipping_cost,
        so.notes,
        so.terms_conditions,
        so.shipping_address,
        so.created_at,
        so.updated_at,
        c.name as customer_name,
        c.code as customer_code,
        c.email as customer_email,
        c.phone as customer_phone,
        u.full_name as salesperson_name,
        COUNT(soi.id) as item_count,
        SUM(soi.quantity) as total_quantity
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN users u ON so.salesperson_id = u.id
      LEFT JOIN sales_order_items soi ON so.id = soi.order_id
      ${whereClause}
      GROUP BY so.id, c.name, c.code, c.email, c.phone, u.full_name
      ORDER BY so.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(pageSize, offset);
    const salesOrders = await sql.query(salesOrdersQuery, queryParams);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: salesOrders,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sales orders" },
      { status: 500 }
    );
  }
}

// Create new sales order
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      salesperson_id,
      order_date,
      delivery_date,
      status = "draft",
      discount_percentage = 0,
      tax_percentage = 10,
      shipping_cost = 0,
      notes,
      terms_conditions,
      shipping_address,
      items = [],
    } = body;

    // Validate required fields
    if (!customer_id || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer dan items harus diisi" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderCount = await sql`
      SELECT COUNT(*) + 1 as next_number FROM sales_orders 
      WHERE order_number LIKE 'SO-2025-%'
    `;
    const orderNumber = `SO-2025-${String(orderCount[0].next_number).padStart(
      4,
      "0"
    )}`;

    // Calculate totals
    let subtotal = 0;
    const validatedItems = [];

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

    const discountAmount = (subtotal * discount_percentage) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * tax_percentage) / 100;
    const totalAmount = taxableAmount + taxAmount + (shipping_cost || 0);

    // Insert sales order
    const newOrder = await sql`
      INSERT INTO sales_orders (
        order_number, customer_id, salesperson_id, order_date, delivery_date,
        status, subtotal, discount_amount, discount_percentage,
        tax_amount, tax_percentage, total_amount, shipping_cost,
        notes, terms_conditions, shipping_address
      ) VALUES (
        ${orderNumber}, ${customer_id}, ${salesperson_id}, ${order_date}, ${delivery_date},
        ${status}, ${subtotal}, ${discountAmount}, ${discount_percentage},
        ${taxAmount}, ${tax_percentage}, ${totalAmount}, ${shipping_cost},
        ${notes || ""}, ${terms_conditions || ""}, ${shipping_address || ""}
      ) RETURNING *
    `;

    const orderId = newOrder[0].id;

    // Insert order items
    for (const item of validatedItems) {
      await sql`
        INSERT INTO sales_order_items (
          order_id, product_id, quantity, unit_price, 
          discount_amount, discount_percentage, total_price, notes
        ) VALUES (
          ${orderId}, ${item.product_id}, ${item.quantity}, ${item.unit_price},
          ${item.discount_amount}, ${item.discount_percentage || 0}, ${
        item.total_price
      }, ${item.notes || ""}
        )
      `;
    }

    // Get complete order data with relations
    const completeOrder = await sql`
      SELECT 
        so.*,
        c.name as customer_name,
        u.full_name as salesperson_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN users u ON so.salesperson_id = u.id
      WHERE so.id = ${orderId}
    `;

    return NextResponse.json({
      success: true,
      message: "Sales order berhasil dibuat",
      data: completeOrder[0],
    });
  } catch (error) {
    console.error("Sales order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat sales order" },
      { status: 500 }
    );
  }
}
