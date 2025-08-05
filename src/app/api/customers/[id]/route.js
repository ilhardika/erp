import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - Get single customer by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const customer = await sql`
      SELECT * FROM customers WHERE id = ${id} LIMIT 1
    `;

    if (customer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer[0],
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data customer" },
      { status: 500 }
    );
  }
}

// PUT - Update customer
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const {
      code,
      name,
      email,
      phone,
      address,
      city,
      postal_code,
      tax_id,
      customer_type,
      credit_limit,
      payment_terms,
      status,
      notes,
    } = data;

    // Validate required fields
    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Kode dan nama customer harus diisi" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const existingCustomer = await sql`
      SELECT id FROM customers WHERE id = ${id} LIMIT 1
    `;

    if (existingCustomer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if code is unique (excluding current customer)
    const codeCheck = await sql`
      SELECT id FROM customers WHERE code = ${code} AND id != ${id} LIMIT 1
    `;

    if (codeCheck.length > 0) {
      return NextResponse.json(
        { success: false, error: "Kode customer sudah digunakan" },
        { status: 400 }
      );
    }

    // Update customer
    const updatedCustomer = await sql`
      UPDATE customers SET
        code = ${code},
        name = ${name},
        email = ${email},
        phone = ${phone},
        address = ${address},
        city = ${city},
        postal_code = ${postal_code},
        tax_id = ${tax_id},
        customer_type = ${customer_type},
        credit_limit = ${credit_limit},
        payment_terms = ${payment_terms},
        status = ${status},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: "Customer berhasil diperbarui",
      data: updatedCustomer[0],
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui customer" },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if customer exists
    const existingCustomer = await sql`
      SELECT id FROM customers WHERE id = ${id} LIMIT 1
    `;

    if (existingCustomer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer tidak ditemukan" },
        { status: 404 }
      );
    }

    // TODO: Check if customer has related records (orders, transactions)
    // For now, we'll just delete the customer

    await sql`
      DELETE FROM customers WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: "Customer berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus customer" },
      { status: 500 }
    );
  }
}
