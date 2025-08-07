import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // First, check if products table exists and create if not
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(12,2) DEFAULT 0,
        cost DECIMAL(12,2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'pcs',
        barcode VARCHAR(255),
        supplier VARCHAR(255),
        supplier_id INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        weight DECIMAL(10,3),
        dimensions VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Check if products already exist
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`;

    if (existingProducts[0].count > 0) {
      return NextResponse.json({
        success: true,
        message: "Data produk sudah ada",
        count: existingProducts[0].count,
      });
    }

    // Insert sample products
    const sampleProducts = [
      {
        name: "Laptop Asus VivoBook 14",
        code: "PRD001",
        description: "Laptop 14 inch dengan processor Intel Core i5",
        category: "Elektronik",
        price: 7500000,
        cost: 6500000,
        stock: 15,
        min_stock: 5,
        unit: "pcs",
        barcode: "8901234567890",
        supplier: "PT Tech Indo",
        status: "active",
        weight: 1.4,
        dimensions: "32.4 x 21.3 x 1.9 cm",
      },
      {
        name: "Mouse Logitech M100",
        code: "PRD002",
        description: "Mouse optical USB",
        category: "Elektronik",
        price: 85000,
        cost: 65000,
        stock: 50,
        min_stock: 10,
        unit: "pcs",
        barcode: "8901234567891",
        supplier: "PT Komputer Jaya",
        status: "active",
        weight: 0.09,
        dimensions: "11.3 x 5.7 x 3.8 cm",
      },
      {
        name: "Kemeja Batik Pria",
        code: "PRD003",
        description: "Kemeja batik lengan panjang motif parang",
        category: "Pakaian",
        price: 175000,
        cost: 125000,
        stock: 25,
        min_stock: 5,
        unit: "pcs",
        barcode: "8901234567892",
        supplier: "CV Batik Nusantara",
        status: "active",
        weight: 0.3,
        dimensions: "30 x 40 x 2 cm",
      },
      {
        name: "Kopi Arabica 250gr",
        code: "PRD004",
        description: "Kopi arabica premium single origin",
        category: "Makanan & Minuman",
        price: 95000,
        cost: 70000,
        stock: 100,
        min_stock: 20,
        unit: "pack",
        barcode: "8901234567893",
        supplier: "CV Kopi Indonesia",
        status: "active",
        weight: 0.25,
        dimensions: "15 x 10 x 5 cm",
      },
      {
        name: "Buku Pemrograman JavaScript",
        code: "PRD005",
        description: "Panduan lengkap belajar JavaScript modern",
        category: "Buku",
        price: 125000,
        cost: 90000,
        stock: 30,
        min_stock: 5,
        unit: "pcs",
        barcode: "8901234567894",
        supplier: "Penerbit Tekno",
        status: "active",
        weight: 0.4,
        dimensions: "23 x 15 x 2 cm",
      },
      {
        name: "Pot Tanaman Keramik",
        code: "PRD006",
        description: "Pot tanaman keramik ukuran sedang",
        category: "Rumah & Taman",
        price: 45000,
        cost: 30000,
        stock: 40,
        min_stock: 10,
        unit: "pcs",
        barcode: "8901234567895",
        supplier: "CV Keramik Indah",
        status: "active",
        weight: 0.8,
        dimensions: "20 x 20 x 18 cm",
      },
      {
        name: "Sepatu Lari Nike",
        code: "PRD007",
        description: "Sepatu lari ringan dan nyaman",
        category: "Olahraga",
        price: 850000,
        cost: 650000,
        stock: 20,
        min_stock: 5,
        unit: "pair",
        barcode: "8901234567896",
        supplier: "PT Sports Gear",
        status: "active",
        weight: 0.6,
        dimensions: "35 x 25 x 15 cm",
      },
      {
        name: "Mainan Robot Transform",
        code: "PRD008",
        description: "Robot transformer plastik untuk anak",
        category: "Mainan",
        price: 185000,
        cost: 135000,
        stock: 35,
        min_stock: 8,
        unit: "pcs",
        barcode: "8901234567897",
        supplier: "CV Mainan Anak",
        status: "active",
        weight: 0.5,
        dimensions: "25 x 15 x 10 cm",
      },
      {
        name: "Shampo Anti Ketombe",
        code: "PRD009",
        description: "Shampo anti ketombe 200ml",
        category: "Kesehatan & Kecantikan",
        price: 35000,
        cost: 25000,
        stock: 80,
        min_stock: 15,
        unit: "btl",
        barcode: "8901234567898",
        supplier: "PT Beauty Care",
        status: "active",
        weight: 0.2,
        dimensions: "15 x 5 x 5 cm",
      },
      {
        name: "Oli Mesin Mobil 1L",
        code: "PRD010",
        description: "Oli mesin synthetic 10W-40",
        category: "Otomotif",
        price: 95000,
        cost: 75000,
        stock: 60,
        min_stock: 12,
        unit: "btl",
        barcode: "8901234567899",
        supplier: "PT Lubricant Indo",
        status: "active",
        weight: 1.0,
        dimensions: "25 x 10 x 10 cm",
      },
    ];

    // Insert each product
    for (const product of sampleProducts) {
      await sql`
        INSERT INTO products (
          name, code, description, category, price, cost, stock, min_stock,
          unit, barcode, supplier, status, weight, dimensions
        ) VALUES (
          ${product.name}, ${product.code}, ${product.description}, ${product.category},
          ${product.price}, ${product.cost}, ${product.stock}, ${product.min_stock},
          ${product.unit}, ${product.barcode}, ${product.supplier}, ${product.status},
          ${product.weight}, ${product.dimensions}
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Data produk sample berhasil dibuat",
      count: sampleProducts.length,
    });
  } catch (error) {
    console.error("Error setting up products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal membuat data produk",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
