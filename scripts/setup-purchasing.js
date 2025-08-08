const { neon } = require("@neondatabase/serverless");
const { readFileSync } = require("fs");
const { join } = require("path");
require("dotenv").config({ path: ".env.local" });

// Create SQL connection
const sql = neon(process.env.DATABASE_URL);

async function setupPurchasingTables() {
  try {
    console.log("🏗️ Setting up purchasing module tables...");

    // Read and execute SQL file
    const sqlFile = join(__dirname, "setup-purchasing-tables.sql");
    const sqlContent = readFileSync(sqlFile, "utf8");

    // Split by statements and execute
    const statements = sqlContent.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
        await sql.query(statement.trim());
      }
    }

    console.log("✅ Purchasing tables setup completed!");

    // Verify tables were created
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('suppliers', 'purchase_orders', 'purchase_order_items', 'goods_receipts', 'goods_receipt_items')
      ORDER BY tablename
    `;

    console.log("📋 Created tables:");
    tables.forEach((table) => {
      console.log(`  - ${table.tablename}`);
    });

    // Check if dependent tables exist
    const dependentTables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'products')
      ORDER BY tablename
    `;

    console.log("🔗 Required dependent tables:");
    dependentTables.forEach((table) => {
      console.log(`  ✅ ${table.tablename}`);
    });

    if (dependentTables.length < 2) {
      console.log("⚠️  Warning: Missing dependent tables (users, products)");
      console.log("   You may need to create these tables first");
    }
  } catch (error) {
    console.error("❌ Error setting up tables:", error);
  }
}

// Run setup
setupPurchasingTables();
