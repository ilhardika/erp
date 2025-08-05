import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("Please add your Neon DATABASE_URL to .env.local");
}

const sql = neon(process.env.DATABASE_URL);

async function addMoreSuppliers() {
  try {
    console.log("Adding more sample suppliers...");

    // Check existing count
    const existingSuppliers = await sql`SELECT COUNT(*) FROM suppliers`;
    const count = parseInt(existingSuppliers[0].count);

    console.log(`Current suppliers count: ${count}`);

    if (count >= 10) {
      console.log("✓ Already have enough suppliers");
      return;
    }

    // Additional suppliers to add
    const additionalSuppliers = [
      {
        code: "SUP007",
        name: "PT Indofood Sukses Makmur",
        email: "procurement@indofood.com",
        phone: "021-29345555",
        address: "Jl. Sudirman Kav. 76-78",
        city: "Jakarta",
        postal_code: "12910",
        tax_id: "01.123.456.7-001.000",
        supplier_type: "material",
        payment_terms: 30,
        credit_limit: 25000000,
        bank_account: "3344556677",
        bank_name: "Bank Mandiri",
        account_holder: "PT Indofood Sukses Makmur",
        notes: "Supplier bahan makanan dan kemasan",
        status: "active",
      },
      {
        code: "SUP008",
        name: "CV Teknologi Maju",
        email: "sales@tekmaju.co.id",
        phone: "022-87654321",
        address: "Jl. Asia Afrika No. 8",
        city: "Bandung",
        postal_code: "40111",
        tax_id: "02.234.567.8-002.000",
        supplier_type: "equipment",
        payment_terms: 14,
        credit_limit: 8000000,
        bank_account: "4455667788",
        bank_name: "BCA",
        account_holder: "CV Teknologi Maju",
        notes: "Supplier peralatan teknologi dan komputer",
        status: "active",
      },
      {
        code: "SUP009",
        name: "PT Logistik Express",
        email: "operations@logexpress.com",
        phone: "031-7777888",
        address: "Jl. Raya Juanda No. 100",
        city: "Surabaya",
        postal_code: "60293",
        tax_id: "03.345.678.9-003.000",
        supplier_type: "service",
        payment_terms: 7,
        credit_limit: 3000000,
        bank_account: "5566778899",
        bank_name: "BNI",
        account_holder: "PT Logistik Express",
        notes: "Jasa pengiriman dan ekspedisi",
        status: "active",
      },
      {
        code: "SUP010",
        name: "UD Sumber Plastik",
        email: "info@sumberplastik.net",
        phone: "0274-123456",
        address: "Jl. Malioboro No. 25",
        city: "Yogyakarta",
        postal_code: "55213",
        tax_id: "04.456.789.0-004.000",
        supplier_type: "material",
        payment_terms: 21,
        credit_limit: 6000000,
        bank_account: "6677889900",
        bank_name: "BRI",
        account_holder: "UD Sumber Plastik",
        notes: "Supplier bahan plastik dan kemasan",
        status: "inactive",
      },
      {
        code: "SUP011",
        name: "PT Office Supplies",
        email: "order@officesupplies.com",
        phone: "021-5551234",
        address: "Komplek Ruko Mega Glodok",
        city: "Jakarta",
        postal_code: "11180",
        tax_id: "05.567.890.1-005.000",
        supplier_type: "goods",
        payment_terms: 14,
        credit_limit: 4000000,
        bank_account: "7788990011",
        bank_name: "CIMB Niaga",
        account_holder: "PT Office Supplies",
        notes: "Supplier alat tulis dan peralatan kantor",
        status: "active",
      },
    ];

    // Insert additional suppliers
    for (const supplier of additionalSuppliers) {
      try {
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
      } catch (error) {
        if (error.message.includes("duplicate")) {
          console.log(
            `⚠ Supplier ${supplier.code} already exists, skipping...`
          );
        } else {
          console.error(`❌ Error adding ${supplier.name}:`, error.message);
        }
      }
    }

    console.log("✅ Additional suppliers added successfully!");
  } catch (error) {
    console.error("❌ Error adding suppliers:", error);
    throw error;
  }
}

// Run the script
addMoreSuppliers()
  .then(() => {
    console.log("Script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
