require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function seedPurchaseOrders() {
  try {
    console.log("🌱 Seeding purchase orders...");

    // First, get suppliers and products
    const suppliers =
      await sql`SELECT id, name FROM suppliers ORDER BY id LIMIT 3`;
    const products =
      await sql`SELECT id, name, code FROM products ORDER BY id LIMIT 5`;

    if (suppliers.length === 0 || products.length === 0) {
      console.log("❌ Please ensure suppliers and products exist first");
      return;
    }

    console.log(
      `Found ${suppliers.length} suppliers and ${products.length} products`
    );

    // Sample purchase orders data
    const purchaseOrders = [
      {
        po_number: "PO-2025-001",
        supplier_id: suppliers[0].id,
        order_date: "2025-01-15",
        expected_date: "2025-01-25",
        status: "draft",
        notes: "Initial office supply order for Q1 2025",
        subtotal: 2500000,
        tax_amount: 275000,
        total_amount: 2775000,
        items: [
          {
            product_id: products[0].id,
            quantity: 50,
            unit_cost: 25000,
            discount_amount: 0,
            discount_percentage: 0,
            notes: "Bulk order discount applied",
          },
          {
            product_id: products[1].id,
            quantity: 25,
            unit_cost: 45000,
            discount_amount: 50000,
            discount_percentage: 0,
            notes: "Premium quality",
          },
        ],
      },
      {
        po_number: "PO-2025-002",
        supplier_id: suppliers[1].id,
        order_date: "2025-01-20",
        expected_date: "2025-02-05",
        status: "pending_approval",
        notes: "IT equipment upgrade - requires management approval",
        subtotal: 15000000,
        tax_amount: 1650000,
        total_amount: 16650000,
        items: [
          {
            product_id: products[2].id,
            quantity: 10,
            unit_cost: 800000,
            discount_percentage: 5,
            discount_amount: 0,
            notes: "Volume discount negotiated",
          },
          {
            product_id: products[3].id,
            quantity: 5,
            unit_cost: 1400000,
            discount_percentage: 0,
            discount_amount: 100000,
            notes: "High-end specification",
          },
        ],
      },
      {
        po_number: "PO-2025-003",
        supplier_id: suppliers[2] ? suppliers[2].id : suppliers[0].id,
        order_date: "2025-01-22",
        expected_date: "2025-02-10",
        status: "approved",
        notes: "Regular monthly supplies order - approved by management",
        subtotal: 5750000,
        tax_amount: 632500,
        total_amount: 6382500,
        items: [
          {
            product_id: products[4] ? products[4].id : products[0].id,
            quantity: 100,
            unit_cost: 35000,
            discount_percentage: 10,
            discount_amount: 0,
            notes: "Seasonal discount",
          },
          {
            product_id: products[1].id,
            quantity: 30,
            unit_cost: 75000,
            discount_amount: 75000,
            discount_percentage: 0,
            notes: "Special promotion",
          },
        ],
      },
      {
        po_number: "PO-2025-004",
        supplier_id: suppliers[1].id,
        order_date: "2025-01-25",
        expected_date: "2025-02-15",
        status: "received",
        notes: "Emergency procurement - delivered ahead of schedule",
        subtotal: 3200000,
        tax_amount: 352000,
        total_amount: 3552000,
        items: [
          {
            product_id: products[0].id,
            quantity: 80,
            unit_cost: 40000,
            discount_percentage: 0,
            discount_amount: 0,
            notes: "Standard delivery",
          },
        ],
      },
    ];

    // Insert purchase orders
    for (const po of purchaseOrders) {
      console.log(`Creating purchase order: ${po.po_number}`);

      // Insert purchase order
      const [purchaseOrder] = await sql`
        INSERT INTO purchase_orders (
          po_number, supplier_id, order_date, expected_date, status, notes,
          subtotal, tax_amount, total_amount, created_by
        ) VALUES (
          ${po.po_number}, ${po.supplier_id}, ${po.order_date}, ${po.expected_date}, 
          ${po.status}, ${po.notes}, ${po.subtotal}, ${po.tax_amount}, ${po.total_amount}, 1
        ) RETURNING id
      `;

      // Insert purchase order items
      for (const item of po.items) {
        const total_cost =
          item.unit_cost * item.quantity -
          (item.discount_amount || 0) -
          (item.unit_cost * item.quantity * (item.discount_percentage || 0)) /
            100;

        await sql`
          INSERT INTO purchase_order_items (
            po_id, product_id, quantity, unit_cost, discount_amount, 
            discount_percentage, total_cost, notes
          ) VALUES (
            ${purchaseOrder.id}, ${item.product_id}, ${item.quantity}, 
            ${item.unit_cost}, ${item.discount_amount || 0}, ${
          item.discount_percentage || 0
        }, 
            ${total_cost}, ${item.notes}
          )
        `;
      }
    }

    console.log("✅ Purchase orders seeded successfully!");
    console.log("📊 Created purchase orders:");
    purchaseOrders.forEach((po) => {
      console.log(
        `   - ${po.po_number} (${po.status}) - ${new Intl.NumberFormat(
          "id-ID",
          { style: "currency", currency: "IDR" }
        ).format(po.total_amount)}`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding purchase orders:", error);
  }
}

seedPurchaseOrders();
