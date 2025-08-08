const { sql } = require("./src/lib/neon.js");

async function checkTableStructure() {
  try {
    // Check if the column exists
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'purchase_orders' 
      AND column_name IN ('discount_percentage', 'discount_amount', 'tax_percentage', 'tax_amount')
    `;

    console.log("Purchase orders table columns:", result);

    // Also check the full table structure
    const fullStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'purchase_orders'
      ORDER BY ordinal_position
    `;

    console.log("Full table structure:", fullStructure);
  } catch (error) {
    console.error("Error checking table structure:", error.message);
  }

  process.exit(0);
}

checkTableStructure();
