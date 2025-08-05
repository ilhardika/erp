import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("Please add your Neon DATABASE_URL to .env.local");
}

const sql = neon(process.env.DATABASE_URL);

async function setupSuppliersTable() {
  try {
    console.log("Setting up suppliers table...");

    // Create suppliers table
    await sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        postal_code VARCHAR(10),
        tax_id VARCHAR(50),
        supplier_type VARCHAR(50) DEFAULT 'material',
        payment_terms INTEGER DEFAULT 0,
        credit_limit DECIMAL(15,2) DEFAULT 0,
        bank_account VARCHAR(50),
        bank_name VARCHAR(100),
        account_holder VARCHAR(255),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log("✓ Suppliers table created/verified");

    // Check if we already have suppliers
    const existingSuppliers = await sql`SELECT COUNT(*) FROM suppliers`;
    const count = parseInt(existingSuppliers[0].count);

    if (count > 0) {
      console.log(`✓ Found ${count} existing suppliers`);
      return;
    }

    console.log("Adding sample suppliers...");

    // Insert sample suppliers
    const suppliers = [
      {
        code: "SUP001",
        name: "PT Sumber Makmur",
        email: "info@sumbermakmur.com",
        phone: "081234567890",
        address: "Jl. Merdeka No. 123, Blok A",
        city: "Jakarta",
        postal_code: "10110",
        tax_id: "12.345.678.9-012.345",
        supplier_type: "material",
        payment_terms: 30,
        credit_limit: 10000000,
        bank_account: "1234567890",
        bank_name: "BCA",
        account_holder: "PT Sumber Makmur",
        notes: "Supplier bahan baku utama untuk produksi",
        status: "active",
      },
      {
        code: "SUP002",
        name: "CV Jaya Abadi",
        email: "contact@jayaabadi.co.id",
        phone: "082233445566",
        address: "Jl. Sudirman No. 99, Ruko Central",
        city: "Bandung",
        postal_code: "40123",
        tax_id: "98.765.432.1-234.567",
        supplier_type: "goods",
        payment_terms: 14,
        credit_limit: 5000000,
        bank_account: "9876543210",
        bank_name: "Mandiri",
        account_holder: "CV Jaya Abadi",
        notes: "Supplier barang jadi dan aksesoris",
        status: "active",
      },
      {
        code: "SUP003",
        name: "PT Mitra Karya",
        email: "admin@mitrakarya.com",
        phone: "081122334455",
        address: "Jl. Gatot Subroto No. 88",
        city: "Surabaya",
        postal_code: "60234",
        tax_id: "56.789.012.3-456.789",
        supplier_type: "service",
        payment_terms: 7,
        credit_limit: 2000000,
        bank_account: "1122334455",
        bank_name: "BNI",
        account_holder: "PT Mitra Karya",
        notes: "Supplier jasa outsourcing dan maintenance",
        status: "active",
      },
      {
        code: "SUP004",
        name: "UD Berkah Jaya",
        email: "sales@berkahjaya.net",
        phone: "087766554433",
        address: "Jl. Pahlawan No. 45",
        city: "Yogyakarta",
        postal_code: "55131",
        tax_id: "11.222.333.4-567.890",
        supplier_type: "equipment",
        payment_terms: 21,
        credit_limit: 7500000,
        bank_account: "5566778899",
        bank_name: "BRI",
        account_holder: "UD Berkah Jaya",
        notes: "Supplier peralatan dan mesin produksi",
        status: "active",
      },
      {
        code: "SUP005",
        name: "PT Global Supply",
        email: "procurement@globalsupply.com",
        phone: "021-12345678",
        address: "Kawasan Industri MM2100, Blok C-1",
        city: "Bekasi",
        postal_code: "17520",
        tax_id: "22.333.444.5-678.901",
        supplier_type: "material",
        payment_terms: 45,
        credit_limit: 15000000,
        bank_account: "2233445566",
        bank_name: "CIMB Niaga",
        account_holder: "PT Global Supply",
        notes: "Supplier material import dan ekspor",
        status: "inactive",
      },
    ];

    // Insert all suppliers
    for (const supplier of suppliers) {
      await sql`
        INSERT INTO suppliers (
          code, name, email, phone, address, city, postal_code, tax_id,
          supplier_type, payment_terms, credit_limit, bank_account, bank_name,
          account_holder, notes, status, created_at, updated_at
        ) VALUES (
          ${supplier.code}, ${supplier.name}, ${supplier.email}, ${supplier.phone},
          ${supplier.address}, ${supplier.city}, ${supplier.postal_code}, ${supplier.tax_id},
          ${supplier.supplier_type}, ${supplier.payment_terms}, ${supplier.credit_limit},
          ${supplier.bank_account}, ${supplier.bank_name}, ${supplier.account_holder},
          ${supplier.notes}, ${supplier.status}, NOW(), NOW()
        )
      `;
      console.log(`✓ Added supplier: ${supplier.name}`);
    }

    console.log("✅ Suppliers setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up suppliers:", error);
    throw error;
  }
}

// Run the setup
setupSuppliersTable()
  .then(() => {
    console.log("Setup finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
