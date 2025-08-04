import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - Get all products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    // Build query with optional filters
    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult[0].total);

    // Get products with pagination
    const productsQuery = `
      SELECT id, name, code, description, category, price, cost, stock, min_stock, 
             unit, barcode, supplier, status, weight, dimensions, created_at, updated_at
      FROM products 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const products = await sql.query(productsQuery, [
      ...queryParams,
      limit,
      offset,
    ]); // Get unique categories for filter
    const categoriesResult = await sql`
      SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category
    `;
    const categories = categoriesResult.map((row) => row.category);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        categories,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request) {
  try {
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

    // Check if product code already exists
    const existingProduct = await sql`
      SELECT id FROM products WHERE code = ${code} LIMIT 1
    `;

    if (existingProduct.length > 0) {
      return NextResponse.json(
        { success: false, error: "Kode produk sudah digunakan" },
        { status: 400 }
      );
    }

    // Insert new product
    const result = await sql`
      INSERT INTO products (
        name, code, description, category, price, cost, stock, min_stock,
        unit, barcode, supplier, status, weight, dimensions
      ) VALUES (
        ${name}, ${code}, ${description || ""}, ${category}, ${price}, ${
      cost || 0
    },
        ${stock || 0}, ${minStock || 0}, ${unit || "pcs"}, ${barcode || ""},
        ${supplier || ""}, ${status || "active"}, ${
      weight || 0
    }, ${JSON.stringify(dimensions || {})}
      )
      RETURNING id, name, code, category, price, stock, status, created_at
    `;

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dibuat",
      data: result[0],
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat produk" },
      { status: 500 }
    );
  }
}
