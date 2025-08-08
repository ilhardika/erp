import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create purchase_orders table
    await sql`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        po_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id INTEGER REFERENCES suppliers(id),
        order_date DATE DEFAULT CURRENT_DATE,
        expected_date DATE,
        status VARCHAR(20) DEFAULT 'draft',
        subtotal DECIMAL(15,2) DEFAULT 0,
        discount_amount DECIMAL(15,2) DEFAULT 0,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        tax_percentage DECIMAL(5,2) DEFAULT 10,
        total_amount DECIMAL(15,2) DEFAULT 0,
        shipping_cost DECIMAL(15,2) DEFAULT 0,
        notes TEXT,
        terms_conditions TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create purchase_order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_cost DECIMAL(15,2) NOT NULL,
        discount_amount DECIMAL(15,2) DEFAULT 0,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        total_cost DECIMAL(15,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create goods_receipts table
    await sql`
      CREATE TABLE IF NOT EXISTS goods_receipts (
        id SERIAL PRIMARY KEY,
        receipt_number VARCHAR(50) UNIQUE NOT NULL,
        po_id INTEGER REFERENCES purchase_orders(id),
        supplier_id INTEGER REFERENCES suppliers(id),
        received_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        received_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create goods_receipt_items table
    await sql`
      CREATE TABLE IF NOT EXISTS goods_receipt_items (
        id SERIAL PRIMARY KEY,
        receipt_id INTEGER REFERENCES goods_receipts(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        po_item_id INTEGER REFERENCES purchase_order_items(id),
        ordered_qty INTEGER NOT NULL,
        received_qty INTEGER NOT NULL,
        unit_cost DECIMAL(15,2) NOT NULL,
        total_cost DECIMAL(15,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier 
      ON purchase_orders(supplier_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_status 
      ON purchase_orders(status)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_date 
      ON purchase_orders(order_date)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po 
      ON purchase_order_items(po_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product 
      ON purchase_order_items(product_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goods_receipts_po 
      ON goods_receipts(po_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goods_receipts_supplier 
      ON goods_receipts(supplier_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt 
      ON goods_receipt_items(receipt_id)
    `;

    return NextResponse.json({
      success: true,
      message: "Purchase orders database setup completed successfully",
      tables_created: [
        "purchase_orders",
        "purchase_order_items",
        "goods_receipts",
        "goods_receipt_items",
      ],
      indexes_created: 8,
      note: "Database schema ready for purchasing module",
    });
  } catch (error) {
    console.error("Error setting up purchase orders database:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup purchase orders database",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
