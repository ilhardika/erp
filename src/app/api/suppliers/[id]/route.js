import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const suppliers = await sql`SELECT * FROM suppliers WHERE id = ${id}`;

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
    const existingSupplier = await sql`
      SELECT id FROM suppliers WHERE id = ${id}
    `;

    if (existingSupplier.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Check if code already exists (excluding current supplier)
    if (code) {
      const duplicateCode = await sql`
        SELECT id FROM suppliers WHERE code = ${code} AND id != ${id}
      `;

      if (duplicateCode.length > 0) {
        return NextResponse.json(
          { success: false, error: "Supplier code already exists" },
          { status: 400 }
        );
      }
    }

    const result = await sql`
      UPDATE suppliers SET 
        code = ${code}, name = ${name}, email = ${email}, phone = ${phone}, address = ${address}, 
        city = ${city}, postal_code = ${postal_code}, tax_id = ${tax_id}, supplier_type = ${supplier_type},
        payment_terms = ${payment_terms}, credit_limit = ${credit_limit}, bank_account = ${bank_account},
        bank_name = ${bank_name}, account_holder = ${account_holder}, notes = ${notes}, status = ${status},
        updated_at = NOW()
      WHERE id = ${id} 
      RETURNING *
    `;

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
    const existingSupplier = await sql`
      SELECT id FROM suppliers WHERE id = ${id}
    `;

    if (existingSupplier.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    await sql`DELETE FROM suppliers WHERE id = ${id}`;

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
