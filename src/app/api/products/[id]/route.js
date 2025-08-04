import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - Get single product by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const products = await sql`
      SELECT * FROM products WHERE id = ${id} LIMIT 1
    `;

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: products[0],
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      code,
      description,
      category,
      price,
      cost,
      stock,
      minStock,
      unit,
      barcode,
      supplier,
      status,
      weight,
      dimensions,
    } = body;

    // Validate required fields
    if (!name || !code || !price || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Field wajib: nama, kode, harga, dan kategori",
        },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await sql`
      SELECT id FROM products WHERE id = ${id} LIMIT 1
    `;

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if code is already used by another product
    const codeCheck = await sql`
      SELECT id FROM products WHERE code = ${code} AND id != ${id} LIMIT 1
    `;

    if (codeCheck.length > 0) {
      return NextResponse.json(
        { success: false, error: "Kode produk sudah digunakan" },
        { status: 400 }
      );
    }

    // Update product
    const result = await sql`
      UPDATE products SET
        name = ${name},
        code = ${code},
        description = ${description || ""},
        category = ${category},
        price = ${price},
        cost = ${cost || 0},
        stock = ${stock || 0},
        min_stock = ${minStock || 0},
        unit = ${unit || "pcs"},
        barcode = ${barcode || ""},
        supplier = ${supplier || ""},
        status = ${status || "active"},
        weight = ${weight || 0},
        dimensions = ${JSON.stringify(dimensions || {})},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, code, category, price, stock, status, updated_at
    `;

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diupdate",
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate produk" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if product exists
    const existingProduct = await sql`
      SELECT id, name FROM products WHERE id = ${id} LIMIT 1
    `;

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete product
    await sql`DELETE FROM products WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: `Produk "${existingProduct[0].name}" berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
