import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Get available customers, products, and users for sample data
    const customers = await sql`SELECT id FROM customers LIMIT 5`;
    const products = await sql`SELECT id, price FROM products LIMIT 10`;
    const users =
      await sql`SELECT id FROM users WHERE role = 'admin' OR role = 'sales' LIMIT 3`;

    if (customers.length === 0 || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No customers or products found. Please add customers and products first.",
        },
        { status: 400 }
      );
    }

    // Sample sales orders data
    const sampleOrders = [
      {
        customer_id: customers[0]?.id,
        salesperson_id: users[0]?.id || null,
        order_date: "2025-08-01",
        delivery_date: "2025-08-05",
        status: "delivered",
        notes: "Pesanan reguler bulanan",
        shipping_address: "Jakarta Pusat, DKI Jakarta",
        terms_conditions: "Pembayaran 30 hari setelah pengiriman",
      },
      {
        customer_id: customers[1]?.id || customers[0]?.id,
        salesperson_id: users[1]?.id || users[0]?.id || null,
        order_date: "2025-08-03",
        delivery_date: "2025-08-08",
        status: "processing",
        notes: "Rush order - prioritas tinggi",
        shipping_address: "Bandung, Jawa Barat",
        terms_conditions: "COD - Cash On Delivery",
      },
      {
        customer_id: customers[2]?.id || customers[0]?.id,
        salesperson_id: users[0]?.id || null,
        order_date: "2025-08-05",
        delivery_date: "2025-08-10",
        status: "confirmed",
        notes: "Pesanan untuk event spesial",
        shipping_address: "Surabaya, Jawa Timur",
        terms_conditions: "Pembayaran transfer sebelum pengiriman",
      },
      {
        customer_id: customers[3]?.id || customers[0]?.id,
        salesperson_id: users[1]?.id || users[0]?.id || null,
        order_date: "2025-08-06",
        delivery_date: "2025-08-12",
        status: "draft",
        notes: "Menunggu konfirmasi stok",
        shipping_address: "Yogyakarta, DI Yogyakarta",
        terms_conditions: "Pembayaran 14 hari setelah pengiriman",
      },
      {
        customer_id: customers[4]?.id || customers[0]?.id,
        salesperson_id: users[2]?.id || users[0]?.id || null,
        order_date: "2025-08-07",
        delivery_date: "2025-08-15",
        status: "shipped",
        notes: "Pengiriman via ekspedisi khusus",
        shipping_address: "Medan, Sumatera Utara",
        terms_conditions: "Pembayaran lunas sebelum pengiriman",
      },
    ];

    // Check existing orders to determine starting number
    const existingOrders = await sql`
      SELECT order_number FROM sales_orders 
      WHERE order_number LIKE 'SO-2025-%' 
      ORDER BY order_number DESC LIMIT 1
    `;

    let orderNumber = 2; // Start from 2 since 0001 exists
    if (existingOrders.length > 0) {
      const lastNumber = existingOrders[0].order_number.split("-")[2];
      orderNumber = parseInt(lastNumber) + 1;
    }

    const createdOrders = [];

    // Create sample orders
    for (const order of sampleOrders) {
      const orderNum = `SO-2025-${String(orderNumber).padStart(4, "0")}`;

      // Calculate sample items and totals
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const selectedProducts = products.slice(0, numItems);

      let subtotal = 0;
      const orderItems = selectedProducts.map((product) => {
        const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 quantity
        const unitPrice = parseFloat(product.price);
        const totalPrice = quantity * unitPrice;
        subtotal += totalPrice;

        return {
          product_id: product.id,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
        };
      });

      const discountPercentage =
        Math.random() < 0.3 ? Math.floor(Math.random() * 10) + 5 : 0; // 30% chance of 5-15% discount
      const discountAmount = subtotal * (discountPercentage / 100);
      const afterDiscount = subtotal - discountAmount;
      const taxPercentage = 10;
      const taxAmount = afterDiscount * (taxPercentage / 100);
      const shippingCost =
        Math.random() < 0.5 ? Math.floor(Math.random() * 25000) + 10000 : 0; // 50% chance of shipping cost
      const totalAmount = afterDiscount + taxAmount + shippingCost;

      // Insert order
      const insertedOrder = await sql`
        INSERT INTO sales_orders (
          order_number, customer_id, salesperson_id, order_date, delivery_date, 
          status, subtotal, discount_amount, discount_percentage, 
          tax_amount, tax_percentage, total_amount, shipping_cost,
          notes, terms_conditions, shipping_address
        ) VALUES (
          ${orderNum}, ${order.customer_id}, ${order.salesperson_id}, 
          ${order.order_date}, ${order.delivery_date}, ${order.status},
          ${subtotal}, ${discountAmount}, ${discountPercentage},
          ${taxAmount}, ${taxPercentage}, ${totalAmount}, ${shippingCost},
          ${order.notes}, ${order.terms_conditions}, ${order.shipping_address}
        ) RETURNING id, order_number
      `;

      const orderId = insertedOrder[0].id;

      // Insert order items
      for (const item of orderItems) {
        await sql`
          INSERT INTO sales_order_items (
            order_id, product_id, quantity, unit_price, total_price
          ) VALUES (
            ${orderId}, ${item.product_id}, ${item.quantity}, 
            ${item.unit_price}, ${item.total_price}
          )
        `;
      }

      createdOrders.push({
        id: orderId,
        order_number: orderNum,
        items_count: orderItems.length,
        total_amount: totalAmount,
      });

      orderNumber++;
    }

    return NextResponse.json({
      success: true,
      message: "Sample sales orders created successfully",
      data: {
        orders_created: createdOrders.length,
        orders: createdOrders,
        note: "Sample data includes various statuses and configurations",
      },
    });
  } catch (error) {
    console.error("Error creating sample sales orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create sample sales orders",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
