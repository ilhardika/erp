import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Get transaction history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const date = searchParams.get("date");
    const cashier_id = searchParams.get("cashier_id");

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let values = [];

    if (date) {
      whereConditions.push(`DATE(pt.created_at) = $${values.length + 1}`);
      values.push(date);
    }

    if (cashier_id) {
      whereConditions.push(`pt.cashier_id = $${values.length + 1}`);
      values.push(cashier_id);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const transactions = await sql`
      SELECT 
        pt.id,
        pt.transaction_number,
        pt.subtotal,
        pt.discount_amount,
        pt.tax_amount,
        pt.total_amount,
        pt.payment_method,
        pt.status,
        pt.created_at,
        u.full_name as cashier_name,
        c.name as customer_name,
        COUNT(ptd.id) as item_count
      FROM pos_transactions pt
      LEFT JOIN users u ON pt.cashier_id = u.id
      LEFT JOIN customers c ON pt.customer_id = c.id
      LEFT JOIN pos_transaction_details ptd ON pt.id = ptd.transaction_id
      ${whereClause}
      GROUP BY pt.id, u.full_name, c.name
      ORDER BY pt.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalCount = await sql`
      SELECT COUNT(*) as count
      FROM pos_transactions pt
      ${whereClause}
    `;

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount[0].count),
        totalPages: Math.ceil(totalCount[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching POS transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Create new transaction
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    let cashier_id = 1; // Default fallback user ID

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        cashier_id = decoded.userId;
      } catch (jwtError) {
        console.log(
          "JWT verification failed, using fallback user ID:",
          jwtError.message
        );
        // Use fallback user ID, don't return error
      }
    }

    const body = await request.json();
    const {
      items,
      customer_id,
      discount_amount = 0,
      tax_amount = 0,
      payment_method,
      payment_received,
      notes,
    } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items in transaction" },
        { status: 400 }
      );
    }

    // Calculate totals
    let total_amount = 0;
    for (const item of items) {
      total_amount += parseFloat(item.price) * parseInt(item.quantity);
    }

    const final_amount = total_amount - discount_amount + tax_amount;

    // Generate transaction number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const transaction_number = `POS${today}${randomNum}`;

    // Get active cashier shift
    const activeShift = await sql`
      SELECT id FROM cashier_shifts 
      WHERE cashier_id = ${cashier_id} 
      AND status = 'open' 
      ORDER BY opened_at DESC 
      LIMIT 1
    `;

    const shift_id = activeShift.length > 0 ? activeShift[0].id : null;

    // Create transaction
    const transaction = await sql`
      INSERT INTO pos_transactions (
        transaction_number,
        cashier_id,
        customer_id,
        shift_id,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        payment_method,
        amount_paid,
        change_amount,
        status,
        notes,
        created_at
      ) VALUES (
        ${transaction_number},
        ${cashier_id},
        ${customer_id},
        ${shift_id},
        ${total_amount},
        ${discount_amount},
        ${tax_amount},
        ${final_amount},
        ${payment_method},
        ${payment_received},
        ${payment_received - final_amount},
        'completed',
        ${notes},
        NOW()
      ) RETURNING id, transaction_number
    `;

    const transaction_id = transaction[0].id;

    // Insert transaction details
    for (const item of items) {
      await sql`
        INSERT INTO pos_transaction_items (
          transaction_id,
          product_id,
          quantity,
          unit_price,
          total_price,
          created_at
        ) VALUES (
          ${transaction_id},
          ${item.product_id},
          ${item.quantity},
          ${item.price},
          ${parseFloat(item.price) * parseInt(item.quantity)},
          NOW()
        )
      `;

      // Update product stock
      await sql`
        UPDATE products 
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.product_id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Transaction created successfully",
      data: {
        id: transaction_id,
        transaction_number: transaction[0].transaction_number,
        total_amount: final_amount,
        payment_change: payment_received - final_amount,
      },
    });
  } catch (error) {
    console.error("Error creating POS transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create transaction",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
