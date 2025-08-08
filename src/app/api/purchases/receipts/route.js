import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET /api/purchases/receipts - List goods receipts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 20;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const date_from = searchParams.get("date_from") || "";
    const date_to = searchParams.get("date_to") || "";

    const offset = (page - 1) * pageSize;

    // Build dynamic WHERE clause
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(
        `(gr.receipt_number ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex} OR po.po_number ILIKE $${paramIndex})`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`gr.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (date_from) {
      whereConditions.push(`gr.receipt_date >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`gr.receipt_date <= $${paramIndex}`);
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
      FROM goods_receipts gr
      LEFT JOIN suppliers s ON gr.supplier_id = s.id
      LEFT JOIN purchase_orders po ON gr.po_id = po.id
      ${whereClause}
    `;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult[0].total);

    // Get goods receipts with pagination
    const receiptsQuery = `
      SELECT 
        gr.id,
        gr.receipt_number,
        gr.po_id,
        gr.supplier_id,
        gr.receipt_date,
        gr.status,
        gr.total_received_amount,
        gr.notes,
        gr.created_at,
        s.name as supplier_name,
        po.po_number,
        po.total_amount as po_total_amount,
        receiver.full_name as received_by_name,
        COUNT(gri.id) as item_count,
        SUM(gri.received_quantity) as total_received_quantity
      FROM goods_receipts gr
      LEFT JOIN suppliers s ON gr.supplier_id = s.id
      LEFT JOIN purchase_orders po ON gr.po_id = po.id
      LEFT JOIN users receiver ON gr.received_by = receiver.id
      LEFT JOIN goods_receipt_items gri ON gr.id = gri.receipt_id
      ${whereClause}
      GROUP BY gr.id, s.name, po.po_number, po.total_amount, receiver.full_name
      ORDER BY gr.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(pageSize, offset);
    const receipts = await sql.query(receiptsQuery, queryParams);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: receipts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching goods receipts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch goods receipts",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/purchases/receipts - Create new goods receipt
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      po_id,
      supplier_id,
      receipt_date,
      status = "pending",
      notes,
      items = [],
      received_by = 1, // Should come from auth session
    } = body;

    // Validate required fields
    if (!po_id || !supplier_id || !receipt_date) {
      return NextResponse.json(
        {
          success: false,
          error: "PO ID, supplier ID, and receipt date are required",
        },
        { status: 400 }
      );
    }

    // Check if PO exists and is approved
    const poResult = await sql.query(
      `
      SELECT * FROM purchase_orders WHERE id = $1 AND status = 'approved'
    `,
      [po_id]
    );

    if (poResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase order not found or not approved",
        },
        { status: 400 }
      );
    }

    // Generate receipt number
    const receiptNumberResult = await sql.query(`
      SELECT COALESCE(
        'GR-' || LPAD((
          COALESCE(
            MAX(CAST(SUBSTRING(receipt_number FROM 4) AS INTEGER)), 
            0
          ) + 1
        )::text, 6, '0'),
        'GR-000001'
      ) as next_receipt_number
      FROM goods_receipts 
      WHERE receipt_number ~ '^GR-[0-9]{6}$'
    `);

    const receipt_number = receiptNumberResult[0].next_receipt_number;

    // Calculate total received amount
    const total_received_amount = items.reduce(
      (sum, item) => sum + parseFloat(item.total_amount || 0),
      0
    );

    // Create goods receipt
    const receiptResult = await sql.query(
      `
      INSERT INTO goods_receipts (
        receipt_number, po_id, supplier_id, receipt_date, status,
        total_received_amount, notes, received_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) 
      RETURNING *
    `,
      [
        receipt_number,
        po_id,
        supplier_id,
        receipt_date,
        status,
        total_received_amount,
        notes,
        received_by,
      ]
    );

    const newReceipt = receiptResult[0];

    // Create goods receipt items if provided
    let receiptItems = [];
    if (items && items.length > 0) {
      for (const item of items) {
        const receiptItemResult = await sql.query(
          `
          INSERT INTO goods_receipt_items (
            receipt_id, po_item_id, product_id, ordered_quantity,
            received_quantity, unit_price, total_amount, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          RETURNING *
        `,
          [
            newReceipt.id,
            item.po_item_id,
            item.product_id,
            item.ordered_quantity,
            item.received_quantity,
            item.unit_price || 0,
            item.total_amount || 0,
            item.notes || "",
          ]
        );
        receiptItems.push(receiptItemResult[0]);

        // Update product stock if receipt is completed
        if (status === "completed") {
          await sql.query(
            `
            INSERT INTO stock_movements (
              product_id, warehouse_id, movement_type, quantity,
              reference_type, reference_id, notes, created_at
            ) VALUES (
              $1, 1, 'in', $2, 'goods_receipt', $3, $4, CURRENT_TIMESTAMP
            )
          `,
            [
              item.product_id,
              item.received_quantity,
              newReceipt.id,
              `Goods receipt: ${receipt_number}`,
            ]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        goods_receipt: newReceipt,
        items: receiptItems,
      },
      message: "Goods receipt created successfully",
    });
  } catch (error) {
    console.error("Error creating goods receipt:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create goods receipt",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
