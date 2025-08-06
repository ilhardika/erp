import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Get current shift status
export async function GET(request) {
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
        // Use fallback user ID, don't return error
      }
    }

    // Get current active shift
    const activeShift = await sql`
      SELECT 
        cs.*,
        u.full_name as cashier_name
      FROM cashier_shifts cs
      LEFT JOIN users u ON cs.cashier_id = u.id
      WHERE cs.cashier_id = ${cashier_id} 
      AND cs.status = 'open'
      ORDER BY cs.opened_at DESC
      LIMIT 1
    `;

    // Get shift transactions if there's an active shift
    let shiftTransactions = [
      {
        transaction_count: "0",
        total_sales: "0.00",
        total_cash: "0.00",
        total_non_cash: "0.00",
      },
    ];
    if (activeShift.length > 0) {
      const shift = activeShift[0];
      if (shift.closed_at) {
        // Closed shift - get transactions between open and close
        shiftTransactions = await sql`
          SELECT 
            COUNT(*) as transaction_count,
            COALESCE(SUM(total_amount), 0) as total_sales,
            COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) as total_cash,
            COALESCE(SUM(CASE WHEN payment_method != 'cash' THEN total_amount ELSE 0 END), 0) as total_non_cash
          FROM pos_transactions
          WHERE cashier_id = ${cashier_id}
          AND created_at >= ${shift.opened_at}
          AND created_at <= ${shift.closed_at}
        `;
      } else {
        // Open shift - get transactions since opening
        shiftTransactions = await sql`
          SELECT 
            COUNT(*) as transaction_count,
            COALESCE(SUM(total_amount), 0) as total_sales,
            COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) as total_cash,
            COALESCE(SUM(CASE WHEN payment_method != 'cash' THEN total_amount ELSE 0 END), 0) as total_non_cash
          FROM pos_transactions
          WHERE cashier_id = ${cashier_id}
          AND created_at >= ${shift.opened_at}
        `;
      }
    }

    // Get today's total transactions for reference
    const todayTransactions = await sql`
      SELECT 
        COUNT(*) as transaction_count,
        COALESCE(SUM(total_amount), 0) as total_sales
      FROM pos_transactions
      WHERE cashier_id = ${cashier_id}
      AND DATE(created_at) = CURRENT_DATE
    `;

    // Update active shift with current transaction totals if exists
    let updatedActiveShift = null;
    if (activeShift.length > 0) {
      updatedActiveShift = {
        ...activeShift[0],
        total_sales: shiftTransactions[0].total_sales,
        total_cash: shiftTransactions[0].total_cash,
        total_non_cash: shiftTransactions[0].total_non_cash,
        transaction_count: shiftTransactions[0].transaction_count,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        active_shift: updatedActiveShift,
        today_stats: todayTransactions[0],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shift status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Open or close shift
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
        // Use fallback user ID, don't return error
      }
    }

    const body = await request.json();
    const { action, opening_cash, closing_cash, notes } = body;

    if (action === "open") {
      // Check if there's already an open shift
      const existingShift = await sql`
        SELECT id FROM cashier_shifts 
        WHERE cashier_id = ${cashier_id} 
        AND status = 'open'
      `;

      if (existingShift.length > 0) {
        return NextResponse.json(
          { success: false, error: "Shift already open" },
          { status: 400 }
        );
      }

      // Generate shift number
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomNum = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");
      const shift_number = `SHIFT${today}${randomNum}`;

      // Create new shift
      const newShift = await sql`
        INSERT INTO cashier_shifts (
          shift_number,
          cashier_id,
          opened_at,
          opening_balance,
          status,
          notes
        ) VALUES (
          ${shift_number},
          ${cashier_id},
          NOW(),
          ${opening_cash || 0},
          'open',
          ${notes || ""}
        ) RETURNING id, shift_number
      `;

      return NextResponse.json({
        success: true,
        message: "Shift opened successfully",
        data: newShift[0],
      });
    } else if (action === "close") {
      // Get current open shift
      const currentShift = await sql`
        SELECT id FROM cashier_shifts 
        WHERE cashier_id = ${cashier_id} 
        AND status = 'open'
        ORDER BY opened_at DESC
        LIMIT 1
      `;

      if (currentShift.length === 0) {
        return NextResponse.json(
          { success: false, error: "No open shift found" },
          { status: 400 }
        );
      }

      const shift_id = currentShift[0].id;

      // Calculate shift summary
      const shiftSummary = await sql`
        SELECT 
          COUNT(*) as transaction_count,
          COALESCE(SUM(total_amount), 0) as total_sales,
          COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) as cash_sales,
          COALESCE(SUM(CASE WHEN payment_method = 'transfer' THEN total_amount ELSE 0 END), 0) as transfer_sales
        FROM pos_transactions
        WHERE shift_id = ${shift_id}
      `;

      // Close shift
      await sql`
        UPDATE cashier_shifts 
        SET 
          closed_at = NOW(),
          closing_balance = ${closing_cash || 0},
          total_sales = ${shiftSummary[0].total_sales},
          total_cash = ${shiftSummary[0].cash_sales},
          total_non_cash = ${shiftSummary[0].transfer_sales},
          status = 'closed',
          notes = COALESCE(notes, '') || ' | ' || ${notes || ""}
        WHERE id = ${shift_id}
      `;

      return NextResponse.json({
        success: true,
        message: "Shift closed successfully",
        data: {
          shift_id,
          summary: shiftSummary[0],
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to manage shift",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
