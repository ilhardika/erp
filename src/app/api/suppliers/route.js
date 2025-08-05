import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const supplier_type = searchParams.get("supplier_type") || "";

    let suppliers;

    // Simple approach without complex WHERE building
    if (!search && !status && !supplier_type) {
      // No filters - get all
      suppliers = await sql`
        SELECT * FROM suppliers 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // With filters - build query manually using sql.query for parameterized queries
      let queryStr = "SELECT * FROM suppliers WHERE 1=1";
      const queryParams = [];

      if (search) {
        queryStr +=
          " AND (name ILIKE '%' || $" +
          (queryParams.length + 1) +
          " || '%' OR code ILIKE '%' || $" +
          (queryParams.length + 1) +
          " || '%' OR email ILIKE '%' || $" +
          (queryParams.length + 1) +
          " || '%')";
        queryParams.push(search);
      }

      if (status) {
        queryStr += " AND status = $" + (queryParams.length + 1);
        queryParams.push(status);
      }

      if (supplier_type) {
        queryStr += " AND supplier_type = $" + (queryParams.length + 1);
        queryParams.push(supplier_type);
      }

      queryStr +=
        " ORDER BY created_at DESC LIMIT $" +
        (queryParams.length + 1) +
        " OFFSET $" +
        (queryParams.length + 2);
      queryParams.push(limit, offset);

      // Use sql.query for parameterized queries
      suppliers = await sql.query(queryStr, queryParams);
    }

    return NextResponse.json({
      success: true,
      data: suppliers,
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
    const existingSupplier = await sql`
      SELECT id FROM suppliers WHERE code = ${code}
    `;

    if (existingSupplier.length > 0) {
      return NextResponse.json(
        { success: false, error: "Supplier code already exists" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO suppliers (
        code, name, email, phone, address, city, postal_code, tax_id,
        supplier_type, payment_terms, credit_limit, bank_account, bank_name,
        account_holder, notes, status, created_at, updated_at
      ) VALUES (
        ${code}, ${name}, ${email}, ${phone}, ${address}, ${city}, ${postal_code}, ${tax_id},
        ${supplier_type}, ${payment_terms}, ${credit_limit}, ${bank_account}, ${bank_name},
        ${account_holder}, ${notes}, ${status}, NOW(), NOW()
      ) RETURNING *
    `;

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
