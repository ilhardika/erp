import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const supplier_type = searchParams.get("supplier_type") || "";

    const offset = (page - 1) * limit;

    // Build query with optional filters
    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (supplier_type) {
      whereClause += ` AND supplier_type = $${paramIndex}`;
      queryParams.push(supplier_type);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM suppliers ${whereClause}`;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult[0].total);

    // Get suppliers with pagination
    const suppliersQuery = `
      SELECT id, code, name, email, phone, address, city, postal_code, 
             tax_id, supplier_type, payment_terms, credit_limit, bank_account, 
             bank_name, status, created_at, updated_at
      FROM suppliers 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const suppliers = await sql.query(suppliersQuery, [
      ...queryParams,
      limit,
      offset,
    ]);

    return NextResponse.json({
      success: true,
      data: suppliers,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      email,
      phone,
      address,
      city,
      postal_code,
      tax_id,
      supplier_type = "material",
      payment_terms = 0,
      credit_limit = 0,
      bank_account,
      bank_name,
      account_holder,
      notes = "",
      status = "active",
    } = body;

    // Validation
    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Code and name are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingSupplier = await sql.query(
      `SELECT id FROM suppliers WHERE code = $1`,
      [code]
    );

    if (existingSupplier.length > 0) {
      return NextResponse.json(
        { success: false, error: "Supplier code already exists" },
        { status: 400 }
      );
    }

    const result = await sql.query(
      `
      INSERT INTO suppliers (
        code, name, email, phone, address, city, postal_code, tax_id,
        supplier_type, payment_terms, credit_limit, bank_account, bank_name,
        account_holder, notes, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
      ) RETURNING *
    `,
      [
        code,
        name,
        email,
        phone,
        address,
        city,
        postal_code,
        tax_id,
        supplier_type,
        payment_terms,
        credit_limit,
        bank_account,
        bank_name,
        account_holder,
        notes,
        status,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
