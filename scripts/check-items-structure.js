const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function checkPurchaseOrderItems() {
  try {
    console.log("🔍 Checking purchase_order_items table structure...");

    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'purchase_order_items' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    console.log("📦 Purchase Order Items table structure:");
    columns.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${
          col.is_nullable === "NO" ? "NOT NULL" : ""
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error checking database:", error);
  }
}

checkPurchaseOrderItems();
