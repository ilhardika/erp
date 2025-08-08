require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function cleanup() {
  try {
    await sql`DELETE FROM purchase_order_items WHERE po_id IN (SELECT id FROM purchase_orders WHERE po_number = 'PO-001')`;
    await sql`DELETE FROM purchase_orders WHERE po_number = 'PO-001'`;
    console.log("✅ Old PO-001 data cleaned up");
  } catch (error) {
    console.log("ℹ️ No old PO-001 data found or error:", error.message);
  }
}

cleanup();
