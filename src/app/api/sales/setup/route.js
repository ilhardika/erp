import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create sales_orders table
    await sql`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        salesperson_id INTEGER REFERENCES users(id),
        order_date DATE DEFAULT CURRENT_DATE,
        delivery_date DATE,
        status VARCHAR(20) DEFAULT 'draft',
        subtotal DECIMAL(15,2) DEFAULT 0,
        discount_amount DECIMAL(15,2) DEFAULT 0,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        tax_percentage DECIMAL(5,2) DEFAULT 0,
        total_amount DECIMAL(15,2) DEFAULT 0,
        shipping_cost DECIMAL(15,2) DEFAULT 0,
        notes TEXT,
        terms_conditions TEXT,
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create sales_order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS sales_order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DECIMAL(15,2) NOT NULL,
        discount_amount DECIMAL(15,2) DEFAULT 0,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        total_price DECIMAL(15,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sales_orders_customer 
      ON sales_orders(customer_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_sales_orders_salesperson 
      ON sales_orders(salesperson_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_sales_orders_status 
      ON sales_orders(status)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_sales_orders_date 
      ON sales_orders(order_date)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_sales_order_items_order 
      ON sales_order_items(order_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_sales_order_items_product 
      ON sales_order_items(product_id)
    `;

    // Tables created successfully, skip sample data for now
    // Sample data can be added later via the API endpoints

    return NextResponse.json({
      success: true,
      message: "Sales orders database setup completed successfully",
      tables_created: ["sales_orders", "sales_order_items"],
      indexes_created: 6,
      note: "Database schema ready. Use the API endpoints to create sales orders.",
    });
  } catch (error) {
    console.error("Error setting up sales orders database:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup sales orders database",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
