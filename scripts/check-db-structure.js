const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function checkExistingTables() {
  try {
    console.log("🔍 Checking existing database structure...");

    // Check all tables
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log("📋 Existing tables:");
    tables.forEach((table) => {
      console.log(`  - ${table.tablename}`);
    });

    // Check suppliers table structure if exists
    const suppliersExists = tables.find((t) => t.tablename === "suppliers");
    if (suppliersExists) {
      console.log("\n🏢 Suppliers table structure:");
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'suppliers' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;

      columns.forEach((col) => {
        console.log(
          `  - ${col.column_name}: ${col.data_type} ${
            col.is_nullable === "NO" ? "NOT NULL" : ""
          }`
        );
      });
    }

    // Check purchase_orders table structure if exists
    const poExists = tables.find((t) => t.tablename === "purchase_orders");
    if (poExists) {
      console.log("\n📦 Purchase Orders table structure:");
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'purchase_orders' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;

      columns.forEach((col) => {
        console.log(
          `  - ${col.column_name}: ${col.data_type} ${
            col.is_nullable === "NO" ? "NOT NULL" : ""
          }`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
  }
}

checkExistingTables();
