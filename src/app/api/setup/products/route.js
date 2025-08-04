import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        category VARCHAR(100) NOT NULL,
        price DECIMAL(15,2) NOT NULL DEFAULT 0,
        cost DECIMAL(15,2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'pcs',
        barcode VARCHAR(255) DEFAULT '',
        supplier VARCHAR(255) DEFAULT '',
        status VARCHAR(50) DEFAULT 'active',
        weight DECIMAL(10,2) DEFAULT 0,
        dimensions JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert sample products if table is empty
    const countResult = await sql`SELECT COUNT(*) as count FROM products`;
    const count = parseInt(countResult[0].count);

    if (count === 0) {
      await sql`
        INSERT INTO products (name, code, description, category, price, cost, stock, min_stock, unit) VALUES
        ('Beras Premium 5kg', 'BRS001', 'Beras premium kualitas terbaik 5kg', 'Makanan', 75000, 65000, 50, 10, 'kg'),
        ('Minyak Goreng 2L', 'MYK001', 'Minyak goreng kemasan 2 liter', 'Makanan', 45000, 40000, 30, 5, 'liter'),
        ('Gula Pasir 1kg', 'GUL001', 'Gula pasir putih kemasan 1kg', 'Makanan', 15000, 12000, 100, 20, 'kg'),
        ('Sabun Mandi', 'SBN001', 'Sabun mandi batang wangi', 'Perawatan', 5000, 4000, 200, 50, 'pcs'),
        ('Shampo 400ml', 'SHP001', 'Shampo rambut kemasan 400ml', 'Perawatan', 25000, 20000, 75, 15, 'btl')
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Tabel products berhasil dibuat dan data sample ditambahkan",
      count,
    });
  } catch (error) {
    console.error("Error setting up products table:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
