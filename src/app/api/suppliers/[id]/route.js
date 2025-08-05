import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const suppliers = await sql.query(`SELECT * FROM suppliers WHERE id = $1`, [
      id,
    ]);

    if (suppliers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: suppliers[0],
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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
      supplier_type,
      payment_terms,
      credit_limit,
      bank_account,
      bank_name,
      account_holder,
      notes,
      status,
    } = body;

    // Check if supplier exists
    const existingSupplier = await sql.query(
      `SELECT id FROM suppliers WHERE id = $1`,
      [id]
    );

    if (existingSupplier.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Check if code already exists (excluding current supplier)
    if (code) {
      const duplicateCode = await sql.query(
        `SELECT id FROM suppliers WHERE code = $1 AND id != $2`,
        [code, id]
      );

      if (duplicateCode.length > 0) {
        return NextResponse.json(
          { success: false, error: "Supplier code already exists" },
          { status: 400 }
        );
      }
    }

    const result = await sql.query(
      `
      UPDATE suppliers SET 
        code = $1, name = $2, email = $3, phone = $4, address = $5, 
        city = $6, postal_code = $7, tax_id = $8, supplier_type = $9,
        payment_terms = $10, credit_limit = $11, bank_account = $12,
        bank_name = $13, account_holder = $14, notes = $15, status = $16,
        updated_at = NOW()
      WHERE id = $17 
      RETURNING *
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
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if supplier exists
    const existingSupplier = await sql.query(
      `SELECT id FROM suppliers WHERE id = $1`,
      [id]
    );

    if (existingSupplier.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    await sql.query(`DELETE FROM suppliers WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
