import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - Get single supplier by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const suppliers = await sql`
      SELECT * FROM suppliers WHERE id = ${id} LIMIT 1
    `;

    if (suppliers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: suppliers[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

// PUT - Update supplier
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
      status,
    } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Nama dan kode supplier harus diisi" },
        { status: 400 }
      );
    }

    // Check if code already exists for other suppliers
    const existingSupplier = await sql`
      SELECT id FROM suppliers 
      WHERE code = ${code} AND id != ${id}
    `;

    if (existingSupplier.length > 0) {
      return NextResponse.json(
        { success: false, error: "Kode supplier sudah digunakan" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE suppliers 
      SET 
        code = ${code},
        name = ${name},
        email = ${email || null},
        phone = ${phone || null},
        address = ${address || null},
        city = ${city || null},
        postal_code = ${postal_code || null},
        tax_id = ${tax_id || null},
        supplier_type = ${supplier_type || "material"},
        payment_terms = ${payment_terms || null},
        credit_limit = ${credit_limit ? parseFloat(credit_limit) : null},
        bank_account = ${bank_account || null},
        bank_name = ${bank_name || null},
        account_holder = ${account_holder || null},
        status = ${status || "active"},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

// DELETE - Delete supplier
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if supplier has related products
    const relatedProducts = await sql`
      SELECT COUNT(*) as count FROM products WHERE supplier_id = ${id}
    `;

    if (relatedProducts[0].count > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tidak dapat menghapus supplier yang masih memiliki produk terkait",
        },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM suppliers WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: "Supplier berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
