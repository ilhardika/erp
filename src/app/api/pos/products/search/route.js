import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const barcode = searchParams.get("barcode");

    let products;

    if (barcode) {
      // Search by exact barcode match
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.code,
          p.barcode,
          p.price,
          p.stock,
          p.unit,
          p.category,
          s.name as supplier_name
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.barcode = ${barcode} 
        AND p.status = 'active'
        AND p.stock > 0
        LIMIT 1
      `;
    } else if (query) {
      // Search by name or code
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.code,
          p.barcode,
          p.price,
          p.stock,
          p.unit,
          p.category,
          s.name as supplier_name
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE (
          LOWER(p.name) LIKE LOWER(${"%" + query + "%"}) OR
          LOWER(p.code) LIKE LOWER(${"%" + query + "%"}) OR
          p.barcode = ${query}
        )
        AND p.status = 'active'
        AND p.stock > 0
        ORDER BY p.name
        LIMIT 20
      `;
    } else {
      // Return all active products if no search
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.code,
          p.barcode,
          p.price,
          p.stock,
          p.unit,
          p.category,
          s.name as supplier_name
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.status = 'active'
        ORDER BY p.category, p.name
      `;
    }

    return NextResponse.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search products",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

