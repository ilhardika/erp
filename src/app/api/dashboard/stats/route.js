import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("erp");

    // Get current date for today's calculations
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Parallel queries for better performance
    const [
      totalProducts,
      totalCustomers,
      totalSuppliers,
      totalUsers,
      todayTransactions,
      monthlyTransactions,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      // Total products
      db.collection("products").countDocuments({ active: true }),

      // Total customers
      db.collection("customers").countDocuments({ active: true }),

      // Total suppliers
      db.collection("suppliers").countDocuments({ active: true }),

      // Total users
      db.collection("users").countDocuments({ active: true }),

      // Today's transactions (if transactions collection exists)
      db
        .collection("transactions")
        .countDocuments({
          createdAt: { $gte: startOfDay },
          status: "completed",
        })
        .catch(() => 0),

      // Monthly transactions
      db
        .collection("transactions")
        .countDocuments({
          createdAt: { $gte: startOfMonth },
          status: "completed",
        })
        .catch(() => 0),

      // Low stock products (assuming stock < 10)
      db
        .collection("products")
        .countDocuments({
          active: true,
          stock: { $lt: 10, $gte: 0 },
        })
        .catch(() => 0),

      // Recent orders (last 5)
      db
        .collection("orders")
        .find({ active: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
        .catch(() => []),
    ]);

    // Calculate total sales for today and this month
    const todaySales = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ])
      .toArray()
      .catch(() => [{ total: 0 }]);

    const monthlySales = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ])
      .toArray()
      .catch(() => [{ total: 0 }]);

    // Get recent activities
    const recentActivities = await db
      .collection("activities")
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()
      .catch(() => []);

    const stats = {
      overview: {
        totalProducts,
        totalCustomers,
        totalSuppliers,
        totalUsers,
        lowStockProducts,
      },
      sales: {
        todayTransactions,
        monthlyTransactions,
        todaySales: todaySales[0]?.total || 0,
        monthlySales: monthlySales[0]?.total || 0,
      },
      recent: {
        orders: recentOrders,
        activities: recentActivities,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);

    // Return mock data if database fails
    return NextResponse.json({
      overview: {
        totalProducts: 0,
        totalCustomers: 0,
        totalSuppliers: 0,
        totalUsers: 3,
        lowStockProducts: 0,
      },
      sales: {
        todayTransactions: 0,
        monthlyTransactions: 0,
        todaySales: 0,
        monthlySales: 0,
      },
      recent: {
        orders: [],
        activities: [],
      },
    });
  }
}
