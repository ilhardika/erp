import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("Setting up customers table...");

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        postal_code VARCHAR(20),
        tax_id VARCHAR(50),
        customer_type VARCHAR(20) DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale', 'corporate')),
        credit_limit DECIMAL(15,2) DEFAULT 0,
        payment_terms INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status)`;

    // Insert sample data
    await sql`
      INSERT INTO customers (code, name, email, phone, address, city, customer_type, status) VALUES
      ('CUST001', 'PT Maju Jaya', 'admin@majujaya.com', '021-1234567', 'Jl. Sudirman No. 123', 'Jakarta', 'corporate', 'active'),
      ('CUST002', 'Toko Berkah', 'berkah@gmail.com', '0812-3456789', 'Jl. Raya No. 45', 'Bandung', 'wholesale', 'active'),
      ('CUST003', 'John Doe', 'john@email.com', '0856-7890123', 'Jl. Melati No. 78', 'Surabaya', 'retail', 'active'),
      ('CUST004', 'CV Sukses Mandiri', 'sukses@mandiri.co.id', '022-9876543', 'Jl. Gatot Subroto No. 99', 'Medan', 'wholesale', 'active'),
      ('CUST005', 'Maria Santos', 'maria@email.com', '0877-5544332', 'Jl. Kemerdekaan No. 12', 'Yogyakarta', 'retail', 'active')
      ON CONFLICT (code) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      message: "Customers table setup completed!",
    });
  } catch (error) {
    console.error("Error setting up customers table:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
